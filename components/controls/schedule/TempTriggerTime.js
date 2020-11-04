import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Platform
} from 'react-native';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';

let ipAddr = (Platform.OS === 'ios') ? '127.0.0.1' : '10.0.2.2';

export default class TempTriggerTime extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            hour: 8,
            minute: 10,
            mid: 'AM',
            setSchHr: '08',
            setSchMin: '00',
            setSchMid: 'AM',
            running: false
        }
        this.schTempTriggerOn = this.schTempTriggerOn.bind(this);
    }

    onChangeText = (key, val) => {
        this.setState({
            [key]: val
        });
    }
    
    async setTempTriggerTime() {
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
        collectTime.tHr = this.state.hour
        collectTime.tMin = this.state.minute
        collectTime.tMid = this.state.mid
        this.setState({
            setSchHr: this.state.hour,
            setSchMin: this.state.minute,
            setSchMid: this.state.mid
        })
        fetch(`http://${ipAddr}:5000/api/v1/set_trigger_time`, {
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

    // async testRunner() {
    //     let token = await AsyncStorage.getItem('x-access-token')
    //     fetch(`http://${ipAddr}:5000/api/v1/temp/switchStatus`, {
    //         method: 'PUT',
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
    //         console.log(data)
    //     })
    //     .catch((err) => {
    //         console.log('test runner ' + err)
    //     })
    // }


    async showTempTriggerTime() {
        let token = await AsyncStorage.getItem('x-access-token')
        fetch(`http://${ipAddr}:5000/api/v1/show_t_time`, {
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
                setSchHr: this.state.data[0].tHr,
                setSchMin: (this.state.data[0].tMin < 10) ? `0${this.state.data[0].tMin}` : this.state.data[0].tMin,
                setSchMid: this.state.data[0].tMid                
            })
        })
        .catch((err) => {
            console.log(err)
        })
    }

    async manPmpOff() {
        if(this.state.running === true){
            let token = await AsyncStorage.getItem('x-access-token')
            fetch(`http://${ipAddr}:5000/api/v1/temp_pump_off`, {
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
    }

    async schTempTriggerOn() {
        let token = await AsyncStorage.getItem('x-access-token');
        fetch(`http://${ipAddr}:5000/api/v1/show_t_time`, {
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
            let hour = data.ttime[0].tHr;
            let minute = data.ttime[0].tMin;
            let am_pm = data.ttime[0].tMid;
            this.setState({
                running: data.ttime[0].tswitch
            })
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
            fetch(`http://${ipAddr}:5000/api/v1/sch_t_on/${tm.format_hr}/${tm.format_min}`, {
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

    render() {
        return (
            <View>
                <Text style={styles.tempInputHeader}>Set a time for temperature trigger</Text>
                <View style={styles.triggerTimeContainer}>
                    <TextInput
                        style={styles.triggerTimeInput}
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
                        style={styles.triggerTimeInput}
                        autoCorrect={false}
                        onChangeText={val => this.onChangeText('minute', val)}
                        keyboardType={(Platform.OS === 'ios') ? 'numbers-and-punctuation' : 'numeric'}
                        maxLength={2}
                        returnKeyType='next'
                        ref={(input) => this.minuteuInput = input}
                        onSubmitEditing={() => this.midInput.focus()}
                        placeholder="30" />
                    <TextInput 
                        style={styles.triggerTimeInput}
                        autoCapitalize='characters'
                        autoCorrect={false}
                        onChangeText={val => this.onChangeText('mid', val)}
                        maxLength={2}
                        keyboardType='default'
                        returnKeyType='done'
                        ref={(input) => this.midInput = input}
                        onSubmitEditing={() => this.setTempTriggerTime()}
                        placeholder={'AM'} />
                </View>
                <View style={styles.btnContainer}>
                <TouchableOpacity style={styles.tempTriggerTimeBtn} onPress={() => this.setTempTriggerTime()}>
                    <Text style={styles.tempTriggerTimeBtnTxt}>
                        set
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tempTriggerTimeBtn} onPress={(this.state.running === false) ? this.schTempTriggerOn : () => this.manPmpOff()}>
                    <Text style={styles.tempTriggerTimeBtnTxt}>
                        {this.state.running === true ? 'off' : 'run'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
        );
    }
}

const styles = StyleSheet.create({
    triggerTimeContainer: {
        flexDirection: 'row',
        marginTop: (Platform.OS === 'ios') ? 10 : 5,
        marginLeft: (Platform.OS === 'ios') ? 97 : 90
    },
    tempInputHeader: {
        marginLeft: (Platform.OS === 'ios') ? 18 : 25,
        color: 'white',
        fontSize: 19,
        marginTop: 15,
        fontWeight: 'bold'
    },
    triggerTimeInput: {
        width: (Platform.OS === 'ios') ? 43 : 45,
        height: (Platform.OS === 'ios') ? 35 : 45,
        backgroundColor: 'lightblue',
        borderColor: 'lightgray',
        fontWeight: (Platform.OS === 'ios') ? '500' : 'bold',
        borderWidth: 2,
        borderRadius: 3,
        fontSize: (Platform.OS === 'ios') ? 25 : 20,
        marginRight: (Platform.OS === 'ios') ? 3 : 5,
        textAlign: 'center',
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
        marginTop: (Platform.OS === 'ios') ? 25 : 10,
        zIndex: 1,
    },
    tempTriggerTimeBtn: {
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
    tempTriggerTimeBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    }
});
