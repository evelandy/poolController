from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, request, make_response, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from functools import wraps
import RPi.GPIO as GPIO
from time import sleep, strftime
import datetime
import schedule
import requests
import json
import jwt
import os

from urllib.parse import unquote

import atexit
from apscheduler.schedulers.background import BackgroundScheduler, BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger
scheduler = BlockingScheduler()
from threading import Timer, Event, Thread


import tempRun
from tempChk import filter, get_fahrenheit_val, run

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'MainSecretKey'

db = SQLAlchemy(app)
CORS(app)

HOST = '192.168.1.142'
PORT = '5000'
DEBUG = True

TP = 21 # Test pin
PUMP_PIN = 16
CLEANER_PIN = 18
LIGHT_PIN = 23
AUX1_PIN = 11


# login user info
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fname = db.Column(db.String(80))
    lname = db.Column(db.String(80))
    username = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(120))
    email = db.Column(db.String(80), unique=True)
    address = db.Column(db.String(80))
    add2 = db.Column(db.String(10))
    city = db.Column(db.String(40))
    sta = db.Column(db.String(4))
    zipCode = db.Column(db.Integer)
    phone = db.Column(db.Integer, unique=True)
    admin = db.Column(db.Boolean)

    def __init__(self, fname, lname, username, password, email, address,
                add2, city, sta, zipCode, phone, admin):
        self.fname = fname
        self.lname = lname
        self.username = username
        self.password = password
        self.email = email
        self.address = address
        self.add2 = add2
        self.city = city
        self.sta = sta
        self.zipCode = zipCode
        self.phone = phone
        self.admin = admin


# settings and controls
class p_ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pHr = db.Column(db.Integer)
    pMin = db.Column(db.Integer)
    pMid = db.Column(db.String(2))
    user_id = db.Column(db.Integer)


# pump switch status
class p_status(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pswitch = db.Column(db.Boolean)
    user_id = db.Column(db.Integer)


# cleaner timer
class c_ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cHr = db.Column(db.Integer)
    cMin = db.Column(db.Integer)
    cMid = db.Column(db.String(2))
    user_id = db.Column(db.Integer)


# cleaner switch status
class c_status(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cswitch = db.Column(db.Boolean)
    user_id = db.Column(db.Integer)


# lights timer
class l_ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lHr = db.Column(db.Integer)
    lMin = db.Column(db.Integer)
    lMid = db.Column(db.String(2))
    user_id = db.Column(db.Integer)


# lights switch status
class l_status(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lswitch = db.Column(db.Boolean)
    user_id = db.Column(db.Integer)


# a1 timer
class a1_ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    a1Hr = db.Column(db.Integer)
    a1Min = db.Column(db.Integer)
    a1Mid = db.Column(db.String(2))
    user_id = db.Column(db.Integer)


# a1 switch status
class a1_status(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    a1switch = db.Column(db.Boolean)
    user_id = db.Column(db.Integer)


# temp trigger and switch
class temp_trigger(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    triggerTemp = db.Column(db.Integer)
    triggerSwitch = db.Column(db.Boolean)
    user_id = db.Column(db.Integer)


# temp timer
class t_ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tHr = db.Column(db.Integer)
    tMin = db.Column(db.Integer)
    tMid = db.Column(db.String(2))
    user_id = db.Column(db.Integer)


# create token and check creds
def token_req(f):
    @wraps(f)
    def decorate(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Missing Token'}), 404
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'])
            current_user = User.query.filter_by(id=data['id']).first()
        except:
            return jsonify({"message": "Invalid Token"}), 401
        return f(current_user, *args, **kwargs)
    return decorate


# check if server is running and configured at correct ip
@app.route('/api/v1/check', methods=['GET'])
def server_check():
    return jsonify('Good'), 200


# login
@app.route('/api/v1/login', methods=['POST'])
def login():
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return make_response('Could not verify auth', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
    user = User.query.filter_by(username=auth.username).first()
    if not user:
        return make_response('Could not verify user', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
    if check_password_hash(user.password, auth.password):
        token = jwt.encode({'id': user.id, 'fname': user.fname, 'lname': user.lname, 'username': user.username,
                            'password': user.password, 'email': user.email, 'address': user.address,
                            'add2': user.add2, 'city': user.city, 'sta': user.sta, 'zipCode': user.zipCode,
                            'phone': user.phone, 'admin': user.admin,
                            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=120)},
                           app.config['SECRET_KEY'])
        return jsonify({'token': token.decode('UTF-8'), 'fname': user.fname, 'lname': user.lname,
                        'username': user.username, 'password': user.password, 'email': user.email,
                        'address': user.address, 'add2': user.add2, 'city': user.city, 'sta': user.sta,
                        'zipCode': user.zipCode, 'phone': user.phone, 'id': user.id, 'admin': user.admin})
    return make_response('Could not verify password', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})


# add/create users fix on test update                                                                                              
@app.route('/api/v1/user', methods=['POST'])
def add_user():
    data = request.get_json()
    hash_password = generate_password_hash(data['password'], method='sha256')
    new_user = User(fname=data['fname'],lname=data['lname'], username=data['username'], password=hash_password,
        email=data['email'], address=data['address'], add2=data['add2'], city=data['city'], sta=data['sta'],
            zipCode=data['zipCode'], phone=data['phone'],  admin=False)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "new user added"}), 201


# view user
@app.route('/api/v1/user/<user_id>', methods=['GET'])
@token_req
def user(current_user):
    user_list = User.query.filter_by(user_id= current_user.id).first()

    if not user:
        return jsonify({"message": "that username does not exist"}), 404

    output = []
    
    for user in user_list:
        user_data = {}
        user_data['id'] = user.id
        user_data['fname'] = user.fname
        user_data['lname'] = user.lname
        user_data['username'] = user.username
        user_data['password'] = user.password
        user_data['email'] = user.email
        user_data['address'] = user.address
        user_data['add2'] = user.add2
        user_data['city'] = user.city
        user_data['sta'] = user.sta
        user_data['zipCode'] = user.zipCode
        user_data['phone'] = user.phone
        user_data['admin'] = user.admin

    return jsonify(user_data)


#edit username
@app.route('/api/v1/user/edituname/<username>/<user_id>', methods=['PUT'])
@token_req
def edit_username(current_user, username, user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'message': 'user does not exist'}), 404
    user.username = username
    db.session.commit()
    return jsonify({'message': 'username updated!'}), 202


# edits users' password
@app.route('/api/v1/user/editpass/<password>/<user_id>', methods=['PUT'])
@token_req
def edit_password(current_user, password, user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'message': 'user does not exist'}), 404
    user.password = generate_password_hash(password, method='sha256')
    db.session.commit()
    return jsonify({'message': 'password updated!'}), 202


# edits users' first name + last name
@app.route('/api/v1/editname/<fname>/<lname>/<user_id>', methods=['PUT'])
@token_req
def edit_name(current_user, fname, lname, user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'message': 'user does not exist'}), 404
    user.fname = fname
    user.lname = lname
    db.session.commit()
    return jsonify({'message': 'name updated!'}), 202


# edits users' email
@app.route('/api/v1/editemail/<email>/<user_id>', methods=['PUT'])
@token_req
def edit_email(current_user, email, user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'message': 'user does not exist'}), 404
    user.email = email
    db.session.commit()
    return jsonify({'message': 'email updated!'}), 202


# edits users' address
@app.route('/api/v1/editaddress/<user_id>', methods=['PUT'])
@token_req
def edit_address(current_user, user_id):
    user = User.query.filter_by(id=user_id).first()
    data = request.get_json()
    if not user:
        return jsonify({'message': 'user does not exist'}), 404
    user.address = data['address']
    user.add2 = data['add2']
    user.city = data['city']
    user.sta = data['sta']
    user.zipCode = data['zipCode']
    db.session.commit()
    return jsonify({'message': 'address updated!'}), 202


# edits users' phone
@app.route('/api/v1/editphone/<phone>/<user_id>', methods=['PUT'])
@token_req
def edit_phone(current_user, phone, user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'message': 'user does not exist'}), 404
    user.phone = phone
    db.session.commit()
    return jsonify({'message': 'phone number updated!'}), 202


def weather_trigger():
    user_info = User.query.filter_by(id=1).first()
    user_city = user_info.city
    api_key = '5490a59fae143d65082c3beeaeaf6982'
    res = requests.get(
        url='http://api.openweathermap.org/data/2.5/weather?q={}&appid={}&units=imperial'
            .format(user_city, api_key))
    data = json.loads(res.content)
    temp = data['main']['temp']
    lat = data['coord']['lat']
    lon = data['coord']['lon']

    forecastRes = requests.get(
        url='http://api.openweathermap.org/data/2.5/onecall?lat={}&lon={}&appid={}'.format(lat, lon, api_key))
    forecastData = json.loads(forecastRes.content)
    forecastTemp = forecastData ['daily'][0]['temp']['day']
    if temp > forecastTemp - 459.67:
        if temp <= 32:
            run_time = 10
            trigger_pmp_on(run_time, temp)
            return run_time
        else:
            temp_round = round(temp)
            run_time = temp_round // 10
            trigger_pmp_on(run_time, temp)
            return run_time
    else:
        if forecastTemp - 459.67 <= 32:
            run_time = 10
            trigger_pmp_on(run_time, forecastTemp)
            return run_time
        else:
            forecastTemp -= 459.67
            temp_round = round(forecastTemp)
            run_time = temp_round // 10
            trigger_pmp_on(run_time, forecastTemp)
            return run_time


def trigger_pmp_on(run_time, temp):
    now = datetime.datetime.now()
    curr_hr = now.strftime("%H")
    curr_min = now.strftime("%M")
    timeHold = 0
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)

    hour_to_sec = run_time * 3600
    timeHold += hour_to_sec
    for sec in range(timeHold):
        if timeHold == 0:
            GPIO.output(TP, GPIO.LOW)
            return jsonify({'msg': 'trigger pump off'}), 200
        else:
            timeHold -= 1
            if timeHold == 7200:
                user_info = User.query.filter_by(id=1).first()
                user_city = user_info.city
                api_key = '5490a59fae143d65082c3beeaeaf6982'
                res = requests.get(
                    url='http://api.openweathermap.org/data/2.5/weather?q={}&appid={}&units=imperial'
                        .format(user_city, api_key))
                data = json.loads(res.content)
                updated_temp = data['main']['temp']
                if round(updated_temp) >= round(temp) - 5 and round(updated_temp) <= round(temp) + 5:
                    sleep(1)
                else:
                    if round(updated_temp) - round(temp) > 0:
                        timeHold += round(updated_temp) - round(temp)
                        sleep(1)
                    else:
                        timeHold += round(temp) - round(updated_temp)
                        sleep(1)
            else:
                sleep(1)


@app.route('/api/v1/sch_t_on/<hr>/<mn>', methods=['GET'])
@token_req
def sch_t_on(current_user, hr, mn):
    with app.app_context():
        schedule.CancelJob
        schedule.clear()
        run_time = "{}:{}".format(hr, mn)
        pmp_off()
        schedule.every().day.at(run_time).do(weather_trigger)
        w = Thread(target=weather_trigger_runner)
        w.start()
        return jsonify({"msg": "true"}), 200


def weather_trigger_runner():
    while True:
        schedule.run_pending()
        sleep(1)


@app.route('/api/v1/trigger_temp/<tmp>', methods=['GET'])
@token_req
def trigger_temp(current_user, tmp):
    ttemp = temp_trigger.query.all()
    if ttemp:
        conn = sqlite3.connect('data.db')
        sql = "DELETE FROM temp_trigger"
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()

        data = request.get_json()
        new_trigger_temp = temp_trigger(triggerTemp=data['triggerTemp'], triggerSwitch=False, user_id=current_user.id)
        db.session.add(new_trigger_temp)
        db.session.commit()
        ttemp = temp_trigger.query.all()
        tmp = ttemp[0].triggerTemp
        tempRun.run(tmp)
        return jsonify({'msg': tmp}), 200
    else:
        data = request.get_json()
        new_trigger_temp = temp_trigger(triggerTemp=data['triggerTemp'], triggerSwitch=False, user_id=current_user.id)
        db.session.add(new_trigger_temp)
        db.session.commit()
        ttemp = temp_trigger.query.all()
        tmp = ttemp[0].triggerTemp
        tempRun.run(tmp)
        return jsonify({'msg': tmp}), 200


# show saved trigger time
@app.route('/api/v1/show_trigger_temp', methods=['GET'])
@token_req
def show_trigger_temp(current_user):
    ttemp = temp_trigger.query.all()

    tdata = {}
    tdata['triggerTemp'] = ttemp[0].triggerTemp

    return jsonify(tdata), 200


@app.route('/api/v1/set_trigger_time', methods=['POST'])
@token_req
def set_trigger_time(current_user):
    ttime = t_ctrl.query.all()
    if ttime:
        conn = sqlite3.connect('data.db')
        sql = "DELETE FROM t_ctrl where user_id={}".format(current_user.id)
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()

        data = request.get_json()
        new_t_time = t_ctrl(tHr=data['tHr'], tMin=data['tMin'], tMid=data['tMid'], user_id=current_user.id)
        db.session.add(new_t_time)
        db.session.commit()
        return jsonify({'message': 'temp time trigger saved'}), 201
    else:
        data = request.get_json()
        new_t_time = t_ctrl(tHr=data['tHr'], tMin=data['tMin'], tMid=data['tMid'], user_id=current_user.id)
        db.session.add(new_t_time)
        db.session.commit()
        return jsonify({'message': 'temp time trigger saved'}), 201


@app.route('/api/v1/show_t_time')
@token_req
def show_t_time(current_user):
    ttime = t_ctrl.query.filter_by(user_id=current_user.id).all()

    defaultOutput = []
    defaultTtime = {}
    defaultTtime['tHr'] = 10
    defaultTtime['tMin'] = 10
    defaultTtime['tMid'] = 'AM'
    defaultOutput.append(defaultTtime)

    if not ttime:
        return jsonify({'ttime': defaultOutput}), 200

    output = []
    ttime_dict = {}
    ttime_dict['tHr'] = ttime[0].tHr
    ttime_dict['tMin'] = ttime[0].tMin
    ttime_dict['tMid'] = ttime[0].tMid
    output.append(ttime_dict)
    return jsonify({'ttime': output}), 200


@app.route('/api/v1/temp', methods=['GET'])
@token_req
def temp(current_user):
    curr_temp = run()
    return jsonify(curr_temp), 200


# manual pump controls
@app.route('/api/v1/pump_on', methods=['GET'])
def pump_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)

    ch_on = GPIO.input(TP)
#    pstatus = p_status.query.all()
#    pdata = {}
#    if pstatus[0].pswitch == False:
#        pstatus[0].pswitch = True
#        db.session.commit()
#        pdata['pswitch'] = pstatus[0].pswitch

    if ch_on:
        return jsonify({'msg': 'pump on'}), 200
    else:
        return jsonify({'msg': 'pump off'}), 200


@app.route('/api/v1/pump_off', methods=['GET'])
def pump_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()

    return jsonify({'msg': 'pump off'}), 200


@app.route('/api/v1/pump_disp', methods=['GET'])
def pump_disp():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(TP, GPIO.OUT)
    ch_on = GPIO.input(TP)
    if ch_on:
        GPIO.output(TP, GPIO.LOW)
        GPIO.cleanup()
        return jsonify({'msg': 'pump off'}), 201
    else:
        GPIO.output(TP, GPIO.HIGH)
        return jsonify({'msg': 'pump on'}), 200


# schedule pump controls
def pmp_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)
    return jsonify({'msg': 'pump scheduled'}), 200


def pmp_off():
    schedule.CancelJob
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()
    return jsonify({'msg': 'pump sch off'}), 200


# add time for schedule pump
@app.route('/api/v1/add_p_time', methods=['PUT'])
def add_p_time():
    # ptime = p_ctrl.query.filter_by(id=1).first()
    ptime = p_ctrl.query.all()
    if ptime:
        conn = sqlite3.connect('data.db')
        sql = "DELETE FROM p_ctrl"
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()

        data = request.get_json()
        new_p_time = p_ctrl(pHr=data['pHr'], pMin=data['pMin'], pMid=data['pMid'])
        db.session.add(new_p_time)
        db.session.commit()
        return jsonify({'message': 'pump time schedule saved'}), 201
    else:
        data = request.get_json()
        new_p_time = p_ctrl(pHr=data['pHr'], pMin=data['pMin'], pMid=data['pMid'])
        db.session.add(new_p_time)
        db.session.commit()
        return jsonify({'message': 'pump time schedule saved'}), 201


# show saved pump time
@app.route('/api/v1/show_p_time', methods=['GET'])
def show_p_time():
    ptime = p_ctrl.query.all()

    pdata = {}
    pdata['pHr'] = ptime[0].pHr
    pdata['pMin'] = ptime[0].pMin
    pdata['pMid'] = ptime[0].pMid

    return jsonify({'message': pdata}), 200


#@app.route('/api/v1/sch_p_on/<tm>', methods=['GET'])
#def sch_p_on(tm=4):
#    t = Event()
#    WAIT_TIME = int(tm)
#    while not t.wait(WAIT_TIME):
#        pmp_on()
#        break
#    sleep(5)    # this is the timer that needs to be set to automatically turn the pump off ie(60 minutes)
#    pmp_off()
#    return jsonify({'msg': 'true'}), 200


def prunner():
    while True:
        schedule.run_pending()
        sleep(1)


@app.route('/api/v1/sch_p_on/<hr>/<mn>', methods=['GET'])
def sch_p_on(hr, mn):
    with app.app_context():
        run_time = "{}:{}".format(hr, mn)
        schedule.clear()
        pmp_off()
#        schedule.every(int(mn)).seconds.do(pmp_on)
        schedule.every().day.at(run_time).do(pmp_on)
        t = Thread(target=prunner)
        t.start()

        hour_now = strftime('%H')
        min_now = strftime('%M')
        sub_hrs = int(hour_now) - int(hr)
        offset = 24 - sub_hrs
        hour_to_sec = (int(hr) * 3600)
        min_to_sec = (int(mn) * 60)
        hour_and_min = (hour_to_sec + min_to_sec)
        total_sec = (36000 + hour_and_min - offset)  # the pump is set to run for 10 hours from the start

        sleep(total_sec)
#        sleep(15)
#        schedule.clear()
        pmp_off()
        return({"msg": "true"}), 200


# manual cleaner controls
@app.route('/api/v1/clean_on', methods=['GET'])
def clean_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)

    return jsonify({'msg': 'cleaner on'}), 200


@app.route('/api/v1/clean_off', methods=['GET'])
def clean_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()

    return jsonify({'msg': 'cleaner off'}), 200


# schedule cleaner controls
def cln_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)
    return jsonify({'msg': 'cleaner scheduled'}), 200


def cln_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()
    return jsonify({'msg': 'clean sch off'}), 200


# add time for schedule cleaner
@app.route('/api/v1/add_c_time', methods=['PUT'])
def add_c_time():
    # ctime = c_ctrl.query.filter_by(id=1).first()
    ctime = c_ctrl.query.all()
    if ctime:
        conn = sqlite3.connect('data.db')
        sql = "DELETE FROM c_ctrl"
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()

        data = request.get_json()
        new_c_time = c_ctrl(cHr=data['cHr'], cMin=data['cMin'], cMid=data['cMid'])
        db.session.add(new_c_time)
        db.session.commit()
        return jsonify({'message': 'cleaner time schedule saved'}), 201
    else:
        data = request.get_json()
        new_c_time = c_ctrl(cHr=data['cHr'], cMin=data['cMin'], cMid=data['cMid'])
        db.session.add(new_c_time)
        db.session.commit()
        return jsonify({'message': 'cleaner time schedule saved'}), 201


# show saved cleaner time
@app.route('/api/v1/show_c_time', methods=['GET'])
def show_c_time():
    ctime = c_ctrl.query.all()

    cdata = {}
    cdata['cHr'] = ctime[0].cHr
    cdata['cMin'] = ctime[0].cMin
    cdata['cMid'] = ctime[0].cMid

    return jsonify({'message': cdata}), 200


def crunner():
    while True:
        schedule.run_pending()
        sleep(1)


@app.route('/api/v1/sch_c_on/<hr>/<mn>', methods=['GET'])
def sch_c_on(hr, mn):
    with app.app_context():
        run_time = "{}:{}".format(hr, mn)
        schedule.clear()
        cln_off()
        schedule.every().day.at(run_time).do(cln_on)
        t = Thread(target=crunner)
        t.start()

        hour_now = strftime('%H')
        min_now = strftime('%M')
        sub_hrs = int(hour_now) - int(hr)
        offset = 24 - sub_hrs
        hour_to_sec = (int(hr) * 3600)
        min_to_sec = (int(mn) * 60)
        hour_and_min = (hour_to_sec + min_to_sec)
        total_sec = (21600 + hour_and_min - offset)  # the cleaner is set to shut off 6 hours after start

        sleep(total_sec)
#        schedule.clear()
        cln_off()
        return jsonify({"msg": "true"}), 200
#    t = Event()
#    WAIT_TIME = int(tm)
#    while not t.wait(WAIT_TIME):
#        cln_on()
#        break
#    return "OK", 200



"""
@app.route('/api/v1/sch_c_off/<tm>', methods=['GET'])
def sch_c_off(tm=4):
    t = Event()
    WAIT_TIME = int(tm)
    while not t.wait(WAIT_TIME):
        cln_off()
        break
    return "OK", 200
"""


# manual light controls
@app.route('/api/v1/light_on', methods=['GET'])
def light_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)

    return jsonify({'msg': 'lights on'}), 200


@app.route('/api/v1/light_off', methods=['GET'])
def light_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()

    return jsonify({'msg': 'lights off'}), 200


# schedule light controls
def lgt_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)
    return jsonify({'msg': 'scheduled lights'}), 200


def lgt_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()
    return jsonify({'msg': 'light sch off'}), 200


# add time for schedule lights
@app.route('/api/v1/add_l_time', methods=['PUT'])
def add_l_time():
    # ltime = l_ctrl.query.filter_by(id=1).first()
    ltime = l_ctrl.query.all()
    if ltime:
        conn = sqlite3.connect('data.db')
        sql = "DELETE FROM l_ctrl"
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()

        data = request.get_json()
        new_l_time = l_ctrl(lHr=data['lHr'], lMin=data['lMin'], lMid=data['lMid'])
        db.session.add(new_l_time)
        db.session.commit()
        return jsonify({'message': 'light time schedule saved'}), 201
    else:
        data = request.get_json()
        new_l_time = l_ctrl(lHr=data['lHr'], lMin=data['lMin'], lMid=data['lMid'])
        db.session.add(new_l_time)
        db.session.commit()
        return jsonify({'message': 'light time schedule saved'}), 201


# show saved light time
@app.route('/api/v1/show_l_time', methods=['GET'])
def show_l_time():
    ltime = l_ctrl.query.all()

    ldata = {}
    ldata['lHr'] = ltime[0].lHr
    ldata['lMin'] = ltime[0].lMin
    ldata['lMid'] = ltime[0].lMid

    return jsonify({'message': ldata}), 200


def lrunner():
    while True:
        schedule.run_pending()
        sleep(1)


@app.route('/api/v1/sch_l_on/<hr>/<mn>', methods=['GET'])
def sch_l_on(hr, mn):
    with app.app_context():
        run_time = "{}:{}".format(hr, mn)
        schedule.clear()
        lgt_off()
        schedule.every().day.at(run_time).do(lgt_on)
        t = Thread(target=lrunner)
        t.start()

        hour_now = strftime('%H')
        min_now = strftime('%M')
        sub_hrs = int(hour_now) - int(hr)
        offset = 24 - sub_hrs
        hour_to_sec = (int(hr) * 3600)
        min_to_sec = (int(mn) * 60)
        hour_and_min = (hour_to_sec + min_to_sec)
        total_sec = (14400 + hour_and_min - offset)  # the lights are set to run for 4 hours from the start

        sleep(total_sec)
#        schedule.clear()
        lgt_off()
        return jsonify({"msg": "true"}), 200


"""
@app.route('/api/v1/sch_l_off/<tm>', methods=['GET'])
def sch_l_off(tm=4):
    t = Event()
    WAIT_TIME = int(tm)
    while not t.wait(WAIT_TIME):
        lgt_off()
        break
    return "OK", 200
"""


# manual aux1 controls
@app.route('/api/v1/aux1_on', methods=['GET'])
def aux1_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)

    return jsonify({'msg': 'aux 1 on'}), 200


@app.route('/api/v1/aux1_off', methods=['GET'])
def aux1_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()

    return jsonify({'msg': 'aux 1 off'}), 200


# schedule aux1 controls
def aux1_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)
    return jsonify({'msg': 'aux 1 scheduled'}), 200


def aux1_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()
    return jsonify({'msg': 'aux1 sch off'}), 200


# add time for schedule aux1
@app.route('/api/v1/add_a1_time', methods=['PUT'])
def add_a1_time():
    # a1time = a1_ctrl.query.filter_by(id=1).first()
    a1time = a1_ctrl.query.all()
    if a1time:
        conn = sqlite3.connect('data.db')
        sql = "DELETE FROM a1_ctrl"
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()

        data = request.get_json()
        new_a1_time = a1_ctrl(a1Hr=data['a1Hr'], a1Min=data['a1Min'], a1Mid=data['a1Mid'])
        db.session.add(new_a1_time)
        db.session.commit()
        return jsonify({'message': 'aux1 time schedule saved'}), 201
    else:
        data = request.get_json()
        new_a1_time = a1_ctrl(a1Hr=data['a1Hr'], a1Min=data['a1Min'], a1Mid=data['a1Mid'])
        db.session.add(new_a1_time)
        db.session.commit()
        return jsonify({'message': 'aux1 time schedule saved'}), 201


# show saved aux1 time
@app.route('/api/v1/show_a1_time', methods=['GET'])
def show_a1_time():
    a1time = a1_ctrl.query.all()

    a1data = {}
    a1data['a1Hr'] = a1time[0].a1Hr
    a1data['a1Min'] = a1time[0].a1Min
    a1data['a1Mid'] = a1time[0].a1Mid

    return jsonify({'message': a1data}), 200


def a1runner():
    while True:
        schedule.run_pending()
        sleep(1)


@app.route('/api/v1/sch_a1_on/<hr>/<mn>', methods=['GET'])
def sch_a1_on(hr, mn):
    with app.app_context():
        run_time = "{}:{}".format(hr, mn)
        schedule.clear()
        aux1_off()
        schedule.every().day.at(run_time).do(aux1_on)
        t = Thread(target=a1runner)
        t.start()

        hour_now = strftime('%H')
        min_now = strftime('%M')
        sub_hrs = int(hour_now) - int(hr)
        offset = 24 - sub_hrs
        hour_to_sec = (int(hr) * 3600)
        min_to_sec = (int(mn) * 60)
        hour_and_min = (hour_to_sec + min_to_sec)
        total_sec = (7200 + hour_and_min - offset)  # aux1 is set to run for 2 hours from the start

        sleep(total_sec)
#        schedule.clear()
        aux1_off()
        return({"msg": "true"}), 200


""" 

                                                                                 LEFT OFF HERE TRYING TO IMPORT TIME AS A LST AND NOT A FULL STRING
@app.route('/api/v1/run_a1_time/<rn_time>', methods=['POST'])
def run_a1_time(rn_time):
    url = unquote(rn_time)
    x = []
    x.append(url)
    print(x)
    return "OK", 200
"""

@app.route('/api/v1/sch_a1_off/<tm>', methods=['GET'])
def sch_a1_off(tm=4):
    t = Event()
    WAIT_TIME = int(tm)
    while not t.wait(WAIT_TIME):
        aux1_off()
        break
    return "OK", 200


# manual aux2 controls
@app.route('/api/v1/aux_2_on', methods=['GET'])
def aux_2_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)

    return jsonify({'msg': 'aux 2 on'}), 200


@app.route('/api/v1/aux_2_off', methods=['GET'])
def aux_2_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()

    return jsonify({'msg': 'aux 2 off'}), 200


# schedule aux2 controls
def aux2_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)
    return jsonify({'msg': 'aux2 scheduled'}), 200


def aux2_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()
    return jsonify({'msg': 'aux2 sch off'}), 200


@app.route('/api/v1/sch_a2_on/<tm>', methods=['GET'])
def sch_a2_on(tm=4):
    t = Event()
    WAIT_TIME = int(tm)
    while not t.wait(WAIT_TIME):
        aux2_on()
        break
    return "OK", 200


@app.route('/api/v1/sch_a2_off/<tm>', methods=['GET'])
def sch_a2_off(tm=4):
    t = Event()
    WAIT_TIME = int(tm)
    while not t.wait(WAIT_TIME):
        aux2_off()
        break
    return "OK", 200


# logout
@app.route('/api/v1/logout', methods=['POST'])
def logout():
    pass


if __name__ == '__main__':
    default = Thread(target=weather_trigger_runner, daemon=True)
    default.start()
    sch_t_on('08', '00')
#    schedule.every().day.at("12:00").do(weather_trigger) # scheduler for weather temp trigger to run every day at certain time
#    x = Thread(target=weather_trigger_runner) # starts a new thread for weather temp trigger
#    x.start() # starts new thread for weather temp trigger
    app.run(HOST)

