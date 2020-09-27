from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, request, make_response, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from functools import wraps
import RPi.GPIO as GPIO
from time import sleep
import datetime
import schedule
import jwt

import atexit
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.schedulers.blocking import BlockingScheduler
from threading import Timer, Event


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'SecretKey'

db = SQLAlchemy(app)
CORS(app)

HOST = '192.168.1.109'
PORT = '5000'
DEBUG = True


# login user info
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(120))
    admin = db.Column(db.Boolean)


# settings and controls
class Ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pump = db.Column(db.Boolean)
    cleaner = db.Column(db.Boolean)
    lights = db.Column(db.Boolean)
    heat = db.Column(db.Boolean)
    jets = db.Column(db.Boolean)
    music = db.Column(db.Boolean)
    spare_1 = db.Column(db.Boolean)
    spare_2 = db.Column(db.Boolean)


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
    return jsonify({'message': 'Good'}), 200


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
        token = jwt.encode({'id': user.id, 'username': user.username, 'password': user.password,
                            'admin': user.admin, 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=120)},
                           app.config['SECRET_KEY'])
        return jsonify({"token": token.decode('UTF-8'), 'name': user.username, 'password': user.password, 'id': user.id,
                        'admin': user.admin})
    return make_response('Could not verify password', 401, {"WWW-Authenticate": 'Basic realm="Login required!"'})


# add/create users
@app.route('/api/v1/user', methods=['POST'])
def add_user():
    data = request.get_json()
    hash_password = generate_password_hash(data['password'], method='sha256')
    new_user = User(username=data['username'], password=hash_password, admin=False)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "new user added"}), 201


# view user
@app.route('/api/v1/user/<user_id>', methods=['GET'])
def user(user_id):
    user = User.query.filter_by(id=user_id).first()

    if not user:
        return jsonify({"message": "that username does not exist"}), 404

    user_data = {}
    user_data['id'] = user.id
    user_data['username'] = user.username
    user_data['password'] = user.password
    user_data['admin'] = user.admin

    return jsonify(user_data)


# pump control
#@app.route('/api/v1/pump/<pool_id>', methods=['GET'])
#def pump(pool_id):
#    pool = Ctrl.query.filter_by(id=pool_id).first()
#
#    if not pool:
#        return jsonify({'msg': 'pump not found'}), 404
#
#    if pool.pump == False:
#        pool.pump = True
#        db.session.commit()
#        return jsonify({'pump': True}), 201
#    else:
#        pool.pump = False
#        db.session.commit()
#        return jsonify({'pump': False}), 201


# manual pump controls
@app.route('/api/v1/pump_on', methods=['GET'])
def pump_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.HIGH)

    ch_on = GPIO.input(18)

    if ch_on:
        return jsonify({'msg': 'pump on'}), 200
    else:
        return jsonify({'msg': 'pump off'}), 200


@app.route('/api/v1/pump_off', methods=['GET'])
def pump_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.LOW)
    GPIO.cleanup()

    return jsonify({'msg': 'pump off'}), 200


@app.route('/api/v1/pump_disp', methods=['GET'])
def pump_disp():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(18, GPIO.OUT)
    ch_on = GPIO.input(18)
    if ch_on:
        GPIO.output(18, GPIO.LOW)
        GPIO.cleanup()
        return jsonify({'msg': 'pump off'}), 201
    else:
        GPIO.output(18, GPIO.HIGH)
        return jsonify({'msg': 'pump on'}), 200


# schedule pump controls
def pmp_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.HIGH)
    return jsonify({'msg': 'pump scheduled'}), 200


def pmp_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.LOW)
    GPIO.cleanup()
    return jsonify({'msg': 'pump sch off'}), 200


"""
# schedule pump controls
@app.route('/api/v1/sch_p_on/<tm>', methods=['GET'])
def sch_p_on(tm=4):
    scheduler = BackgroundScheduler()

    scheduler.add_job(
        func=pmp_on,
        trigger = IntervalTrigger(seconds=int(tm)),
        id='scheduling pump',
        name='schedule pump',
        replace_existing=True)
    scheduler.start()
    scheduler.reschedule_job('scheduling pump')
    return "OK", 200
"""


@app.route('/api/v1/sch_p_on/<tm>', methods=['GET'])
def sch_p_on(tm=4):
    t = Event()
    WAIT_TIME = int(tm)
    while not t.wait(WAIT_TIME):
        pmp_on()
        break
    return jsonify({'msg': 'true'}), 200


@app.route('/api/v1/sch_p_off/<tm>', methods=['GET'])
def sch_p_off(tm=4):
    t = Event()
    WAIT_TIME = int(tm)
    while not t.wait(WAIT_TIME):
        pmp_off()
        break
    return ({'msg': 'false'}), 200


# manual cleaner controls
@app.route('/api/v1/clean_on', methods=['GET'])
def clean_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.HIGH)

    return jsonify({'msg': 'cleaner on'}), 200


@app.route('/api/v1/clean_off', methods=['GET'])
def clean_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.LOW)
    GPIO.cleanup()

    return jsonify({'msg': 'cleaner off'}), 200


# schedule cleaner controls
def cln_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.HIGH)
    return jsonify({'msg': 'cleaner scheduled'}), 200


def cln_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.LOW)
    GPIO.cleanup()
    return jsonify({'msg': 'clean sch off'}), 200


@app.route('/api/v1/sch_c_on/<tm>', methods=['GET'])
def sch_c_on(tm=4):
    t = Event()
    WAIT_TIME = int(tm)
    while not t.wait(WAIT_TIME):
        cln_on()
        break
    return "OK", 200


@app.route('/api/v1/sch_c_off/<tm>', methods=['GET'])
def sch_c_off(tm=4):
    t = Event()
    WAIT_TIME = int(tm)
    while not t.wait(WAIT_TIME):
        cln_off()
        break
    return "OK", 200


# manual light controls
@app.route('/api/v1/light_on', methods=['GET'])
def light_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.HIGH)

    return jsonify({'msg': 'lights on'}), 200


@app.route('/api/v1/light_off', methods=['GET'])
def light_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.LOW)
    GPIO.cleanup()

    return jsonify({'msg': 'lights off'}), 200


# schedule light controls
def lgt_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.HIGH)
    return jsonify({'msg': 'scheduled lights'}), 200


def lgt_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.LOW)
    GPIO.cleanup()
    return jsonify({'msg': 'light sch off'}), 200


@app.route('/api/v1/sch_l_on/<tm>', methods=['GET'])
def sch_l_on(tm=4):
    t = Event()
    WAIT_TIME = int(tm)
    while not t.wait(WAIT_TIME):
        lgt_on()
        break
    return "OK", 200


@app.route('/api/v1/sch_l_off/<tm>', methods=['GET'])
def sch_l_off(tm=4):
    t = Event()
    WAIT_TIME = int(tm)
    while not t.wait(WAIT_TIME):
        lgt_off()
        break
    return "OK", 200


# manual aux1 controls
@app.route('/api/v1/aux_1_on', methods=['GET'])
def aux_1_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.HIGH)

    return jsonify({'msg': 'aux 1 on'}), 200


@app.route('/api/v1/aux_1_off', methods=['GET'])
def aux_1_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.LOW)
    GPIO.cleanup()

    return jsonify({'msg': 'aux 1 off'}), 200


# schedule aux1 controls
def aux1_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.HIGH)
    return jsonify({'msg': 'aux 1 scheduled'}), 200


def aux1_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.LOW)
    GPIO.cleanup()
    return jsonify({'msg': 'aux1 sch off'}), 200


@app.route('/api/v1/sch_a1_on/<tm>', methods=['GET'])
def sch_a1_on(tm=4):
    t = Event()
    WAIT_TIME = int(tm)
    while not t.wait(WAIT_TIME):
        aux1_on()
        break
    return "OK", 200


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

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.HIGH)

    return jsonify({'msg': 'aux 2 on'}), 200


@app.route('/api/v1/aux_2_off', methods=['GET'])
def aux_2_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.LOW)
    GPIO.cleanup()

    return jsonify({'msg': 'aux 2 off'}), 200


# schedule aux2 controls
def aux2_on():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.HIGH)
    return jsonify({'msg': 'aux2 scheduled'}), 200


def aux2_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.LOW)
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
    app.run(HOST)


"""

PUMP, LIGHTS, CLEANER:
- need to add short timer on the manual buttons *(might only need to implement this on the front end)
- need to implement daily schedule on all modules for on AND off
- need to add auto on and off for pump if temp limit is reached

"""
