import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    StatusBar,
    TouchableOpacity,
    LogBox, 
    Platform
} from 'react-native';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';
let jwtDecode = require('jwt-decode');
// console.disableYellowBox = true;
LogBox.ignoreAllLogs();
import TempDisp from './TempDisp';
import PumpDisp from './PumpDisp';
import CleanDisp from './CleanDisp';
import LightDisp from './LightDisp';
import WaterTemp from './WaterTemp';
import Logout from './Logout';
import Aux1Disp from './Aux1Disp';

// let ipAddr = (Platform.OS === 'ios') ? '127.0.0.1' : '10.0.2.2';
let ipAddr = '192.168.1.142';

export default class Dashboard extends React.Component{
    static navigationOptions = {
        headerShown: false
    };

    constructor(props){
        super(props);
        this.state = { 
            greet: 'Hey',
            fname: '',
            username: '',
            prunning: false,
            crunning: false,
            lrunning: false,
            a1running: false
        }
        this.pumpState = this.pumpState.bind(this);
        this.cleanState = this.cleanState.bind(this);
        this.lightState = this.lightState.bind(this);
        this.aux1State = this.aux1State.bind(this);
    }

    // state = {
    //     greet: 'Hey',
    //     fname: '',
    //     username: '',
    //     prunning: false,
    //     crunning: false,
    //     lrunning: false,
    // }

    greet_lst = [
        'Welcome',
        'Hello',
        'Hi',
        'Greetings',
        'Hey',
    ];

    componentDidMount(){
        // console.log(AsyncStorage.getItem('x-access-token'))
        this.displayFname()
        this.disp_greet_lst()
        this.pumpState()
        this.cleanState()
        this.lightState()
    }

    async pumpState() {
        let token = await AsyncStorage.getItem('x-access-token');
        await fetch(`http://${ipAddr}:5000/api/v1/pump_status`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'x-access-token': token,
                withCredentials: true
            }
        })
        .then((res) => {
            let data = res.json();
            return data;
        })
        .then((data) => {
            this.setState({
                prunning: data.pswitch,
            })
        })
        .catch((err) => {
            console.log('pump state' + err)
        })
    }

    async cleanState() {
        let token = await AsyncStorage.getItem('x-access-token');
        await fetch(`http://${ipAddr}:5000/api/v1/clean_status`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'x-access-token': token,
                withCredentials: true
            }
        })
        .then((res) => {
            let data = res.json();
            return data;
        })
        .then((data) => {
            this.setState({
                crunning: data.cswitch,
            })
        })
        .catch((err) => {
            console.log('clean state' + err)
        })
    }

    async lightState() {
        let token = await AsyncStorage.getItem('x-access-token');
        await fetch(`http://${ipAddr}:5000/api/v1/light_status`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'x-access-token': token,
                withCredentials: true
            }
        })
        .then((res) => {
            let data = res.json();
            return data;
        })
        .then((data) => {
            this.setState({
                lrunning: data.lswitch,
            })
        })
        .catch((err) => {
            console.log('light state' + err)
        })
    }

    async aux1State() {
        let token = await AsyncStorage.getItem('x-access-token');
        await fetch(`http://${ipAddr}:5000/api/v1/aux1_status`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'x-access-token': token,
                withCredentials: true
            }
        })
        .then((res) => {
            let data = res.json();
            return data;
        })
        .then((data) => {
            this.setState({
                a1running: data.a1switch,
            })
        })
        .catch((err) => {
            console.log('aux1 state' + err)
        })
    }

    disp_greet_lst = () => {
        let today = new Date();
        let curHr = today.getHours();
        if (curHr < 12) {
            this.greet_lst.push('Morning')
            let randomGreet = this.greet_lst[Math.floor(Math.random()*this.greet_lst.length)];
            return (
                this.setState({
                    greet: randomGreet
                })
            )
        } else if (curHr < 18) {
            this.greet_lst.push('Afternoon')
            let randomGreet = this.greet_lst[Math.floor(Math.random()*this.greet_lst.length)];
            return (
                this.setState({
                    greet: randomGreet
                })
            )
        } else {
            this.greet_lst.push('Evening')
            let randomGreet = this.greet_lst[Math.floor(Math.random()*this.greet_lst.length)];
            return (
                this.setState({
                    greet: randomGreet
                })
            )
        }
    }

    async displayFname(){
        let token = await AsyncStorage.getItem('x-access-token');
        let decoded = jwtDecode(token);
        if(decoded.fname[0] === decoded.fname[0].toUpperCase()){
            this.setState({
                fname: decoded.fname
            })
        } else if(decoded.fname[0] !== decoded.fname[0].toUpperCase()){
            this.setState({
                fname: decoded.fname.charAt(0).toUpperCase() + decoded.fname.slice(1)
            });
        }
    }

    async displayUsername(){
        let token = await AsyncStorage.getItem('x-access-token');
        let decoded = jwtDecode(token);
        if(decoded.username[0] === decoded.username[0].toUpperCase()){
            this.setState({
                username: decoded.username
            })
        } else if(decoded.username[0] !== decoded.username[0].toUpperCase()){
            this.setState({
                username: decoded.username.charAt(0).toUpperCase() + decoded.username.slice(1)
            });
        }
    }

    render() {        
        return (
            <View style={styles.container}>
                <StatusBar barStyle={'light-content'} />
                <ImageBackground
                        style={styles.image}
                        source={require('./img/landingPage.jpg')}>
                        <View style={styles.subContainer}>
                            <Text style={styles.dashHeader}>
                                {this.state.greet}, {this.state.fname}
                            </Text>
                            <View style={styles.dispContainer}>
                                <TempDisp />
                                <WaterTemp />
                                <CleanDisp running={this.state.crunning} />
                                <PumpDisp running={this.state.prunning} />
                                <LightDisp running={this.state.lrunning} />
                                <Aux1Disp running={this.state.a1running} />
                            </View>
                            <View style={styles.ctrlContainer}>
                                <TouchableOpacity style={styles.ctrlBtn} onPress={() => this.props.navigation.navigate('ControlDisp')}>
                                    <Text style={styles.ctrlBtnTxt}>
                                        Controls
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.settingBtn} onPress={() => this.props.navigation.navigate('UserSettings')}>
                                    <Text style={styles.settingBtnTxt}>
                                        Settings
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Logout navigation={this.props.navigation.navigate} logBtn={styles.logBtn}/>
                        </View>
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    subContainer: {
        top: 50,
        alignItems: 'center',
    },
    ctrlContainer: {
        zIndex: 1,
    },
    dispContainer: {
        alignItems: 'center'
    },
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
    dashHeader: {
        fontSize: (Platform.OS === 'ios') ? 30 : 40,
        fontWeight: 'bold',
        letterSpacing: 1,
        paddingBottom: 20,
        color: 'lightblue'
    },
    ctrlBtn: {
        top: (Platform.OS === 'ios') ? 200 : 0,
        marginTop: (Platform.OS === 'ios') ? 0 : 90,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 10,
        paddingRight: 100,
        paddingLeft: 100,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 340
    },
    ctrlBtnTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    settingBtn: {
        top: (Platform.OS === 'ios') ? 205 : 0,
        marginTop: (Platform.OS === 'ios' ? 0 : 15),
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 10,
        paddingRight: 100,
        paddingLeft: 100,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 340
    },
    settingBtnTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logBtn: {
        top: (Platform.OS === 'ios') ? 210 : 0,
        marginTop: (Platform.OS === 'ios') ? 0 : 15,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 10,
        paddingRight: 100,
        paddingLeft: 100,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 340
    },
    pmpHeader: {
        borderWidth: 1,
        borderColor: 'white',
        borderStyle: 'solid',
        paddingRight: 40,
        paddingLeft: 40,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 20
    },
})