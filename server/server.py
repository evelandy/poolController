from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, request, make_response, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from functools import wraps
#import RPi.GPIO as GPIO
from time import sleep
import datetime
import requests
import schedule
import sqlite3
import jwt

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SECRET_KEY'] = 'MainSecretKey'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

RPI_IP_ADDR = '192.168.1.142'
RPI_PORT = '5000'

db = SQLAlchemy(app)
CORS(app)


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


class p_ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pHr = db.Column(db.Integer)
    pMin = db.Column(db.Integer)
    pMid = db.Column(db.String(2))
    user_id = db.Column(db.Integer)


class p_status(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pswitch = db.Column(db.Boolean)
    # user_id = db.Column(db.Integer)


class c_ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cHr = db.Column(db.Integer)
    cMin = db.Column(db.Integer)
    cMid = db.Column(db.String(2))
    # user_id = db.Column(db.Integer)


class c_status(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cswitch = db.Column(db.Boolean)
    # user_id = db.Column(db.Integer)


class l_ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lHr = db.Column(db.Integer)
    lMin = db.Column(db.Integer)
    lMid = db.Column(db.String(2))
    # user_id = db.Column(db.Integer)


class l_status(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lswitch = db.Column(db.Boolean)
    # user_id = db.Column(db.Integer)


class a1_ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    a1Hr = db.Column(db.Integer)
    a1Min = db.Column(db.Integer)
    a1Mid = db.Column(db.String(2))
    # user_id = db.Column(db.Integer)


class a1_status(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    a1switch = db.Column(db.Boolean)
    # user_id = db.Column(db.Integer)


class temp_trigger(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    triggerTemp = db.Column(db.Integer)
    triggerSwitch = db.Column(db.Boolean)
    # user_id = db.Column(db.Integer)


# create token and check creds
def token_req(f):
    @wraps(f)
    def decorate(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Token missing!'}), 404
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'])
            current_user = User.query.filter_by(id=data['id']).first()
        except:
            return jsonify({'message': 'Token invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorate


# check to see that server is running and connected properly
@app.route('/api/v1/check', methods=['GET'])
def server_check():
    res = requests.get(url='http://{}:{}/api/v1/check'.format(RPI_IP_ADDR, RPI_PORT))
    if res.json() == 'Good':
        return jsonify({'message': 'Good'}), 200
    else:
        return jsonify({'message': 'RPi Server is down'}), 400


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
                            'password': user.password, 'email': user.email, 'address': user.address, 'add2': user.add2,
                            'city': user.city, 'sta': user.sta, 'zipCode': user.zipCode, 'phone': user.phone,
                            'admin': user.admin, 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=120)},
                           app.config['SECRET_KEY'])
        return jsonify({"token": token.decode('UTF-8'), 'fname': user.fname, 'lname': user.lname,
                        'username': user.username, 'password': user.password, 'email': user.email,
                        'address': user.address, 'add2': user.add2, 'city': user.city, 'sta': user.sta,
                        'zipCode': user.zipCode, 'phone': user.phone, 'id': user.id, 'admin': user.admin})
    return make_response('Could not verify password', 401, {"WWW-Authenticate": 'Basic realm="Login required!"'})


# add / create user(s)
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


# view user might not even use this
@app.route('/api/v1/user/<user_id>', methods=['GET'])
def user(user_id):
    user = User.query.filter_by(id=user_id).first()

    if not user:
        return jsonify({"message": "that username does not exist"}), 404

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


@app.route('/api/v1/edituname/<username>/<user_id>', methods=['PUT'])
def edit_username(username, user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'message': 'user does not exist'}), 404
    user.username = username
    db.session.commit()
    return jsonify({'message': 'username updated'}), 202


@app.route('/api/v1/editpass/<password>/<user_id>', methods=['PUT'])
def edit_password(password, user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'message': 'user does not exist'}), 404
    user.password = generate_password_hash(password, method='sha256')
    db.session.commit()
    return jsonify({'message': 'password updated'}), 202


@app.route('/api/v1/editname/<fname>/<lname>/<user_id>', methods=['PUT'])
def edit_name(fname, lname, user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'message': 'user does not exist'}), 404
    user.fname = fname
    user.lname = lname
    db.session.commit()
    return jsonify({'message': 'name updated'}), 202


@app.route('/api/v1/editemail/<email>/<user_id>', methods=['PUT'])
def edit_email(email, user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'message': 'user does not exist'}), 404
    user.email = email
    db.session.commit()
    return jsonify({'message': 'email changed'}), 202


@app.route('/api/v1/editaddress/<user_id>', methods=['PUT'])
def edit_address(user_id):
    user = User.query.filter_by(id=user_id).first()
    data = request.get_json()
    if not user:
        return jsonify({"message": 'user does not exist'}), 404
    user.address = data['address']
    user.add2 = data['add2']
    user.city = data['city']
    user.sta = data['sta']
    user.zipCode = data['zipCode']
    db.session.commit()
    return jsonify({'message': 'address changed'}), 202


@app.route('/api/v1/editphone/<phone>/<user_id>', methods=['PUT'])
def edit_phone(phone, user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'message': 'user does not exist'}), 404
    user.phone = phone
    db.session.commit()
    return jsonify({'message': 'phone number changed'}), 202


# logout
@app.route('/api/v1/logout', methods=['POST'])
def logout():
    pass


@app.route('/api/v1/temp', methods=['GET'])
def temp():
    res = requests.get(url='http://{}:{}/api/v1/temp'.format(RPI_IP_ADDR, RPI_PORT))
    # with open('/tmp/movies.tmp.json', 'w') as f:
    #     f.write(res.text)
    return jsonify({'message': '{}'.format(res.json())})


# @app.route('/api/v1/pump/<pool_id>', methods=['GET'])
# def pump(pool_id):
#     # res = requests.get(url='http://192.168.1.116:{}/api/led'.format(RPI_IP_ADDR, RPI_PORT)
#     # return jsonify({'message': 'pump on'})
#     pool = Ctrl.query.filter_by(id=pool_id).first()
#
#     if not pool:
#         return jsonify({'message': 'pump not found'}), 404
#
#     if pool.pump == False:
#         pool.pump = True
#         db.session.commit()
#         return jsonify({'pump': True}), 201
#     else:
#         pool.pump = False
#         db.session.commit()
#         return jsonify({'pump': False}), 201


# add time for schedule pump
@app.route('/api/v1/add_p_time', methods=['POST'])
@token_req
def add_p_time(current_user):
    # ptime = p_ctrl.query.filter_by(id=1).first()
    ptime = p_ctrl.query.all()
    if ptime:
        conn = sqlite3.connect('data.db')
        sql = "DELETE FROM p_ctrl"
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


# show saved pump time
@app.route('/api/v1/show_p_time', methods=['GET'])
@token_req
def show_p_time(current_user):
    # ptime = p_ctrl.query.all()

    ptime = p_ctrl.query.filter_by(user_id=current_user.id).first()
    pdata = {}
    pdata['pHr'] = ptime[0].pHr
    pdata['pMin'] = ptime[0].pMin
    pdata['pMid'] = ptime[0].pMid

    return jsonify({'message': pdata}), 200


@app.route('/api/v1/pump_status', methods=['GET'])
def pump_status():
    pstatus = p_status.query.filter_by(id=1).first()
    if pstatus:
        pdata = {}
        pdata['pswitch'] = pstatus.pswitch
        return jsonify(pdata), 200
    else:
        pdata = {}
        init_p_status = p_status(pswitch=False)
        db.session.add(init_p_status)
        db.session.commit()
        pdata['pswitch'] = pstatus.pswitch
        return jsonify(pdata), 200

# @app.route('/api/v1/pump_switch', methods=['GET'])
# def pump_switch():
#     status = p_status.query.all()
#     if status.pswitch == False:
#         status.pswitch = True
#         db.session.commit()


# pump controls from server to RPi
@app.route('/api/v1/pump_on', methods=['GET'])
def pump_on():
    res = requests.get(url='http://{}:{}/api/v1/pump_on'.format(RPI_IP_ADDR, RPI_PORT))
    pstatus = p_status.query.all()
    pdata = {}
    if pstatus[0].pswitch == False:
        pstatus[0].pswitch = True
        db.session.commit()
        pdata['pswitch'] = pstatus[0].pswitch
    return jsonify(pdata), 200


@app.route('/api/v1/pump_off', methods=['GET'])
def pump_off():
    res = requests.get(url='http://{}:{}/api/v1/pump_off'.format(RPI_IP_ADDR, RPI_PORT))
    pstatus = p_status.query.all()
    pdata = {}
    if pstatus[0].pswitch == True:
        pstatus[0].pswitch = False
        db.session.commit()
        pdata['pswitch'] = pstatus[0].pswitch
    return jsonify(pdata), 200


@app.route('/api/v1/sch_p_on/<tm>', methods=['GET'])
def sch_p_on(tm=5):
    tm = int(tm)
    res = requests.get(url='http://{}:{}/api/v1/sch_p_on/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
    return jsonify({'message': 'true'}), 200


@app.route('/api/v1/sch_p_off/<tm>', methods=['GET'])
def sch_p_off(tm=5):
    res = requests.get(url='http://{}:{}/api/v1/sch_p_off/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
    return jsonify({'message': 'false'}), 200


# @app.route('/api/v1/clean', methods=['GET'])
# def clean():
#     res = requests.get(url='http://192.168.1.116:{}/api/led'.format(RPI_IP_ADDR, RPI_PORT)
#     return jsonify({'message': 'cleaner on'})


# set trigger time
@app.route('/api/v1/temp/trigger_temp', methods=['PUT'])
def trigger_temp():
    ttemp = temp_trigger.query.all()
    if ttemp:
        conn = sqlite3.connect('data.db')
        sql = "DELETE FROM temp_trigger"
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()

        data = request.get_json()
        new_trigger_temp = temp_trigger(triggerTemp=data['triggerTemp'])
        db.session.add(new_trigger_temp)
        db.session.commit()
        ttemp = temp_trigger.query.all()
        tmp = ttemp[0].triggerTemp
        res = requests.get(url='http://{}:{}/api/v1/trigger_temp/{}'.format(RPI_IP_ADDR, RPI_PORT, tmp))
        return jsonify({'message': 'temperature saved'}), 201
    else:
        data = request.get_json()
        new_trigger_temp = temp_trigger(triggerTemp=data['triggerTemp'])
        db.session.add(new_trigger_temp)
        db.session.commit()
        ttemp = temp_trigger.query.all()
        tmp = ttemp[0].triggerTemp
        res = requests.get(url='http://{}:{}/api/v1/trigger_temp/{}'.format(RPI_IP_ADDR, RPI_PORT, tmp))
        return jsonify({'message': 'temperature saved'}), 201


# show saved trigger time
@app.route('/api/v1/show_trigger_temp', methods=['GET'])
def show_trigger_temp():
    ttemp = temp_trigger.query.all()
    tdata = {}
    tdata['triggerTemp'] = ttemp[0].triggerTemp

    return jsonify(tdata), 200


# cleaner controls from server to RPi
@app.route('/api/v1/clean_on', methods=['GET'])
def clean_on():
    res = requests.get(url='http://{}:{}/api/v1/clean_on'.format(RPI_IP_ADDR, RPI_PORT))
    cstatus = c_status.query.all()
    cdata = {}
    if cstatus[0].cswitch == False:
        cstatus[0].cswitch = True
        db.session.commit()
        cdata['cswitch'] = cstatus[0].cswitch
    return jsonify(cdata), 200


@app.route('/api/v1/clean_off', methods=['GET'])
def clean_off():
    res = requests.get(url='http://{}:{}/api/v1/clean_off'.format(RPI_IP_ADDR, RPI_PORT))
    cstatus = c_status.query.all()
    cdata = {}
    if cstatus[0].cswitch == True:
        cstatus[0].cswitch = False
        db.session.commit()
        cdata['cswitch'] = cstatus[0].cswitch
    return jsonify(cdata), 200


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


@app.route('/api/v1/clean_status', methods=['GET'])
def clean_status():
    cstatus = c_status.query.filter_by(id=1).first()
    if cstatus:
        cdata = {}
        cdata['cswitch'] = cstatus.cswitch
        return jsonify(cdata), 200
    else:
        cdata = {}
        init_c_status = c_status(cswitch=False)
        db.session.add(init_c_status)
        db.session.commit()
        cdata['cswitch'] = cstatus.cswitch
        return jsonify(cdata), 200


@app.route('/api/v1/sch_c_on/<tm>', methods=['GET'])
def sch_c_on(tm=5):
    tm = int(tm)
    res = requests.get(url='http://{}:{}/api/v1/sch_c_on/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
    return jsonify({'message': 'true'}), 200


@app.route('/api/v1/sch_c_off/<tm>', methods=['GET'])
def sch_c_off(tm=5):
    res = requests.get(url='http://{}:{}/api/v1/sch_c_off/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
    return jsonify({'message': 'false'}), 200


# @app.route('/api/v1/light', methods=['GET'])
# def light():
#     res = requests.get(url='http://192.168.1.116:{}/api/led'.format(RPI_IP_ADDR, RPI_PORT)
#     return jsonify({'message': 'lights on'})


# light controls from server to RPi
@app.route('/api/v1/light_on', methods=['GET'])
def light_on():
    res = requests.get(url='http://{}:{}/api/v1/light_on'.format(RPI_IP_ADDR, RPI_PORT))
    lstatus = l_status.query.all()
    ldata = {}
    if lstatus[0].lswitch == False:
        lstatus[0].lswitch = True
        db.session.commit()
        ldata['lswitch'] = lstatus[0].lswitch
    return jsonify(ldata), 200


@app.route('/api/v1/light_off', methods=['GET'])
def light_off():
    res = requests.get(url='http://{}:{}/api/v1/light_off'.format(RPI_IP_ADDR, RPI_PORT))
    lstatus = l_status.query.all()
    ldata = {}
    if lstatus[0].lswitch == True:
        lstatus[0].lswitch = False
        db.session.commit()
        ldata['lswitch'] = lstatus[0].lswitch
    return jsonify(ldata), 200


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


@app.route('/api/v1/light_status', methods=['GET'])
def light_status():
    lstatus = l_status.query.filter_by(id=1).first()
    if lstatus:
        ldata = {}
        ldata['lswitch'] = lstatus.lswitch
        return jsonify(ldata), 200
    else:
        ldata = {}
        init_l_status = l_status(lswitch=False)
        db.session.add(init_l_status)
        db.session.commit()
        ldata['lswitch'] = lstatus.lswitch
        return jsonify(ldata), 200


@app.route('/api/v1/sch_l_on/<tm>', methods=['GET'])
def sch_l_on(tm=5):
    tm = int(tm)
    res = requests.get(url='http://{}:{}/api/v1/sch_l_on/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
    return jsonify({'message': 'true'}), 200


@app.route('/api/v1/sch_l_off/<tm>', methods=['GET'])
def sch_l_off(tm=5):
    res = requests.get(url='http://{}:{}/api/v1/sch_l_off/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
    return jsonify({'message': 'false'}), 200


# Aux1 controls from server to RPi
@app.route('/api/v1/aux_1_on', methods=['GET'])
def aux_1_on():
    res = requests.get(url='http://{}:{}/api/v1/aux_1_on'.format(RPI_IP_ADDR, RPI_PORT))
    a1status = a1_status.query.all()
    a1data = {}
    if a1status[0].a1switch == False:
        a1status[0].a1switch = True
        db.session.commit()
        a1data['a1switch'] = a1status[0].a1switch
    return jsonify(a1data), 200


@app.route('/api/v1/aux_1_off', methods=['GET'])
def aux_1_off():
    res = requests.get(url='http://{}:{}/api/v1/aux_1_off'.format(RPI_IP_ADDR, RPI_PORT))
    a1status = a1_status.query.all()
    a1data = {}
    if a1status[0].a1switch == True:
        a1status[0].a1switch = False
        db.session.commit()
        a1data['a1switch'] = a1status[0].a1switch
    return jsonify(a1data), 200


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


@app.route('/api/v1/aux1_status', methods=['GET'])
def aux1_status():
    a1status = a1_status.query.filter_by(id=1).first()
    if a1status:
        a1data = {}
        a1data['a1switch'] = a1status.a1switch
        return jsonify(a1data), 200
    else:
        a1data = {}
        init_a1_status = a1_status(a1switch=False)
        db.session.add(init_a1_status)
        db.session.commit()
        a1data['a1switch'] = a1status.a1switch
        return jsonify(a1data), 200


@app.route('/api/v1/run_a1_time', methods=['POST'])
def run_a1_time():
    a1time = a1_ctrl.query.all()

    # a1data = {}
    # a1data['a1Hr'] = a1time[0].a1Hr
    # a1data['a1Min'] = a1time[0].a1Min
    # a1data['a1Mid'] = a1time[0].a1Mid
    a1data = []
    a1data.append(a1time[0].a1Hr)
    a1data.append(a1time[0].a1Min)
    a1data.append(a1time[0].a1Mid)
    res = requests.post(url='http://{}:{}/api/v1/run_a1_time/{}'.format(RPI_IP_ADDR, RPI_PORT, a1data))
    return jsonify({'message': 'true'}), 200


@app.route('/api/v1/sch_a1_on/<tm>', methods=['GET'])
def sch_a1_on(tm=5):
    tm = int(tm)
    res = requests.get(url='http://{}:{}/api/v1/sch_a1_on/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
    return jsonify({'message': 'true'}), 200


@app.route('/api/v1/sch_a1_off/<tm>', methods=['GET'])
def sch_a1_off(tm=5):
    res = requests.get(url='http://{}:{}/api/v1/sch_a1_off/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
    return jsonify({'message': 'false'}), 200


# Aux2 controls from server to RPi
@app.route('/api/v1/aux_2_on', methods=['GET'])
def aux_2_on():
    res = requests.get(url='http://{}:{}/api/v1/aux_2_on'.format(RPI_IP_ADDR, RPI_PORT))
    return jsonify({'message': 'true'}), 200


@app.route('/api/v1/aux_2_off', methods=['GET'])
def aux_2_off():
    res = requests.get(url='http://{}:{}/api/v1/aux_2_off'.format(RPI_IP_ADDR, RPI_PORT))
    return jsonify({'message': 'false'}), 200


@app.route('/api/v1/sch_a2_on/<tm>', methods=['GET'])
def sch_a2_on(tm=5):
    tm = int(tm)
    res = requests.get(url='http://{}:{}/api/v1/sch_a2_on/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
    return jsonify({'message': 'true'}), 200


@app.route('/api/v1/sch_a2_off/<tm>', methods=['GET'])
def sch_a2_off(tm=5):
    res = requests.get(url='http://{}:{}/api/v1/sch_a2_off/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
    return jsonify({'message': 'false'}), 200


if __name__ == '__main__':
    app.run(debug=True)
