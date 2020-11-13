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
import LightDisp from '../../LightDisp';
import TempDisp from '../../TempDisp';
import WaterTemp from '../../WaterTemp';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';

// let ipAddr = (Platform.OS === 'ios') ? '127.0.0.1' : '10.0.2.2';
let ipAddr = '192.168.1.142';

export default class Light extends React.Component{
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
            lTime: '10:01AM',
            format_hour: 10,
            format_minute: 30
        }
        this.lightState = this.lightState.bind(this);
        this.schLgtOn = this.schLgtOn.bind(this);
        this.schLgtOff = this.schLgtOff.bind(this);
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
                running: data.lswitch,
            })
        })
        .catch((err) => {
            console.log(err)
        })
    }

    schLgtOff = (tm=4) => {
        fetch(`http://${ipAddr}:5000/api/v1/sch_l_off/${tm}`)
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
        collectTime.lHr = this.state.hour
        collectTime.lMin = this.state.minute
        collectTime.lMid = this.state.mid
        this.setState({
            setSchHr: this.state.hour,
            setSchMin: this.state.minute,
            setSchMid: this.state.mid
        })
        fetch(`http://${ipAddr}:5000/api/v1/add_l_time`, {
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

    async schLgtOn() {
        let token = await AsyncStorage.getItem('x-access-token');
        fetch(`http://${ipAddr}:5000/api/v1/show_l_time`, {
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
            let hour = data.ltime[0].lHr;
            let minute = data.ltime[0].lMin;
            let am_pm = data.ltime[0].lMid;
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
            let token = await AsyncStorage.getItem('x-access-token');
            fetch(`http://${ipAddr}:5000/api/v1/sch_l_on/${tm.format_hr}/${tm.format_min}`, {
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
            this.setState({
                running: data.lswitch
            })
        })
        .catch((error) => {
            console.log(error)
        })
    }

    async showSchTime() {
        let token = await AsyncStorage.getItem('x-access-token')
        fetch(`http://${ipAddr}:5000/api/v1/display_l_schedule`, {
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
                data: data.ltime
            })
        })
        .then((data) => {
            this.setState({
                setSchHr: this.state.data[0].lHr,
                setSchMin: (this.state.data[0].lMin < 10) ? `0${this.state.data[0].lMin}` : this.state.data[0].lMin,
                setSchMid: this.state.data[0].lMid
            })
        })
        .catch((err) => {
            console.log(err)
        })
    }

    componentDidMount(){
        this.showSchTime()
        this.lightState()
    }

    navControl = () => {
        this.props.navigation.navigate('ControlDisp')
    }

    render() {
        return (
            <View style={styles.container}>
                <ImageBackground
                    style={styles.image}
                    source={require('../../img/landingPage.jpg')}>
                    <View style={styles.subContainer}>

                        <Text style={styles.schLgtHeader}>
                            Schedule Light Control
                        </Text>
                        
                        <TempDisp />
                        <WaterTemp />
                        <LightDisp running={this.state.running} />

                        <View style={styles.currSchContainer}>
                            <Text style={styles.currSchHeader}>
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
                            <TouchableOpacity style={styles.schLgtBtn} onPress={() => this.setSchTime()}>
                                <Text style={styles.schLgtBtnTxt}>
                                    set
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.schLgtBtn} onPress={() => this.schLgtOn()}>
                                <Text style={styles.schLgtBtnTxt}>
                                    {/* {this.state.running === true ? 'off' : 'run'} */}
                                    run
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
    schLgtHeader: {
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
        marginTop: (Platform.OS === 'ios') ? 15 : 10
    },
    inputContainer: {
        flexDirection: 'row',
        marginTop: (Platform.OS === 'ios') ? 30 : 25,
    },
    schInput: {
        width: 42,
        width: (Platform.OS === 'ios') ? 42 : 45,
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
    schLgtBtn: {
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
    schLgtBtnTxt: {
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
