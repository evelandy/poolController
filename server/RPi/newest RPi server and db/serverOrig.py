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
import sqlite3
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


# holds restart time for schedule
class p_hold(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pHr = db.Column(db.Integer)
    pMin = db.Column(db.Integer)
    user_id = db.Column(db.Integer)


# holds restart time for temp trigger
class t_hold(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tHr = db.Column(db.Integer)
    tMin = db.Column(db.Integer)
    user_id = db.Column(db.Integer)


# holds restart status for schedule
class sch_restart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    needs_restart = db.Column(db.Boolean)
    user_id = db.Column(db.Integer)


# holds restart status for temp trigger
class temp_restart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    needs_restart = db.Column(db.Boolean)
    user_id = db.Column(db.Integer)



# checks token to make sure it is valid
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
    return jsonify('running'), 200


# login
@app.route('/api/v1/login', methods=['POST'])
def login():
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return make_response("Could not authenticate", 401, {"WWW-Authenticate": 'Basic realm="Login required!"'})
    user = User.query.filter_by(username=auth.username).first()
    if not user:
        return make_response("Could not verify username", 401, {"WWW-Authenticate": 'Basic realm="Login required!"'})
    if check_password_hash(user.password, auth.password):
        token = jwt.encode({'id': user.id, 'fname': user.fname, 'lname': user.lname, 'username': user.username,
                            'password': user.password, 'email': user.email, 'address': user.address,
                            'add2': user.add2, 'city': user.city, 'sta': user.sta, 'zipCode': user.zipCode,
                            'phone': user.phone, 'admin': user.admin,
                            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=120)},
                           app.config['SECRET_KEY'])
        return jsonify({"token": token.decode('UTF-8'), 'id': user.id, 'fname': user.fname, 'lname': user.lname,
                        'username': user.username, 'password': user.password, 'email': user.email,
                        'address': user.address, 'add2': user.add2, 'city': user.city, 'sta': user.sta,
                        'zipCode': user.zipCode, 'phone': user.phone, 'admin': user.admin})
    return make_response('Could not verify password', 401, {"WWW-Authenticate": 'Basic realm="Login required!"'})


################################################################################################################## user
# add/create users
@app.route('/api/v1/user', methods=['POST'])
def add_user():
    data = request.get_json()
    hash_password = generate_password_hash(data['password'], method='sha256')
    new_user = User(fname=data['fname'], lname=data['lname'], username=data['username'], password=hash_password,
                    email=data['email'], address=data['address'], add2=data['add2'], city=data['city'],
                    sta=data['sta'], zipCode=data['zipCode'], phone=data['phone'], admin=False)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "new user added"}), 201


# get user info
@app.route('/api/v1/user/<user_id>', methods=['GET'])
@token_req
def user(current_user):
    user = User.query.filter_by(user_id=current_user.id).first()

    if not user:
        return jsonify({"message": "that user does not exist"}), 404

    output = []
    for usr in user:
        user_data = {}
        user_data['id'] = usr.id
        user_data['fname'] = usr.fname
        user_data['lname'] = usr.lname
        user_data['username'] = usr.username
        user_data['password'] = usr.password
        user_data['email'] = usr.email
        user_data['address'] = usr.address
        user_data['add2'] = usr.add2
        user_data['city'] = usr.city
        user_data['sta'] = usr.sta
        user_data['zipCode'] = usr.zipCode
        user_data['phone'] = usr.phone
        user_data['admin'] = usr.admin
        output.append(user_data)
    return jsonify(output), 200


# edit username
@app.route('/api/v1/user/edituname/<username>/<user_id>', methods=['PUT'])
@token_req
def edit_username(current_user, username, user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"message": "user does not exist"}), 404
    user.username = username
    db.session.commit()
    return jsonify({"message": "username updated"}), 202


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


################################################################################################################## temp
# sends request to RPi server to get water temp then returns the temp result
@app.route('/api/v1/temp', methods=['POST'])
@token_req
def temp(current_user):
    # data = request.get_json()
    # res = requests.get(url='http://{}:{}/api/v1/temp'.format(RPI_IP_ADDR, RPI_PORT),
    #                    headers={'x-access-token': '{}'.format(data)})
    curr_temp = run()
    return jsonify(curr_temp), 200


# @app.route('/api/v1/temp', methods=['GET'])
# @token_req
# def temp(current_user):
#     curr_temp = run()
#     return jsonify(curr_temp), 200


# show switch status for temp trigger
@app.route('/api/v1/temp/tStatus', methods=['GET'])
@token_req
def tStatus(current_user):
    tswitch = temp_trigger.query.filter_by(user_id=current_user.id).first()
    tstatus = tswitch.triggerSwitch
    return jsonify({'msg': tstatus}), 200


# get the time for manual stop of trigger pump on
@app.route('/api/v1/temp/getTriggerTime', methods=['GET'])
@token_req
def getTriggerTime(current_user):
    triggertime = t_ctrl.query.filter_by(user_id=current_user.id).first()
    # full_time = "{}:{}{}".format(triggertime.pHr, triggertime.pMin, triggertime.pMid)
    time_data = {}
    hour = triggertime.tHr
    minute = triggertime.tMin
    mid = triggertime.tMid
    time_data['hour'] = hour
    time_data['minute'] = minute
    time_data['mid'] = mid
    return jsonify(time_data)


# holds restart time for temp trigger
@app.route('/api/v1/temp/holdTriggerTime', methods=['POST'])
@token_req
def holdTriggerTime(current_user):
    holdCheck = t_hold.query.filter_by(user_id=current_user.id).first()
    if holdCheck:
        conn = sqlite3.connect('data.db')
        sql = "DELETE FROM t_hold where user_id={}".format(current_user.id)
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()

        data = request.get_json()
        new_hold_time = t_hold(tHr=data['holdHour'], tMin=data['holdMin'], user_id=current_user.id)
        db.session.add(new_hold_time)
        db.session.commit()
        return jsonify({'message': 'restart time saved'}), 201
    else:
        data = request.get_json()
        new_hold_time = t_hold(tHr=data['holdHour'], tMin=data['holdMin'], user_id=current_user.id)
        db.session.add(new_hold_time)
        db.session.commit()
        return jsonify({'message': 'restart time saved'}), 201


# restarts time picking up where schedule left off when stopped            #restarts time picking up where schedule left off when stopped #restarts time picking up where schedule left off when stopped #restarts time picking up where schedule left off when stopped
@app.route('/api/v1/temp/restartTriggerTime/<hr>/<mn>', methods=['GET', 'POST'])
@token_req
def restartTriggerTime(current_user, hr, mn):
    min_to_sec = mn * 60

    GPIO.setmode(GPIO.BCM)
    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)

    for hour in hr:
        sleep(3600)
    sleep(int(min_to_sec))

    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()
    return jsonify({'message': 'time restarted'}), 200


# change switch status for temp trigger
@app.route('/api/v1/temp/switchStatus', methods=['PUT'])
@token_req
def switchStatus(current_user):
    tswitch = temp_trigger.query.all()
    if tswitch:
        if tswitch[0].triggerSwitch == True:
            conn = sqlite3.connect('data.db')
            sql = "DELETE FROM temp_trigger"
            cur = conn.cursor()
            cur.execute(sql)
            conn.commit()

            new_trigger_switch = temp_trigger(triggerSwitch=False, user_id=current_user.id)
            db.session.add(new_trigger_switch)
            db.session.commit()
            return jsonify({'msg': 'ok'}), 201
        else:
            conn = sqlite3.connect('data.db')
            sql = "DELETE FROM temp_trigger"
            cur = conn.cursor()
            cur.execute(sql)
            conn.commit()

            new_trigger_switch = temp_trigger(triggerSwitch=True, user_id=current_user.id)
            db.session.add(new_trigger_switch)
            db.session.commit()
            return jsonify({'msg': 'ok'}), 201
    else:
        new_trigger_switch = temp_trigger(triggerSwitch=True, user_id=current_user.id)
        db.session.add(new_trigger_switch)
        db.session.commit()
        return jsonify({'msg': 'ok'}), 201


########################################################################################################## temp_trigger
def weather_trigger():
    user_info = User.query.filter_by(id=1).first()
    user_city = user_info.city
#    api_key = '5490a59fae143d65082c3beeaeaf6982'
    api_key = '27621b58304876a7c45a9fa393dae151'
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


# show saved trigger time
@app.route('/api/v1/show_trigger_temp', methods=['GET'])
@token_req
def show_trigger_temp(current_user):
    ttemp = temp_trigger.query.all()

    tdata = {}
    tdata['triggerTemp'] = ttemp[0].triggerTemp

    return jsonify(tdata), 200


@app.route('/api/v1/show_t_time')
@token_req
def show_t_time(current_user):
    tstatus = temp_trigger.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    ttime = t_ctrl.query.filter_by(user_id=current_user.id).all()
    if not tstatus:
        new_t_status = temp_trigger(triggerSwitch=True, user_id=current_user.id)
        db.session.add(new_t_status)
        db.session.commit()
    else:
        stdata = {}
        if tstatus.triggerSwitch == False:
            tstatus.triggerSwitch = True
            db.session.commit()
            stdata['triggerSwitch'] = tstatus.triggerSwitch
        else:
            tstatus.triggerSwitch = False
            db.session.commit()
            stdata['triggerSwitch'] = tstatus.triggerSwitch

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
    ttime_dict['tswitch'] = tstatus.triggerSwitch
    output.append(ttime_dict)
    return jsonify({'ttime': output}), 200


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


# holds restart time for schedule
@app.route('/api/v1/sch/holdRestart', methods=['GET'])
@token_req
def schHoldRestart(current_user):
    schrestart = sch_restart.query.filter_by(user_id=current_user.id).first()
    if not schrestart:
        newrestart = sch_restart(needs_restart=True, user_id=current_user.id)
        db.session.add(newrestart)
        db.session.commit()
        return jsonify({'msg': True}), 200
    else:
        schrestart.needs_restart = True
        db.session.commit()
        return jsonify({'msg': True}), 200


# holds restart time for temp trigger
@app.route('/api/v1/temp/holdRestart', methods=['GET'])
@token_req
def tempHoldRestart(current_user):
    temprestart = temp_restart.query.filter_by(user_id=current_user.id).first()
    if not temprestart:
        newrestart = temp_restart(needs_restart=True, user_id=current_user.id)
        db.session.add(newrestart)
        db.session.commit()
        return jsonify({'msg': True}), 200
    else:
        temprestart.needs_restart = True
        db.session.commit()
        return jsonify({'msg': True}), 200


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


@app.route('/api/v1/sch_t_on/<hr>/<mn>', methods=['GET', 'POST'])
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
        # return jsonify({"msg": "true"}), 200
        return jsonify({'message': 'true'}), 200


# @app.route('/api/v1/sch_t_on/<hr>/<mn>', methods=['POST'])
# @token_req
# def sch_t_on(current_user, hr, mn):
#     res = requests.get(url='http://{}:{}/api/v1/temp_time_on/{}/{}'.format(RPI_IP_ADDR, RPI_PORT, hr, mn))
#     return jsonify({'message': 'true'}), 200


def weather_trigger_runner():
    while True:
        schedule.run_pending()
        sleep(1)


@app.route('/api/v1/sch/makeupTriggerTime/<hr>/<mn>', methods=['GET'])
@token_req
def makeupTriggerTime(current_user, hr, mn):
    print('its going')
    min_to_sec = mn * 60

    GPIO.setmode(GPIO.BCM)
    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)

    for hour in hr:
        sleep(3600)
    sleep(int(min_to_sec))

    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()
    return jsonify({'msg': 'ok'}), 200


# @app.route('/api/v1/temp', methods=['GET'])
# @token_req
# def temp(current_user):
#     curr_temp = run()
#     return jsonify(curr_temp), 200


# manual pump controls
@app.route('/api/v1/pump_on', methods=['GET', 'POST'])
@token_req
def pump_on(current_user):
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)

    ch_on = GPIO.input(TP)

    data = request.get_json()
    pstatus = p_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    pdata = {}
    if pstatus.pswitch == False:
        pstatus.pswitch = True
        db.session.commit()
        pdata['pswitch'] = pstatus.pswitch
    # return jsonify(pdata), 200

    if ch_on:
        return jsonify({'msg': 'pump on'}), 200
    else:
        return jsonify({'msg': 'pump off'}), 200


@app.route('/api/v1/pump_off', methods=['GET', 'POST'])
@token_req
def pump_off(current_user):
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()

    data = request.get_json()
    pstatus = p_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    pdata = {}
    if pstatus.pswitch == True:
        pstatus.pswitch = False
        db.session.commit()
        pdata['pswitch'] = pstatus.pswitch
    return jsonify(pdata), 200

    # return jsonify({'msg': 'pump off'}), 200


# pump off control for temp trigger
@app.route('/api/v1/temp_pump_off', methods=['POST'])
@token_req
def temp_pump_off(current_user):
    data = request.get_json()
    tstatus = temp_trigger.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    tdata = {}
    if tstatus.triggerSwitch == True:
        tstatus.triggerSwitch = False
        db.session.commit()
        tdata['tswitch'] = tstatus.triggerSwitch
    return jsonify(tdata), 200


# show switch status for pump
@app.route('/api/v1/sch/sStatus', methods=['GET'])
@token_req
def sStatus(current_user):
    sswitch = p_status.query.filter_by(user_id=current_user.id).first()
    sstatus = sswitch.pswitch
    return jsonify({'msg': sstatus}), 200


# get the schedule time for manual stop of schedule pump on
@app.route('/api/v1/sch/getSchTime', methods=['GET'])
@token_req
def getSchTime(current_user):
    schtime = p_ctrl.query.filter_by(user_id=current_user.id).first()
    # full_time = "{}:{}{}".format(schtime.pHr, schtime.pMin, schtime.pMid)
    time_data = {}
    hour = schtime.pHr
    minute = schtime.pMin
    mid = schtime.pMid
    time_data['hour'] = hour
    time_data['minute'] = minute
    time_data['mid'] = mid
    return jsonify(time_data)
    # schedule time - current time


# holds restart time
@app.route('/api/v1/sch/holdTime', methods=['POST'])
@token_req
def holdTime(current_user):
    holdCheck = p_hold.query.filter_by(user_id=current_user.id).first()
    if holdCheck:
        conn = sqlite3.connect('data.db')
        sql = "DELETE FROM p_hold where user_id={}".format(current_user.id)
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()

        data = request.get_json()
        new_hold_time = p_hold(pHr=data['holdHour'], pMin=data['holdMin'], user_id=current_user.id)
        db.session.add(new_hold_time)
        db.session.commit()
        return jsonify({'message': 'restart time saved'}), 201
    else:
        data = request.get_json()
        new_hold_time = p_hold(pHr=data['holdHour'], pMin=data['holdMin'], user_id=current_user.id)
        db.session.add(new_hold_time)
        db.session.commit()
        return jsonify({'message': 'restart time saved'}), 201


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
@app.route('/api/v1/add_p_time', methods=['PUT', 'POST'])
@token_req
def add_p_time(current_user):
    ptime = p_ctrl.query.all()
    if ptime:
        conn = sqlite3.connect('data.db')
        sql = "DELETE FROM p_ctrl where user_id={}".format(current_user.id)
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()

        data = request.get_json()
        new_p_time = p_ctrl(pHr=data['pHr'], pMin=data['pMin'], pMid=data['pMid'], user_id=current_user.id)
        db.session.add(new_p_time)
        db.session.commit()
        return jsonify({'message': 'pump time schedule saved'}), 201
    else:
        data = request.get_json()
        new_p_time = p_ctrl(pHr=data['pHr'], pMin=data['pMin'], pMid=data['pMid'], user_id=current_user.id)
        db.session.add(new_p_time)
        db.session.commit()
        return jsonify({'message': 'pump time schedule saved'}), 201


# gets schedule time to display
@app.route('/api/v1/display_p_schedule', methods=['GET'])
@token_req
def display_p_schedule(current_user):
    ptime = p_ctrl.query.filter_by(user_id=current_user.id).all()
    defaultOutput = []
    defaultPtime = {}
    defaultPtime['pHr'] = 10
    defaultPtime['pMin'] = 10
    defaultPtime['pMid'] = 'AM'
    defaultOutput.append(defaultPtime)

    if not ptime:
        return jsonify({'ptime': defaultOutput}), 200

    output = []
    ptime_dict = {}
    ptime_dict['pHr'] = ptime[0].pHr
    ptime_dict['pMin'] = ptime[0].pMin
    ptime_dict['pMid'] = ptime[0].pMid
    output.append(ptime_dict)
    return jsonify({'ptime': output}), 200


# show saved pump time
@app.route('/api/v1/show_p_time', methods=['GET'])
@token_req
def show_p_time(current_user):
    pstatus = p_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    ptime = p_ctrl.query.filter_by(user_id=current_user.id).all()
    if not pstatus:
        pstatus.pswitch = False
        db.session.commit()
    else:
        spdata = {}
        if pstatus.pswitch == False:
            pstatus.pswitch = True
            db.session.commit()
            spdata['pswitch'] = pstatus.pswitch
        else:
            pstatus.pswitch = False
            db.session.commit()
            spdata['pswitch'] = pstatus.pswitch

    defaultOutput = []
    defaultPtime = {}
    defaultPtime['pHr'] = 10
    defaultPtime['pMin'] = 10
    defaultPtime['pMid'] = 'AM'
    defaultOutput.append(defaultPtime)

    if not ptime:
        return jsonify({'ptime': defaultOutput}), 200

    output = []
    ptime_dict = {}
    ptime_dict['pHr'] = ptime[0].pHr
    ptime_dict['pMin'] = ptime[0].pMin
    ptime_dict['pMid'] = ptime[0].pMid
    output.append(ptime_dict)
    return jsonify({'ptime': output}), 200


def prunner():
    while True:
        schedule.run_pending()
        sleep(1)


@app.route('/api/v1/sch_p_on/<hr>/<mn>', methods=['GET', 'POST'])
@token_req
def sch_p_on(current_user, hr, mn):
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
        # return({"msg": "true"}), 200
        return jsonify({'message': 'true'}), 200


# displays the status of the pump switch
@app.route('/api/v1/pump_status', methods=['GET'])
@token_req
def pump_status(current_user):
    pstatus = p_status.query.filter_by(user_id=current_user.id).all()
    if not pstatus:
        pdata = {}
        # init_p_status = p_status(pswitch=False)
        switch_stat = p_status(pswitch=False, user_id=current_user.id)
        db.session.add(switch_stat)
        db.session.commit()
        pdata['pswitch'] = False
        return jsonify(pdata), 200
    else:
        pstatus = p_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
        pdata = {}
        pdata['pswitch'] = pstatus.pswitch
        return jsonify(pdata), 200


# set water trigger temp for pump to turn on
@app.route('/api/v1/temp/trigger_temp', methods=['PUT'])
@token_req
def trigger_temp(current_user):
    tswitch = temp_trigger.query.all()
    if tswitch:
        if tswitch[0].triggerSwitch == True:
            conn = sqlite3.connect('data.db')
            sql = "DELETE FROM temp_trigger"
            cur = conn.cursor()
            cur.execute(sql)
            conn.commit()

            data = request.get_json()
            new_trigger_switch = temp_trigger(triggerSwitch=False, user_id=current_user.id)
            db.session.add(new_trigger_switch)
            db.session.commit()
            tswitch = temp_trigger.query.all()
            swtch = tswitch[0].triggerSwitch
            # res = requests.get(url='http://{}:{}/api/v1/trigger_temp/{}'.format(RPI_IP_ADDR, RPI_PORT, swtch))
            return jsonify({'message': 'temperature saved'}), 201
        else:
            conn = sqlite3.connect('data.db')
            sql = "DELETE FROM temp_trigger"
            cur = conn.cursor()
            cur.execute(sql)
            conn.commit()

            data = request.get_json()
            new_trigger_switch = temp_trigger(triggerSwitch=True, user_id=current_user.id)
            db.session.add(new_trigger_switch)
            db.session.commit()
            tswitch = temp_trigger.query.all()
            swtch = tswitch[0].triggerSwitch
            # res = requests.get(url='http://{}:{}/api/v1/trigger_temp/{}'.format(RPI_IP_ADDR, RPI_PORT, swtch))
            return jsonify({'message': 'temperature saved'}), 201
    else:
        data = request.get_json()
        new_trigger_switch = temp_trigger(triggerSwitch=True, user_id=current_user.id)
        db.session.add(new_trigger_switch)
        db.session.commit()
        tswitch = temp_trigger.query.all()
        swtch = tswitch[0].triggerSwitch
        # res = requests.get(url='http://{}:{}/api/v1/trigger_temp/{}'.format(RPI_IP_ADDR, RPI_PORT, swtch))
        return jsonify({'message': 'temperature saved'}), 201


# @app.route('/api/v1/trigger_temp', methods=['GET'])
# # @token_req
# # def trigger_temp(current_user):
# #     ttemp = temp_trigger.query.all()
# #     if ttemp:
# #         conn = sqlite3.connect('data.db')
# #         sql = "DELETE FROM temp_trigger"
# #         cur = conn.cursor()
# #         cur.execute(sql)
# #         conn.commit()
# #
# #         data = request.get_json()
# #         new_trigger_temp = temp_trigger(triggerTemp=data['triggerTemp'], triggerSwitch=False, user_id=current_user.id)
# #         db.session.add(new_trigger_temp)
# #         db.session.commit()
# #         ttemp = temp_trigger.query.all()
# #         tmp = ttemp[0].triggerTemp
# #         tempRun.run(tmp)
# #         # res = requests.get(url='http://{}:{}/api/v1/trigger_temp/{}'.format(RPI_IP_ADDR, RPI_PORT, tmp))
# #         # return jsonify({'message': 'temperature saved'}), 201
# #         return jsonify({'msg': tmp}), 200
# #     else:
# #         data = request.get_json()
# #         new_trigger_temp = temp_trigger(triggerTemp=data['triggerTemp'], triggerSwitch=False, user_id=current_user.id)
# #         db.session.add(new_trigger_temp)
# #         db.session.commit()
# #         ttemp = temp_trigger.query.all()
# #         tmp = ttemp[0].triggerTemp
# #         tempRun.run(tmp)
# #         # res = requests.get(url='http://{}:{}/api/v1/trigger_temp/{}'.format(RPI_IP_ADDR, RPI_PORT, tmp))
# #         # return jsonify({'message': 'temperature saved'}), 201
# #         return jsonify({'msg': tmp}), 200


@app.route('/api/v1/temp/trigger_temp_off', methods=['GET'])
@token_req
def trigger_temp_off(current_user):
    tswitch = temp_trigger.query.filter_by(user_id=current_user.id).first()
    tswitch.triggerSwitch = False
    db.session.commit()
    return jsonify({'msg': 'ok'}), 200


@app.route('/api/v1/getHoldTime', methods=['POST'])
@token_req
def getHoldTime(current_user):
    getTime = t_hold.query.filter_by(user_id=current_user.id).first()
    tdata = {}
    tdata['hour'] = getTime.tHr
    tdata['minute'] = getTime.tMin
    return jsonify(tdata), 200


@app.route('/api/v1/sch/restartSchTime', methods=['POST'])
@token_req
def restartSchTime(current_user):
    data = request.get_json()
    heldTime = p_hold.query.filter_by(user_id=current_user.id).first()
    # sendTime = '{}:{}'.format(heldTime.pHr, heldTime.pMin)
    hour = data['hour']
    min = data['min']
    # res = requests.get(url='http://{}:{}/api/v1/sch/makeupSchTime'.format(RPI_IP_ADDR, RPI_PORT), headers={sendTime})
    return jsonify({'message': 'time restarted'}), 200


############################################################################################################### cleaner
# displays the status of the cleaner switch
@app.route('/api/v1/clean_status', methods=['GET'])
@token_req
def clean_status(current_user):
    cstatus = c_status.query.filter_by(user_id=current_user.id).all()
    if not cstatus:
        cdata = {}
        switch_stat = c_status(cswitch=False, user_id=current_user.id)
        db.session.add(switch_stat)
        db.session.commit()
        cdata['cswitch'] = False
        return jsonify(cdata), 200
    else:
        cstatus = c_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
        cdata = {}
        cdata['cswitch'] = cstatus.cswitch
        return jsonify(cdata), 200


# manual cleaner controls
@app.route('/api/v1/clean_on', methods=['GET', 'POST'])
@token_req
def clean_on(current_user):
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)

    data = request.get_json()
    cstatus = c_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    cdata = {}
    if cstatus.cswitch == False:
        cstatus.cswitch = True
        db.session.commit()
        cdata['cswitch'] = cstatus.cswitch
    return jsonify(cdata), 200

    # return jsonify({'msg': 'cleaner on'}), 200


@app.route('/api/v1/clean_off', methods=['GET', 'POST'])
@token_req
def clean_off(current_user):
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()

    data = request.get_json()
    cstatus = c_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    cdata = {}
    if cstatus.cswitch == True:
        cstatus.cswitch = False
        db.session.commit()
        cdata['cswitch'] = cstatus.cswitch
    return jsonify(cdata), 200
    # return jsonify({'msg': 'cleaner off'}), 200


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
@app.route('/api/v1/add_c_time', methods=['PUT', 'POST'])
@token_req
def add_c_time(current_user):
    ctime = c_ctrl.query.all()
    if ctime:
        conn = sqlite3.connect('data.db')
        sql = "DELETE FROM c_ctrl where user_id={}".format(current_user.id)
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()

        data = request.get_json()
        new_c_time = c_ctrl(cHr=data['cHr'], cMin=data['cMin'], cMid=data['cMid'], user_id=current_user.id)
        db.session.add(new_c_time)
        db.session.commit()
        return jsonify({'message': 'cleaner time schedule saved'}), 201
    else:
        data = request.get_json()
        new_c_time = c_ctrl(cHr=data['cHr'], cMin=data['cMin'], cMid=data['cMid'], user_id=current_user.id)
        db.session.add(new_c_time)
        db.session.commit()
        return jsonify({'message': 'cleaner time schedule saved'}), 201


# show saved cleaner time
@app.route('/api/v1/show_c_time', methods=['GET'])
@token_req
def show_c_time(current_user):
    cstatus = c_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    ctime = c_ctrl.query.filter_by(user_id=current_user.id).all()
    if not cstatus:
        cstatus.cswitch = False
        db.session.commit()
    else:
        scdata = {}
        if cstatus.cswitch == False:
            cstatus.cswitch = True
            db.session.commit()
            scdata['cswitch'] = cstatus.cswitch
        else:
            cstatus.cswitch = False
            db.session.commit()
            scdata['cswitch'] = cstatus.cswitch
    defaultOutput = []
    defaultCtime = {}
    defaultCtime['cHr'] = 10
    defaultCtime['cMin'] = 10
    defaultCtime['cMid'] = 'AM'
    defaultOutput.append(defaultCtime)

    if not ctime:
        return jsonify({'ctime': defaultOutput}), 200

    output = []
    ctime_dict = {}
    ctime_dict['cHr'] = ctime[0].cHr
    ctime_dict['cMin'] = ctime[0].cMin
    ctime_dict['cMid'] = ctime[0].cMid
    output.append(ctime_dict)
    return jsonify({'ctime': output}), 200
    # ctime = c_ctrl.query.filter_by(user_id=current_user.id).all()
    #
    # defaultOutput = []
    # defaultCtime = {}
    # defaultCtime['cHr'] = 10
    # defaultCtime['cMin'] = 10
    # defaultCtime['cMid'] = 'AM'
    # defaultOutput.append(defaultCtime)
    #
    # if not ctime:
    #     return jsonify({'ctime': defaultOutput}), 200
    #
    # output = []
    # ctime_dict = {}
    # ctime_dict['cHr'] = ctime[0].cHr
    # ctime_dict['cMin'] = ctime[0].cMin
    # ctime_dict['cMid'] = ctime[0].cMid
    # output.append(ctime_dict)
    # return jsonify({'ctime': output}), 200


# displays set time for cleaner scheduler if no time set, displays default time
@app.route('/api/v1/display_c_schedule')
@token_req
def display_c_schedule(current_user):
    ctime = c_ctrl.query.filter_by(user_id=current_user.id).all()

    defaultOutput = []
    defaultCtime = {}
    defaultCtime['cHr'] = 10
    defaultCtime['cMin'] = 10
    defaultCtime['cMid'] = 'AM'
    defaultOutput.append(defaultCtime)

    if not ctime:
        return jsonify({'ctime': defaultOutput}), 200

    output = []
    ctime_dict = {}
    ctime_dict['cHr'] = ctime[0].cHr
    ctime_dict['cMin'] = ctime[0].cMin
    ctime_dict['cMid'] = ctime[0].cMid
    output.append(ctime_dict)
    return jsonify({'ctime': output}), 200


def crunner():
    while True:
        schedule.run_pending()
        sleep(1)


@app.route('/api/v1/sch_c_on/<hr>/<mn>', methods=['GET', 'POST'])
@token_req
def sch_c_on(current_user, hr, mn):
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
        # return jsonify({"msg": "true"}), 200
        return jsonify({'message': 'true'}), 200
#    t = Event()
#    WAIT_TIME = int(tm)
#    while not t.wait(WAIT_TIME):
#        cln_on()
#        break
#    return "OK", 200


#################################################################################################################lights
# displays the status of the light switch
@app.route('/api/v1/light_status', methods=['GET'])
@token_req
def light_status(current_user):
    lstatus = l_status.query.filter_by(user_id=current_user.id).all()
    if not lstatus:
        ldata = {}
        switch_stat = l_status(lswitch=False, user_id=current_user.id)
        db.session.add(switch_stat)
        db.session.commit()
        ldata['lswitch'] = False
        return jsonify(ldata), 200
    else:
        lstatus = l_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
        ldata = {}
        ldata['lswitch'] = lstatus.lswitch
        return jsonify(ldata), 200


# manual light controls
@app.route('/api/v1/light_on', methods=['GET', 'POST'])
@token_req
def light_on(current_user):
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)

    data = request.get_json()
    lstatus = l_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    ldata = {}
    if lstatus.lswitch == False:
        lstatus.lswitch = True
        db.session.commit()
        ldata['lswitch'] = lstatus.lswitch
    return jsonify(ldata), 200

    # return jsonify({'msg': 'lights on'}), 200


@app.route('/api/v1/light_off', methods=['GET', 'POST'])
@token_req
def light_off(current_user):
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()

    data = request.get_json()
    lstatus = l_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    ldata = {}
    if lstatus.lswitch == True:
        lstatus.lswitch = False
        db.session.commit()
        ldata['lswitch'] = lstatus.lswitch
    return jsonify(ldata), 200

    # return jsonify({'msg': 'lights off'}), 200


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
@app.route('/api/v1/add_l_time', methods=['PUT', 'POST'])
@token_req
def add_l_time(current_user):
    ltime = l_ctrl.query.all()
    if ltime:
        conn = sqlite3.connect('data.db')
        sql = "DELETE FROM l_ctrl where user_id={}".format(current_user.id)
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()

        data = request.get_json()
        new_l_time = l_ctrl(lHr=data['lHr'], lMin=data['lMin'], lMid=data['lMid'], user_id=current_user.id)
        db.session.add(new_l_time)
        db.session.commit()
        return jsonify({'message': 'light time schedule saved'}), 201
    else:
        data = request.get_json()
        new_l_time = l_ctrl(lHr=data['lHr'], lMin=data['lMin'], lMid=data['lMid'], user_id=current_user.id)
        db.session.add(new_l_time)
        db.session.commit()
        return jsonify({'message': 'light time schedule saved'}), 201


# show saved light time
@app.route('/api/v1/show_l_time', methods=['GET'])
@token_req
def show_l_time(current_user):
    lstatus = l_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    ltime = l_ctrl.query.filter_by(user_id=current_user.id).all()
    if not lstatus:
        lstatus.lswitch = False
        db.session.commit()
    else:
        sldata = {}
        if lstatus.lswitch == False:
            lstatus.lswitch = True
            db.session.commit()
            sldata['lswitch'] = lstatus.lswitch
        else:
            lstatus.lswitch = False
            db.session.commit()
            sldata['lswitch'] = lstatus.lswitch

    defaultOutput = []
    defaultLtime = {}
    defaultLtime['lHr'] = 10
    defaultLtime['lMin'] = 10
    defaultLtime['lMid'] = 'AM'
    defaultOutput.append(defaultLtime)

    if not ltime:
        return jsonify({'ltime': defaultOutput}), 200

    output = []
    ltime_dict = {}
    ltime_dict['lHr'] = ltime[0].lHr
    ltime_dict['lMin'] = ltime[0].lMin
    ltime_dict['lMid'] = ltime[0].lMid
    output.append(ltime_dict)
    return jsonify({'ltime': output}), 200
    # ltime = l_ctrl.query.filter_by(user_id=current_user.id).all()
    #
    # defaultOutput = []
    # defaultLtime = {}
    # defaultLtime['lHr'] = 10
    # defaultLtime['lMin'] = 10
    # defaultLtime['lMid'] = 'AM'
    # defaultOutput.append(defaultLtime)
    #
    # if not ltime:
    #     return jsonify({'ltime': defaultOutput}), 200
    #
    # output = []
    # ltime_dict = {}
    # ltime_dict['lHr'] = ltime[0].lHr
    # ltime_dict['lMin'] = ltime[0].lMin
    # ltime_dict['lMid'] = ltime[0].lMid
    # output.append(ltime_dict)
    # return jsonify({'ltime': output}), 200


# displays set time for light scheduler if no time set, displays default time
@app.route('/api/v1/display_l_schedule')
@token_req
def display_l_schedule(current_user):
    ltime = l_ctrl.query.filter_by(user_id=current_user.id).all()

    defaultOutput = []
    defaultLtime = {}
    defaultLtime['lHr'] = 10
    defaultLtime['lMin'] = 10
    defaultLtime['lMid'] = 'AM'
    defaultOutput.append(defaultLtime)

    if not ltime:
        return jsonify({'ltime': defaultOutput}), 200

    output = []
    ltime_dict = {}
    ltime_dict['lHr'] = ltime[0].lHr
    ltime_dict['lMin'] = ltime[0].lMin
    ltime_dict['lMid'] = ltime[0].lMid
    output.append(ltime_dict)
    return jsonify({'ltime': output}), 200


def lrunner():
    while True:
        schedule.run_pending()
        sleep(1)


@app.route('/api/v1/sch_l_on/<hr>/<mn>', methods=['GET', 'POST'])
@token_req
def sch_l_on(current_user, hr, mn):
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
        # return jsonify({"msg": "true"}), 200
        return jsonify({'message': 'true'}), 200


################################################################################################################## aux1
# displays the status of the aux1 switch
@app.route('/api/v1/aux1_status', methods=['GET'])
@token_req
def aux1_status(current_user):
    a1status = a1_status.query.filter_by(user_id=current_user.id).all()
    if not a1status:
        a1data = {}
        switch_stat = a1_status(a1switch=False, user_id=current_user.id)
        db.session.add(switch_stat)
        db.session.commit()
        a1data['a1switch'] = False
        return jsonify(a1data), 200
    else:
        a1status = a1_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
        a1data = {}
        a1data['a1switch'] = a1status.a1switch
        return jsonify(a1data), 200


# manual aux1 controls
@app.route('/api/v1/aux1_on', methods=['GET', 'POST'])
@token_req
def aux1_on(current_user):
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)

    # return jsonify({'msg': 'aux 1 on'}), 200
    data = request.get_json()
    a1status = a1_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    a1data = {}
    if a1status.a1switch == False:
        a1status.a1switch = True
        db.session.commit()
        a1data['a1switch'] = a1status.a1switch
    return jsonify(a1data), 200


@app.route('/api/v1/aux1_off', methods=['GET', 'POST'])
@token_req
def aux1_off(current_user):
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()

    # return jsonify({'msg': 'aux 1 off'}), 200
    data = request.get_json()
    a1status = a1_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    a1data = {}
    if a1status.a1switch == True:
        a1status.a1switch = False
        db.session.commit()
        a1data['a1switch'] = a1status.a1switch
    return jsonify(a1data), 200


# schedule aux1 controls
def aux_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.HIGH)
    return jsonify({'msg': 'aux 1 scheduled'}), 200


def aux_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(TP, GPIO.OUT)
    GPIO.output(TP, GPIO.LOW)
    GPIO.cleanup()
    return jsonify({'msg': 'aux1 sch off'}), 200


# add time for schedule aux1
@app.route('/api/v1/add_a1_time', methods=['PUT', 'POST'])
@token_req
def add_a1_time(current_user):
    a1time = a1_ctrl.query.all()
    if a1time:
        conn = sqlite3.connect('data.db')
        sql = "DELETE FROM a1_ctrl where user_id={}".format(current_user.id)
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()

        data = request.get_json()
        new_a1_time = a1_ctrl(a1Hr=data['a1Hr'], a1Min=data['a1Min'], a1Mid=data['a1Mid'], user_id=current_user.id)
        db.session.add(new_a1_time)
        db.session.commit()
        return jsonify({'message': 'aux1 time schedule saved'}), 201
    else:
        data = request.get_json()
        new_a1_time = a1_ctrl(a1Hr=data['a1Hr'], a1Min=data['a1Min'], a1Mid=data['a1Mid'], user_id=current_user.id)
        db.session.add(new_a1_time)
        db.session.commit()
        return jsonify({'message': 'aux1 time schedule saved'}), 201


# show saved aux1 time
@app.route('/api/v1/show_a1_time', methods=['GET'])
@token_req
def show_a1_time(current_user):
    a1status = a1_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    a1time = a1_ctrl.query.filter_by(user_id=current_user.id).all()
    if not a1status:
        a1status.a1switch = False
        db.session.commit()
    else:
        sa1data = {}
        if a1status.a1switch == False:
            a1status.a1switch = True
            db.session.commit()
            sa1data['a1switch'] = a1status.a1switch
        else:
            a1status.a1switch = False
            db.session.commit()
            sa1data['a1switch'] = a1status.a1switch

    defaultOutput = []
    defaultA1time = {}
    defaultA1time['a1Hr'] = 10
    defaultA1time['a1Min'] = 10
    defaultA1time['a1Mid'] = 'AM'
    defaultOutput.append(defaultA1time)

    if not a1time:
        return jsonify({'a1time': defaultOutput}), 200

    output = []
    a1time_dict = {}
    a1time_dict['a1Hr'] = a1time[0].a1Hr
    a1time_dict['a1Min'] = a1time[0].a1Min
    a1time_dict['a1Mid'] = a1time[0].a1Mid
    output.append(a1time_dict)
    return jsonify({'a1time': output}), 200
    # a1time = a1_ctrl.query.filter_by(user_id=current_user.id).all()
    #
    # defaultOutput = []
    # defaultA1time = {}
    # defaultA1time['a1Hr'] = 10
    # defaultA1time['a1Min'] = 10
    # defaultA1time['a1Mid'] = 'AM'
    # defaultOutput.append(defaultA1time)
    #
    # if not a1time:
    #     return jsonify({'a1time': defaultOutput}), 200
    #
    # output = []
    # a1time_dict = {}
    # a1time_dict['a1Hr'] = a1time[0].a1Hr
    # a1time_dict['a1Min'] = a1time[0].a1Min
    # a1time_dict['a1Mid'] = a1time[0].a1Mid
    # output.append(a1time_dict)
    # return jsonify({'a1time': output}), 200


# displays set time for aux1 scheduler if no time set, displays default time
@app.route('/api/v1/display_a1_schedule')
@token_req
def display_a1_schedule(current_user):
    a1time = a1_ctrl.query.filter_by(user_id=current_user.id).all()

    defaultOutput = []
    defaultA1time = {}
    defaultA1time['a1Hr'] = 10
    defaultA1time['a1Min'] = 10
    defaultA1time['a1Mid'] = 'AM'
    defaultOutput.append(defaultA1time)

    if not a1time:
        return jsonify({'a1time': defaultOutput}), 200

    output = []
    a1time_dict = {}
    a1time_dict['a1Hr'] = a1time[0].a1Hr
    a1time_dict['a1Min'] = a1time[0].a1Min
    a1time_dict['a1Mid'] = a1time[0].a1Mid
    output.append(a1time_dict)
    return jsonify({'a1time': output}), 200


def a1runner():
    while True:
        schedule.run_pending()
        sleep(1)


@app.route('/api/v1/sch_a1_on/<hr>/<mn>', methods=['GET', 'POST'])
def sch_a1_on(hr, mn):
    with app.app_context():
        run_time = "{}:{}".format(hr, mn)
        schedule.clear()
        aux_off()
        schedule.every().day.at(run_time).do(aux_on)
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
        aux_off()
        # return({"msg": "true"}), 200
        return jsonify({'message': 'true'}), 200


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
        aux_off()
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

