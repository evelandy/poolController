from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, request, make_response, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from functools import wraps
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


# login + user info class
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

    def __init__(self, fname, lname, username, password, email,
                 address, add2, city, sta, zipCode, phone, admin):
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


# pump timer class
class p_ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pHr = db.Column(db.Integer)
    pMin = db.Column(db.Integer)
    pMid = db.Column(db.String(2))
    user_id = db.Column(db.Integer)


# pump switch status class
class p_status(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pswitch = db.Column(db.Boolean)
    user_id = db.Column(db.Integer)


# cleaner timer class
class c_ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cHr = db.Column(db.Integer)
    cMin = db.Column(db.Integer)
    cMid = db.Column(db.String(2))
    user_id = db.Column(db.Integer)


# cleaner switch status class
class c_status(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cswitch = db.Column(db.Boolean)
    user_id = db.Column(db.Integer)


# light timer class
class l_ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lHr = db.Column(db.Integer)
    lMin = db.Column(db.Integer)
    lMid = db.Column(db.String(2))
    user_id = db.Column(db.Integer)


# light switch status class
class l_status(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lswitch = db.Column(db.Boolean)
    user_id = db.Column(db.Integer)


# aux1 timer class
class a1_ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    a1Hr = db.Column(db.Integer)
    a1Min = db.Column(db.Integer)
    a1Mid = db.Column(db.String(2))
    user_id = db.Column(db.Integer)


# aux1 switch status class
class a1_status(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    a1switch = db.Column(db.Boolean)
    user_id = db.Column(db.Integer)


# temperature trigger and switch class
class temp_trigger(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    triggerTemp = db.Column(db.Integer)
    triggerSwitch = db.Column(db.Boolean)
    user_id = db.Column(db.Integer)


class t_ctrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tHr = db.Column(db.Integer)
    tMin = db.Column(db.Integer)
    tMid = db.Column(db.String(2))
    user_id = db.Column(db.Integer)


# checks if token is present and valid
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


###################################################################################################################user
# adds user ((sets admin to False by default))
@app.route('/api/v1/user', methods=['POST'])
def add_user():
    data = request.get_json()
    hash_password = generate_password_hash(data['password'], method='sha256')
    new_user = User(fname=data['fname'], lname=data['lname'], username=data['username'], password=hash_password,
                    email=data['email'], address=data['address'], add2=data['add2'], city=data['city'],
                    sta=data['sta'], zipCode=data['zipCode'], phone=data['phone'], admin=False)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'creation successful!'}), 201


# shows users' info
@app.route('/api/v1/user', methods=['GET'])
@token_req
def show_user(current_user):
    user_list = User.query.filter_by(user_id=current_user.id).first()
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
        output.append(user_data)
    return jsonify(output), 200


# edits username
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


# logout
@app.route('/api/v1/logout', methods=['POST'])
def logout():
    pass


###################################################################################################################temp
# sends request to RPi server to get water temp then returns the temp result
@app.route('/api/v1/temp', methods=['POST'])
@token_req
def temp(current_user):
    data = request.get_json()
    res = requests.get(url='http://{}:{}/api/v1/temp'.format(RPI_IP_ADDR, RPI_PORT),
                       headers={'x-access-token': '{}'.format(data)})
    # with open('/tmp/movies.tmp.json', 'w') as f:
    #     f.write(res.text)
    return jsonify({'message': '{}'.format(res.json())})


############################################################################################################tempTrigger
# set water trigger temp for pump to turn on
@app.route('/api/v1/temp/trigger_temp', methods=['PUT'])
@token_req
def trigger_temp(current_user):
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
        res = requests.get(url='http://{}:{}/api/v1/trigger_temp/{}'.format(RPI_IP_ADDR, RPI_PORT, tmp))
        return jsonify({'message': 'temperature saved'}), 201
    else:
        data = request.get_json()
        new_trigger_temp = temp_trigger(triggerTemp=data['triggerTemp'], triggerSwitch=False, user_id=current_user.id)
        db.session.add(new_trigger_temp)
        db.session.commit()
        ttemp = temp_trigger.query.all()
        tmp = ttemp[0].triggerTemp
        res = requests.get(url='http://{}:{}/api/v1/trigger_temp/{}'.format(RPI_IP_ADDR, RPI_PORT, tmp))
        return jsonify({'message': 'temperature saved'}), 201


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
    ttime_dict['pHr'] = ttime[0].tHr
    ttime_dict['pMin'] = ttime[0].tMin
    ttime_dict['pMid'] = ttime[0].tMid
    output.append(ttime_dict)
    return jsonify({'ttime': output}), 200


@app.route('/api/v1/sch_t_on/<hr>/<mn>', methods=['POST'])
@token_req
def sch_t_on(current_user, hr, mn):
    res = requests.get(url='http://{}:{}/api/v1/temp_time_on/{}/{}'.format(RPI_IP_ADDR, RPI_PORT, hr, mn))
    return jsonify({'message': 'true'}), 200


###################################################################################################################pump
# sets time for pump scheduler
@app.route('/api/v1/add_p_time', methods=['GET'])
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


# displays set time for pump scheduler if no time set, displays default time
@app.route('/api/v1/show_p_time')
@token_req
def show_p_time(current_user):
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


# sends time to RPi scheduler to turn pump on
@app.route('/api/v1/sch_p_on/<hr>/<mn>', methods=['POST'])
@token_req
def sch_p_on(current_user, hr, mn):
    res = requests.get(url='http://{}:{}/api/v1/sch_p_on/{}/{}'.format(RPI_IP_ADDR, RPI_PORT, hr, mn))
    # spstatus = p_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    # spdata = {}
    # if spstatus.pswitch == False:
    #     spstatus.pswitch = True
    #     db.session.commit()
    #     spdata['pswitch'] = spstatus.pswitch

    # return jsonify(spdata), 200
    return jsonify({'message': 'true'}), 200


"""
# sends time to RPi scheduler to turn pump off
@app.route('/api/v1/sch_p_off/<tm>', methods=['GET'])
@token_req
def sch_p_off(current_user, tm=5):
    res = requests.get(url='http://{}:{}/api/v1/sch_p_off/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
    return jsonify({'message': 'false'}), 200
"""


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


# pump on control from server to RPi
@app.route('/api/v1/pump_on', methods=['POST'])
@token_req
def pump_on(current_user):
    data = request.get_json()
    res = requests.get(url='http://{}:{}/api/v1/pump_on'.format(RPI_IP_ADDR, RPI_PORT),
                       headers={'x-access-token': '{}'.format(data)})
    pstatus = p_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    pdata = {}
    if pstatus.pswitch == False:
        pstatus.pswitch = True
        db.session.commit()
        pdata['pswitch'] = pstatus.pswitch
    return jsonify(pdata), 200



# pump off control from server to RPi
@app.route('/api/v1/pump_off', methods=['POST'])
@token_req
def pump_off(current_user):
    data = request.get_json()
    res = requests.get(url='http://{}:{}/api/v1/pump_off'.format(RPI_IP_ADDR, RPI_PORT),
                       headers={'x-access-token': '{}'.format(data)})
    pstatus = p_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    pdata = {}
    if pstatus.pswitch == True:
        pstatus.pswitch = False
        db.session.commit()
        pdata['pswitch'] = pstatus.pswitch
    return jsonify(pdata), 200


################################################################################################################cleaner
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


# cleaner on control from server to RPi
@app.route('/api/v1/clean_on', methods=['POST'])
@token_req
def clean_on(current_user):
    data = request.get_json()
    res = requests.get(url='http://{}:{}/api/v1/clean_on'.format(RPI_IP_ADDR, RPI_PORT),
                       headers={'x-access-token': '{}'.format(data)})
    cstatus = c_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    cdata = {}
    if cstatus.cswitch == False:
        cstatus.cswitch = True
        db.session.commit()
        cdata['cswitch'] = cstatus.cswitch
    return jsonify(cdata), 200



# cleaner off control from server to RPi
@app.route('/api/v1/clean_off', methods=['POST'])
@token_req
def clean_off(current_user):
    data = request.get_json()
    res = requests.get(url='http://{}:{}/api/v1/clean_off'.format(RPI_IP_ADDR, RPI_PORT),
                       headers={'x-access-token': '{}'.format(data)})
    cstatus = c_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    cdata = {}
    if cstatus.cswitch == True:
        cstatus.cswitch = False
        db.session.commit()
        cdata['cswitch'] = cstatus.cswitch
    return jsonify(cdata), 200


# sets time for cleaner scheduler
@app.route('/api/v1/add_c_time', methods=['POST'])
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


# displays set time for cleaner scheduler if no time set, displays default time
@app.route('/api/v1/show_c_time')
@token_req
def show_c_time(current_user):
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


# remember to send the token data to the RPi server when using the sch_c_on and sch_c_off functions <<<<<<<<<<=========
# sends time to RPi scheduler to turn cleaner on
@app.route('/api/v1/sch_c_on/<hr>/<mn>', methods=['POST'])
@token_req
def sch_c_on(current_user, hr, mn):
    res = requests.get(url='http://{}:{}/api/v1/sch_c_on/{}/{}'.format(RPI_IP_ADDR, RPI_PORT, hr, mn))
    # tm = int(tm)
    # res = requests.get(url='http://{}:{}/api/v1/sch_c_on/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
    return jsonify({'message': 'true'}), 200


# # sends time to RPi scheduler to turn cleaner off
# @app.route('/api/v1/sch_c_off/<tm>', methods=['GET'])
# @token_req
# def sch_c_off(current_user, tm=5):
#     res = requests.get(url='http://{}:{}/api/v1/sch_c_off/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
#     return jsonify({'message': 'false'}), 200



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


# light on control from server to RPi
@app.route('/api/v1/light_on', methods=['POST'])
@token_req
def light_on(current_user):
    data = request.get_json()
    res = requests.get(url='http://{}:{}/api/v1/light_on'.format(RPI_IP_ADDR, RPI_PORT),
                       headers={'x-access-token': '{}'.format(data)})
    lstatus = l_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    ldata = {}
    if lstatus.lswitch == False:
        lstatus.lswitch = True
        db.session.commit()
        ldata['lswitch'] = lstatus.lswitch
    return jsonify(ldata), 200



# light off control from server to RPi
@app.route('/api/v1/light_off', methods=['POST'])
@token_req
def light_off(current_user):
    data = request.get_json()
    res = requests.get(url='http://{}:{}/api/v1/light_off'.format(RPI_IP_ADDR, RPI_PORT),
                       headers={'x-access-token': '{}'.format(data)})
    lstatus = l_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    ldata = {}
    if lstatus.lswitch == True:
        lstatus.lswitch = False
        db.session.commit()
        ldata['lswitch'] = lstatus.lswitch
    return jsonify(ldata), 200


# sets time for light scheduler
@app.route('/api/v1/add_l_time', methods=['POST'])
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


# displays set time for light scheduler if no time set, displays default time
@app.route('/api/v1/show_l_time')
@token_req
def show_l_time(current_user):
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


# remember to send the token data to the RPi server when using the sch_l_on and sch_l_off functions <<<<<<<<<<=========
# sends time to RPi scheduler to turn light on
@app.route('/api/v1/sch_l_on/<hr>/<mn>', methods=['POST'])
@token_req
def sch_l_on(current_user, hr, mn):
    res = requests.get(url='http://{}:{}/api/v1/sch_l_on/{}/{}'.format(RPI_IP_ADDR, RPI_PORT, hr, mn))
    # tm = int(tm)
    # res = requests.get(url='http://{}:{}/api/v1/sch_l_on/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
    return jsonify({'message': 'true'}), 200


# # sends time to RPi scheduler to turn light off
# @app.route('/api/v1/sch_l_off/<tm>', methods=['GET'])
# @token_req
# def sch_l_off(current_user, tm=5):
#     res = requests.get(url='http://{}:{}/api/v1/sch_l_off/{}'.format(RPI_IP_ADDR, RPI_PORT, tm))
#     return jsonify({'message': 'false'}), 200


###################################################################################################################aux1
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


# aux1 on control from server to RPi
@app.route('/api/v1/aux1_on', methods=['POST'])
@token_req
def aux1_on(current_user):
    data = request.get_json()
    res = requests.get(url='http://{}:{}/api/v1/aux1_on'.format(RPI_IP_ADDR, RPI_PORT),
                       headers={'x-access-token': '{}'.format(data)})
    a1status = a1_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    a1data = {}
    if a1status.a1switch == False:
        a1status.a1switch = True
        db.session.commit()
        a1data['a1switch'] = a1status.a1switch
    return jsonify(a1data), 200



# aux1 off control from server to RPi
@app.route('/api/v1/aux1_off', methods=['POST'])
@token_req
def aux1_off(current_user):
    data = request.get_json()
    res = requests.get(url='http://{}:{}/api/v1/aux1_off'.format(RPI_IP_ADDR, RPI_PORT),
                       headers={'x-access-token': '{}'.format(data)})
    a1status = a1_status.query.filter_by(user_id=current_user.id, id=current_user.id).first()
    a1data = {}
    if a1status.a1switch == True:
        a1status.a1switch = False
        db.session.commit()
        a1data['a1switch'] = a1status.a1switch
    return jsonify(a1data), 200


# sets time for aux1 scheduler
@app.route('/api/v1/add_a1_time', methods=['POST'])
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


# displays set time for aux1 scheduler if no time set, displays default time
@app.route('/api/v1/show_a1_time')
@token_req
def show_a1_time(current_user):
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


# sends time to RPi scheduler to turn aux1 on
@app.route('/api/v1/sch_a1_on/<hr>/<mn>', methods=['POST'])
@token_req
def sch_a1_on(current_user, hr, mn):
    res = requests.get(url='http://{}:{}/api/v1/sch_a1_on/{}/{}'.format(RPI_IP_ADDR, RPI_PORT, hr, mn))
    return jsonify({'message': 'true'}), 200


if __name__ == "__main__":
    app.run(debug=True)
