import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    TextInput,
    Platform
} from 'react-native';
import Logout from '../../Logout';
import PumpDisp from '../../PumpDisp';
import TempDisp from '../../TempDisp';
import WaterTemp from '../../WaterTemp';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';

let ipAddr = (Platform.OS === 'ios') ? '127.0.0.1' : '10.0.2.2';

export default class Pump extends React.Component{
    static navigationOptions = {
        headerShown: false
    };
    
    constructor(props){
        super(props);
        this.state = {
            running: false,
            hour: 10,
            minute: 30,
            mid: 'AM',
            setSchHr: '12',
            setSchMin: '00',
            setSchMid: 'PM',
            data: '',
            pTime: '10:01AM',
            format_hour: 10,
            format_minute: 30
        }
        this.pumpState = this.pumpState.bind(this);
        this.schPmpOn = this.schPmpOn.bind(this);
        this.schPmpOff = this.schPmpOff.bind(this);
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
                running: data.pswitch,
            })
        })
        .catch((err) => {
            console.log(err)
        })
    }

    schPmpOff = (tm=4) => {
        fetch(`http://${ipAddr}:5000/api/v1/sch_p_off/${tm}`)
        .then((response) => {
            let data = response.json()
            return data
        })
        .then((data) => {
            this.setState({
                running: data.msg
            })
        })
        .catch((error) => {
            console.warn(error)
        })
    }

    onChangeText = (key, val) => {
        this.setState({
            [key]: val
        });
    }

    async setSchTime() {
        let token = await AsyncStorage.getItem('x-access-token');
        let am_pm_arr = [`AM`, `PM`];
        let collectTime = {}
        if(this.state.hour > 12 || this.state.hour < 1 || this.state.hour == ''){
            alert('please make sure your hour format is the proper 12 hour time format')
            return null
        } else if(this.state.minute > 59 || this.state.minute < 1 || this.state.minute == ''){
            alert('please make sure your minute format is the proper time format')
            return null
        } else if(! am_pm_arr.includes(this.state.mid)){
            alert(`please make sure you enter either 'AM' or 'PM'`)
            return null
        }
        collectTime.pHr = this.state.hour
        collectTime.pMin = this.state.minute
        collectTime.pMid = this.state.mid
        this.setState({
            setSchHr: this.state.hour,
            setSchMin: this.state.minute,
            setSchMid: this.state.mid
        })
        fetch(`http://${ipAddr}:5000/api/v1/add_p_time`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'x-access-token': token,
                withCredentials: true
            },
            body: JSON.stringify(collectTime)
        })
    }

    async schPmpOn() {
        let token = await AsyncStorage.getItem('x-access-token');
        fetch(`http://${ipAddr}:5000/api/v1/show_p_time`, {
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
            let hour = data.ptime[0].pHr;
            let minute = data.ptime[0].pMin;
            let am_pm = data.ptime[0].pMid;
            // let unformated = `${hour}:${(minute < 10) ? `0${minute}` : minute}`
            if(am_pm === 'AM' && hour === parseInt(12) && (minute >= parseInt('00', 8) && minute <= parseInt(59))){
                hour -= 12
                let format_hr = `${(hour < 10) ? `0${hour}` : hour}`
                let format_min = `${(minute < 10) ? `0${minute}` : minute}`
                let tm = {format_hr, format_min}
                return tm
                // let formated = `${(hour < 10) ? `0${hour}` : hour}:${(minute < 10) ? `0${minute}` : minute}`
                // alert(formated)
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
            let token = await AsyncStorage.getItem('x-access-token');
            fetch(`http://${ipAddr}:5000/api/v1/sch_p_on/${tm.format_hr}/${tm.format_min}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                    withCredentials: true
                }
            })
        })
        .catch((error) => {
            console.log(error)
        })
    }

    async showSchTime() {
        let token = await AsyncStorage.getItem('x-access-token')
        fetch(`http://${ipAddr}:5000/api/v1/show_p_time`, {
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
                data: data.ptime
            })
        })
        .then((data) => {
            this.setState({
                setSchHr: this.state.data[0].pHr,
                setSchMin: (this.state.data[0].pMin < 10) ? `0${this.state.data[0].pMin}` : this.state.data[0].pMin,
                setSchMid: this.state.data[0].pMid                
            })
        })
        .catch((err) => {
            console.log(err)
        })
    }

    componentDidMount(){
        this.showSchTime()
        this.pumpState()
    }

    navControl = () => {
        this.props.navigation.navigate('ControlDisp');
    }
    
    render() {
        return (
            <View style={styles.container}>
                <ImageBackground
                    style={styles.image}
                    source={require('../../img/landingPage.jpg')}>
                    <View style={styles.subContainer}>

                        <Text style={styles.schPmpHeader}>
                            Schedule Pump Control
                        </Text>

                        <TempDisp />
                        <WaterTemp />
                        <PumpDisp running={this.state.running} />

                        <View style={styles.currSchContainer}>
                            <Text style={styles.currSchHeader}>
                                {/* Current Schedule: &nbsp; {this.state.pTime} */}
                                Current Schedule: &nbsp; {this.state.setSchHr}:{this.state.setSchMin} {this.state.setSchMid}
                            </Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.schInput}
                                autoCorrect={false}
                                onChangeText={val => this.onChangeText('hour', val)}
                                keyboardType={(Platform.OS === 'ios') ? 'numbers-and-punctuation' : 'numeric'}
                                maxLength={2}
                                returnKeyType='next'
                                onSubmitEditing={() => this.minuteuInput.focus()}
                                placeholder="10" />
                            <Text style={styles.colon}>
                                :
                            </Text>
                            <TextInput 
                                style={styles.schInput}
                                autoCorrect={false}
                                onChangeText={val => this.onChangeText('minute', val)}
                                keyboardType={(Platform.OS === 'ios') ? 'numbers-and-punctuation' : 'numeric'}
                                maxLength={2}
                                returnKeyType='next'
                                ref={(input) => this.minuteuInput = input}
                                onSubmitEditing={() => this.midInput.focus()}
                                placeholder="30" />
                            <TextInput 
                                style={styles.schInput}
                                autoCapitalize='characters'
                                autoCorrect={false}
                                onChangeText={val => this.onChangeText('mid', val)}
                                maxLength={2}
                                keyboardType='default'
                                returnKeyType='done'
                                ref={(input) => this.midInput = input}
                                onSubmitEditing={() => this.setSchTime()}
                                placeholder={'AM'} />
                        </View>
                        <View style={styles.btnContainer}>
                            <TouchableOpacity style={styles.schPmpBtn} onPress={() => this.setSchTime()}>
                                <Text style={styles.schPmpBtnTxt}>
                                    set
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.schPmpBtn} onPress={() => this.schPmpOn()}>
                                <Text style={styles.schPmpBtnTxt}>
                                    {this.state.running === true ? 'off' : 'run'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Logout navigation={this.props.navigation.navigate} logBtn={styles.logBtn} />
                        <TouchableOpacity style={styles.backBtn} onPress={this.navControl}>
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
        top: (Platform.OS === 'ios') ? 75 : 35,
        alignItems: 'center'
    },
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
    schPmpHeader: {
        fontSize: (Platform.OS === 'ios') ? 30 : 35,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 40
    },
    currSchHeader: {
        borderWidth: 1,
        borderColor: 'white',
        borderStyle: 'solid',
        textAlign: 'center',
        width: (Platform.OS === 'ios') ? 355 : 395,
        color: 'white',
        fontWeight: 'bold',
        fontSize: (Platform.OS === 'ios') ? 18 : 22,
        marginTop: 20
    },
    inputContainer: {
        flexDirection: 'row',
        marginTop: (Platform.OS === 'ios') ? 30 : 25,
    },
    schInput: {
        width: (Platform.OS === 'ios') ? 43 : 45,
        height: (Platform.OS === 'ios') ? 35 : 45,
        backgroundColor: 'lightblue',
        borderColor: 'lightgray',
        fontWeight: (Platform.OS === 'ios') ? '500' : 'bold',
        borderWidth: 2,
        borderRadius: 3,
        fontSize: (Platform.OS === 'ios') ? 25 : 20,
        marginRight: (Platform.OS === 'ios') ? 3 : 5,
        textAlign: 'center'
    },
    colon: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
        marginRight: (Platform.OS === 'ios') ? 3 : 5,
    },
    btnContainer: {
        flexDirection: 'row',
        fontSize: 25,
        marginTop: 25,
        zIndex: 1,
    },
    schPmpBtn: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 150,
        marginLeft: 10,
        marginRight: 12,
    },
    schPmpBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    logBtn: {
        top: (Platform.OS === 'ios') ? 130 : 70,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 10,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 340
    },
    backBtn: {
        top: (Platform.OS === 'ios') ? 150 : 90,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 150,
    },
    backBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
});
