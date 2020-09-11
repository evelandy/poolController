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
import jwt


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SECRET_KEY'] = 'MainSecretKey'

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


# check to see that server is running and connected properly
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


# add / create user(s)
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


# logout
@app.route('/api/v1/logout', methods=['POST'])
def logout():
    pass


# @app.route('/api/v1/pump/<pool_id>', methods=['GET'])
# def pump(pool_id):
#     # res = requests.get(url='http://192.168.1.116:5000/api/led')
#     # return jsonify({'msg': 'pump on'})
#     pool = Ctrl.query.filter_by(id=pool_id).first()
#
#     if not pool:
#         return jsonify({'msg': 'pump not found'}), 404
#
#     if pool.pump == False:
#         pool.pump = True
#         db.session.commit()
#         return jsonify({'pump': True}), 201
#     else:
#         pool.pump = False
#         db.session.commit()
#         return jsonify({'pump': False}), 201


# pump controls from server to RPi
@app.route('/api/v1/pump_on', methods=['GET'])
def pump_on():
    res = requests.get(url='http://192.168.1.116:5000/api/v1/pump_on')
    return jsonify({'msg': 'pump on'}), 200


@app.route('/api/v1/pump_off', methods=['GET'])
def pump_off():
    res = requests.get(url='http://192.168.1.116:5000/api/v1/pump_off')
    return jsonify({'msg': 'pump off'}), 200


# @app.route('/api/v1/clean', methods=['GET'])
# def clean():
#     res = requests.get(url='http://192.168.1.116:5000/api/led')
#     return jsonify({'msg': 'cleaner on'})


# cleaner controls from server to RPi
@app.route('/api/v1/clean_on', methods=['GET'])
def clean_on():
    res = requests.get(url='http://192.168.1.116:5000/api/v1/clean_on')
    return jsonify({'msg': 'cleaner on'}), 200


@app.route('/api/v1/clean_off', methods=['GET'])
def clean_off():
    res = requests.get(url='http://192.168.1.116:5000/api/v1/clean_off')
    return jsonify({'msg': 'cleaner off'}), 200


# @app.route('/api/v1/light', methods=['GET'])
# def light():
#     res = requests.get(url='http://192.168.1.116:5000/api/led')
#     return jsonify({'msg': 'lights on'})


# light controls from server to RPi
@app.route('/api/v1/light_on', methods=['GET'])
def light_on():
    res = requests.get(url='http://192.168.1.116:5000/api/v1/light_on')
    return jsonify({'msg': 'lights on'}), 200


@app.route('/api/v1/light_off', methods=['GET'])
def light_off():
    res = requests.get(url='http://192.168.1.116:5000/api/v1/light_off')
    return jsonify({'msg': 'lights off'}), 200


if __name__ == '__main__':
    app.run(debug=True)


"""

PUMP, LIGHTS, CLEANER: 
- need to add short timer on the manual buttons *(might only need to implement this part on the front end)
- need to implement daily schedule on all modules for on AND off
- need to add auto on for pump if temp is at limit

"""
