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


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SECRET_KEY'] = 'SecretKey'

db = SQLAlchemy(app)
CORS(app)


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

    return jsonify({'msg': 'pump on'}), 200


@app.route('/api/v1/pump_off', methods=['GET'])
def pump_off():
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.LOW)
    GPIO.cleanup()

    return jsonify({'msg': 'pump off'}), 200


# schedule pump controls
@app.route('/api/v1/sch_pump_on', methods=['GET'])
def sch_pump_on():
    pass



#                                                  THURSDAY 09-10-20 LEFT OFF HERE to end of while loop
"""
def pmp_on():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(18, GPIO.OUT)
    GPIO.output(18, GPIO.HIGH)
    sleep(5)
    GPIO.output(18, GPIO.LOW)
    GPIO.cleanup()
    return None


schedule.every(5).seconds.do(pmp_on)

count = 1

while True:
    schedule.run_pending()
    sleep(5)
    count -= 1
"""

# cleaner control
#@app.route('/api/v1/clean', methods=['GET'])
#def clean():
#    pass


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


# light control
#@app.route('/api/v1/light', methods=['GET'])
#def light():
#    pass


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


# logout
@app.route('/api/v1/logout', methods=['POST'])
def logout():
    pass


if __name__ == '__main__':
    app.run(host='192.168.1.116')


"""

PUMP, LIGHTS, CLEANER:
- need to add short timer on the manual buttons *(might only need to implement this on the front end)
- need to implement daily schedule on all modules for on AND off
- need to add auto on and off for pump if temp limit is reached

"""
