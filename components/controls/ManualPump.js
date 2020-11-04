import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    TextInput, 
    Platform, 
    Keyboard
} from 'react-native';
import DismissKeyboard from '../DismissKeyboard';
import Logout from '../Logout';
import PumpDisp from '../PumpDisp';
import TempDisp from '../TempDisp';
import WaterTemp from '../WaterTemp';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';

let ipAddr = (Platform.OS === 'ios') ? '127.0.0.1' : '10.0.2.2';

export default class ManualPump extends React.Component{
    static navigationOptions = {
        headerShown: false
    };

    constructor(props){
        super(props);
        this.state = {
            running: false,
            triggerTemp: 0,
            setTriggerTemp: '0',
            currentTemp: 0,
            test: '',
            tStatus: false,
            sStatus: false,
            schHr: '',
            schMin: '',
            schMid: '',
            tempHr: '',
            tempMin: '',
            tempMid: '',
            schRestart: '',
            tempRestart: '',
            restartHr: '',
            restartMin: ''
        }
        this.pumpDisplay = this.pumpDisplay.bind(this);
        this.manPmpOn = this.manPmpOn.bind(this);
        this.manPmpOff = this.manPmpOff.bind(this);
        this.getSchTime = this.getSchTime.bind(this);
        this.getTempTriggerTime = this.getTempTriggerTime.bind(this);
    }

    componentDidMount() {
        this.pumpDisplay();
        // this.showTriggerTemp();
    }

    sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    triggerTemp(params) {
        let temp = Math.round(params);
        let timeToRun = temp / 10;
        // this.manPmpOn();
        // this.sleep(parseInt(timeToRun)).then(this.manPmpOff())
        this.sleep(timeToRun * 1000).then(() => {console.log('click')})
    }

    weatherTrigger = () => {
        const apiKey = '5490a59fae143d65082c3beeaeaf6982';
        fetch(`http://api.openweathermap.org/data/2.5/weather?q=galveston&appid=${apiKey}&units=imperial`)
        .then((res) => {
            let data = res.json();
            return data;
        })
        .then((data) => {
            this.setState({
                currentTemp: data.main.temp
            })
        })
        .then((data) => {
            this.triggerTemp(this.state.currentTemp)
        })
        .catch((err) => {
            console.log(err)
        })
    }

    async pumpDisplay() {
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
                running: data.pswitch,
            })
        })
        .catch((err) => {
            console.log(err)
        })
    }

    async manPmpOn() {
        if (this.state.tempRestart === true){
            //call function taht turns on pump for one time with new time in it
            this.restartTriggerTimer()
        } else {
            let token = await AsyncStorage.getItem('x-access-token')
            fetch(`http://${ipAddr}:5000/api/v1/pump_on`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                    withCredentials: true
                },
                body: JSON.stringify(token)
            })
            .then((response) => {
                let data = response.json();
                return data;
            })
            .then((data) => {
                this.setState({
                    running: data.pswitch
                })
            })
            .then(() => {
                this.state.tempRestart = false
            })
            .catch((error) => {
                console.log(error)
            })
        }
    }


    async restartSchTimer() {
        let token = await AsyncStorage.getItem('x-access-token')
        fetch(`http://${ipAddr}:5000/api/v1/getHoldTime`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'x-access-token': token,
                withCredentials: true
            }
        })
        .then((res) => {
            let data = res.json()
            return data
        })
        .then((data) => {
            this.setState({
                restartHr: data.hour,
                restartMin: data.minute
            })
        })
        .then(async() => {
            let rtime = {}
            rtime['hour'] = this.state.restartHr
            rtime['min'] = this.state.restartMin
            let token = await AsyncStorage.getItem('x-access-token')
            fetch(`http://${ipAddr}:5000/api/v1/sch/restartSchTime`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                    withCredentials: true
                },
                body: JSON.stringify(rtime)
            })
        })
    }

    async restartTriggerTimer() {
        let token = await AsyncStorage.getItem('x-access-token')
        fetch(`http://${ipAddr}:5000/api/v1/getHoldTime`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'x-access-token': token,
                withCredentials: true
            }
        })
        .then((res) => {
            let data = res.json()
            return data
        })
        .then((data) => {
            this.setState({
                restartHr: data.hour,
                restartMin: data.minute
            })
        })
        .then(async() => {
            let token = await AsyncStorage.getItem('x-access-token')
            fetch(`http://${ipAddr}:5000/api/v1/temp/restartTriggerTime/${this.state.restartHr}/${this.state.restartMin}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                    withCredentials: true
                }
            })
        })
        .then((data) => {
            console.log(data)
        })
    }

    async manPmpOff() {
        this.triggerOnCheck();
        let token = await AsyncStorage.getItem('x-access-token')
        fetch(`http://${ipAddr}:5000/api/v1/pump_off`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'x-access-token': token,
                withCredentials: true
            },
            body: JSON.stringify(token)
        })
        .then((response) => {
            let data = response.json()
            return data
        })
        .then((data) => {
            this.setState({
                running: data.pswitch
            })
        })
        .catch((error) => {
            console.log(error)
        })
    }

    async triggerOnCheck() {
        let token = await AsyncStorage.getItem('x-access-token')
        fetch(`http://${ipAddr}:5000/api/v1/temp/tStatus`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'x-access-token': token,
                withCredentials: true
            }
        })
        .then((res) => {
            let data = res.json()
            return data
        })
        .then((data) => {
            if (data.msg === true) {
                this.getTempTriggerTime()
                this.setState({
                    tempRestart: true
                })
            }
        })
        .then(async() => {
            let token = await AsyncStorage.getItem('x-access-token')
            fetch(`http://${ipAddr}:5000/api/v1/temp/trigger_temp_off`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                    withCredentials: true
                }
            })  
        })
        .catch((error) => {
            console.log("triggerOnCheck error: " + error)
        })
    }

    // async scheduleOnCheck() {
    //     let token = await AsyncStorage.getItem('x-access-token')
    //     fetch(`http://${ipAddr}:5000/api/v1/sch/sStatus`, {
    //         method: 'GET',
    //         headers: {
    //             'Accept': 'application/json, text/plain, */*',
    //             'Content-Type': 'application/json',
    //             'x-access-token': token,
    //             withCredentials: true
    //         }
    //     })
    //     .then((res) => {
    //         let data = res.json()
    //         return data
    //     })
    //     .then((data) => {
    //         if (data.msg === true){
    //             this.getSchTime()
    //             this.setState({
    //                 schRestart: true,
    //                 tempRestart: false
    //             })
    //         }
    //         this.getSchTime();
    //     })
    //     .catch((error) => {
    //         console.log("triggerOnCheck error: " + error)
    //     })
    // }

    async getSchTime() {
        let token = await AsyncStorage.getItem('x-access-token')
        fetch(`http://${ipAddr}:5000/api/v1/sch/getSchTime`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'x-access-token': token,
                withCredentials: true
            }
        })
        .then((res) => {
            let data = res.json()
            return data
        })
        .then((data) => {
            this.setState({
                schHr: data.hour,
                schMin: data.minute,
                schMid: data.mid
            })
        })
        .then((data) => {
            let hour = this.state.schHr;
            let minute = this.state.schMin;
            let am_pm = this.state.schMid;
            if(am_pm === 'AM' && hour === parseInt(12) && (minute >= parseInt('00', 8) && minute <= parseInt(59))){
                hour -= 12
                let format_hr = `${(hour < 10) ? `0${hour}` : hour}`
                let format_min = `${(minute < 10) ? `0${minute}` : minute}`
                let tm = {format_hr, format_min}
                return tm
            } else if(am_pm == 'PM'){
                if(hour != 12){
                    hour += 12
                    let format_hr = `${(hour < 10) ? `0${hour}` : hour}`
                    let format_min = `${(minute < 10) ? `0${minute}` : minute}`
                    let tm = {format_hr, format_min}
                    return tm
                } else {
                    let format_hr = `${(hour < 10) ? `0${hour}` : hour}`
                    let format_min = `${(minute < 10) ? `0${minute}` : minute}`
                    let tm = {format_hr, format_min}
                    return tm
                }
            } else {
                let format_hr = `${(hour < 10) ? `0${hour}` : hour}`
                let format_min = `${(minute < 10) ? `0${minute}` : minute}`
                let tm = {format_hr, format_min}
                return tm
            }
        })
        .then(async(tm) => {
            var d = new Date();
            current_hour = d.getHours();
            current_minute = d.getMinutes();
            sch_hour = tm.format_hr;
            sch_minite = tm.format_min;
            let makeup_hour;
            let makeup_min;
            if (sch_hour - current_hour < 0){
                makeup_hour = sch_hour - current_hour + 24;
            } else {
                makeup_hour = sch_hour - current_hour - 1 ;
            }

            if (current_minute - 60 < 0){
                makeup_min = 60 - current_minute;
            } else {
                makeup_min = current_minute - 60;
            }
            let holdTime = {}
            holdTime['holdHour'] = makeup_hour;
            holdTime['holdMin'] = makeup_min;
            let token = await AsyncStorage.getItem('x-access-token')
            fetch(`http://${ipAddr}:5000/api/v1/sch/holdTime`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                    withCredentials: true
                },
                body: JSON.stringify(holdTime)
            })
        })
        // .then((error) => {
        //     console.log('getSchTime error: ' + error)
        // })
    }

    async getTempTriggerTime() {
        let token = await AsyncStorage.getItem('x-access-token')
        fetch(`http://${ipAddr}:5000/api/v1/temp/getTriggerTime`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'x-access-token': token,
                withCredentials: true
            }
        })
        .then((res) => {
            let data = res.json()
            return data
        })
        .then((data) => {
            this.setState({
                tempHr: data.hour,
                tempMin: data.minute,
                tempMid: data.mid
            })
        })
        .then((data) => {
            let hour = this.state.tempHr;
            let minute = this.state.tempMin;
            let am_pm = this.state.tempMid;
            if(am_pm === 'AM' && hour === parseInt(12) && (minute >= parseInt('00', 8) && minute <= parseInt(59))){
                hour -= 12
                let format_hr = `${(hour < 10) ? `0${hour}` : hour}`
                let format_min = `${(minute < 10) ? `0${minute}` : minute}`
                let tm = {format_hr, format_min}
                return tm
            } else if(am_pm == 'PM'){
                if(hour != 12){
                    hour += 12
                    let format_hr = `${(hour < 10) ? `0${hour}` : hour}`
                    let format_min = `${(minute < 10) ? `0${minute}` : minute}`
                    let tm = {format_hr, format_min}
                    return tm
                } else {
                    let format_hr = `${(hour < 10) ? `0${hour}` : hour}`
                    let format_min = `${(minute < 10) ? `0${minute}` : minute}`
                    let tm = {format_hr, format_min}
                    return tm
                }
            } else {
                let format_hr = `${(hour < 10) ? `0${hour}` : hour}`
                let format_min = `${(minute < 10) ? `0${minute}` : minute}`
                let tm = {format_hr, format_min}
                return tm
            }
        })
        .then(async(tm) => {
            var d = new Date();
            current_hour = d.getHours();
            current_minute = d.getMinutes();
            temp_hour = tm.format_hr;
            temp_minite = tm.format_min;
            let makeup_hour;
            let makeup_min;
            if (temp_hour - current_hour < 0){
                makeup_hour = temp_hour - current_hour + 24;
            } else {
                makeup_hour = temp_hour - current_hour - 1 ;
            }

            if (current_minute - 60 < 0){
                makeup_min = 60 - current_minute;
            } else {
                makeup_min = current_minute - 60;
            }
            let holdTime = {}
            holdTime['holdHour'] = makeup_hour;
            holdTime['holdMin'] = makeup_min;
            let token = await AsyncStorage.getItem('x-access-token')
            fetch(`http://${ipAddr}:5000/api/v1/temp/holdTriggerTime`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                    withCredentials: true
                },
                body: JSON.stringify(holdTime)
            })
        })
        // .then((error) => {
        //     console.log('getSchTime error: ' + error)
        // })
    }

    // setTriggerTemp = () => {
    //     let collectTemp = {}
    //     collectTemp.triggerTemp = this.state.triggerTemp
    //     if(collectTemp.triggerTemp == 0){
    //         alert('please make sure you enter a value in the temperature input box')
    //     } else {
    //         this.setState({
    //             setTriggerTemp: this.state.triggerTemp
    //         })
    //         fetch(`http://${ipAddr}:5000/api/v1/temp/trigger_temp`, {
    //             method: 'PUT',
    //             headers: {
    //                 'Accept': 'application/json, text/plain, */*',
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(collectTemp)
    //         })
    //         .then((res) => {
    //             let data = res.json()
    //             return data
    //         })
    //         .then((data) => {
    //             console.log(data)
    //         })
    //         .catch((err) => {
    //             console.log(err)
    //         })
    //     }
    // }

    // showTriggerTemp = () => {
    //     fetch(`http://${ipAddr}:5000/api/v1/show_trigger_temp`)
    //     .then((res) => {
    //         let data = res.json()
    //         return data
    //     })
    //     .then((data) => {
    //         this.setState({
    //             setTriggerTemp: data.triggerTemp
    //         })
    //     })
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // }

    backToCtrl = () => {
        this.props.navigation.navigate('ControlDisp')
    }

    onChangeText = (key, val) => {
        this.setState({
            [key]: val
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <ImageBackground
                    style={styles.image}
                    source={require('../img/landingPage.jpg')}>
                    <View style={styles.subContainer}>
                        <Text style={styles.manPmpHeader}>
                            Manual Pump Controls
                        </Text>
                        <View style={styles.btnContainer}>
                            <TouchableOpacity style={styles.manPmpBtn} onPress={() => this.manPmpOn()}>
                                <Text style={styles.manPmpBtnTxt}>
                                    {/* {(this.state.tempRestart === true) ? 're-engage' : 'on'} */}
                                    on
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.manPmpBtn} onPress={() => this.manPmpOff()}>
                                <Text style={styles.manPmpBtnTxt}>
                                    off
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* code below is functionality for a trigger to turn on pump if water temp set by customer is met */}

                        {/* <DismissKeyboard keyboard={Keyboard}>
                        <View style={styles.triggerContainer}>
                            <Text style={styles.triggerHeader}>Set Temperature Trigger</Text>
                            <Text style={styles.tempHeader}>Set Temperature:  {this.state.setTriggerTemp} &deg;F</Text>
                            <TextInput 
                                style={styles.triggerInput}
                                autoCorrect={false}
                                onChangeText={val => this.onChangeText('triggerTemp', val)}
                                keyboardType='numbers-and-punctuation'
                                maxLength={3}
                                placeholder={'75'}
                                returnKeyType='send'
                                onSubmitEditing={() => this.setTriggerTemp()}
                            /> 
                            <TouchableOpacity style={styles.triggerBtn} onPress={() => this.setTriggerTemp()}>
                                <Text style={styles.triggerBtnTxt}>
                                    Set
                                </Text>
                            </TouchableOpacity>
                        </View>
                        </DismissKeyboard> */}


                        <View style={styles.infoHeader}>
                            <TempDisp />
                            <WaterTemp />
                            <PumpDisp running={this.state.running} />
                        </View>
                        <Logout navigation={this.props.navigation.navigate} logBtn={styles.logBtn} />
                        <TouchableOpacity style={styles.backBtn} onPress={this.backToCtrl}>
                            <Text style={styles.backBtnTxt}>
                                Back
                            </Text>
                        </TouchableOpacity>
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
        top: (Platform.OS === 'ios') ? 75 : 40,
        alignItems: 'center'
    },
    triggerContainer: {
        position: "absolute",
        top: (Platform.OS === 'ios') ? 360 : 365,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnContainer: {
        flexDirection: 'row',
        top: (Platform.OS === 'ios') ? 240 : 230,
        zIndex: 1,
    },
    manPmpHeader: {
        fontSize: (Platform.OS === 'ios') ? 30 : 36,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
    manPmpBtn: {
        top: 20,
        padding: (Platform.OS === 'ios') ? 15 : 12,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: (Platform.OS === 'ios') ? 150 : 120,
        marginLeft: 10,
        marginRight: 12
    },
    manPmpBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    logBtn: {
        top: (Platform.OS === 'ios') ? 300 : 290,
        padding: (Platform.OS === 'ios') ? 15 : 12,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 10,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: (Platform.OS === 'ios') ? 340 : 300,
    },
    backBtn: {
        top: (Platform.OS === 'ios') ? 320 : 295,
        padding: (Platform.OS === 'ios') ? 15 : 12,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: (Platform.OS === 'ios') ? 150 : 120,
    },
    backBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    tempHeader: {
        borderWidth: 1,
        borderColor: 'white',
        borderStyle: 'solid',
        width: 300,
        textAlign: 'center',
        paddingTop: 3,
        paddingBottom: 3,
        color: 'white',
        fontWeight: 'bold',
        fontSize: (Platform.OS === 'ios') ? 18 : 20,
        marginTop: 10,
        marginBottom: (Platform.OS === 'ios') ? 10 : 15,
    },
    infoHeader: {
        alignItems: 'center',
    },
    triggerHeader: {
        fontSize: (Platform.OS === 'ios') ? 23 : 26,
        fontWeight: 'bold',
    },
    triggerBtn: {
        padding: (Platform.OS === 'ios') ? 15 : 12,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: (Platform.OS === 'ios') ? 150 : 120,
    },
    triggerBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    triggerInput: {
        width: 55,
        height: (Platform.OS === 'ios') ? 35 : 42,
        backgroundColor: 'lightblue',
        borderColor: 'lightgray',
        borderWidth: 2,
        borderRadius: 3,
        fontSize: (Platform.OS === 'ios') ? 25 : 18,
        textAlign: 'center',
        marginBottom: (Platform.OS === 'ios') ? 10 : 15,
    },
});
