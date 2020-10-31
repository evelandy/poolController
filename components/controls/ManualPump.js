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
            test: ''
        }
        this.pumpDisplay = this.pumpDisplay.bind(this);
        this.manPmpOn = this.manPmpOn.bind(this);
        this.manPmpOff = this.manPmpOff.bind(this);
    }

    // state = {
    //     running: false,
    //     triggerTemp: 0,
    //     setTriggerTemp: '0',
    //     currentTemp: 0,
    //     test: ''
    // }

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
        .catch((error) => {
            console.log(error)
        })
    }

    async manPmpOff() {
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
                            <TouchableOpacity style={styles.manPmpBtn} onPress={this.manPmpOn}>
                                <Text style={styles.manPmpBtnTxt}>
                                    on
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.manPmpBtn} onPress={this.manPmpOff}>
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
        // top: 360,
        top: (Platform.OS === 'ios') ? 360 : 365,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnContainer: {
        flexDirection: 'row',
        // top: 240,
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
        // padding: 15,
        padding: (Platform.OS === 'ios') ? 15 : 12,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        // width: 150,
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
        // top: 300,
        top: (Platform.OS === 'ios') ? 300 : 290,
        // padding: 15,
        padding: (Platform.OS === 'ios') ? 15 : 12,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 10,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        // width: 340
        width: (Platform.OS === 'ios') ? 340 : 300,
    },
    backBtn: {
        // top: 320,
        top: (Platform.OS === 'ios') ? 320 : 295,
        // padding: 15,
        padding: (Platform.OS === 'ios') ? 15 : 12,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        // width: 150,
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
        // paddingLeft: 15,
        // paddingRight: 15,
        width: 300,
        textAlign: 'center',
        paddingTop: 3,
        paddingBottom: 3,
        color: 'white',
        fontWeight: 'bold',
        // fontSize: 18,
        fontSize: (Platform.OS === 'ios') ? 18 : 20,
        marginTop: 10,
        // marginBottom: 5
        marginBottom: (Platform.OS === 'ios') ? 10 : 15,
    },
    infoHeader: {
        alignItems: 'center',
    },
    triggerHeader: {
        // fontSize: 23,
        fontSize: (Platform.OS === 'ios') ? 23 : 26,
        fontWeight: 'bold',
    },
    triggerBtn: {
        // padding: 15,
        padding: (Platform.OS === 'ios') ? 15 : 12,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        // width: 150,
        width: (Platform.OS === 'ios') ? 150 : 120,
    },
    triggerBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    triggerInput: {
        width: 55,
        // height: 35,
        height: (Platform.OS === 'ios') ? 35 : 42,
        backgroundColor: 'lightblue',
        borderColor: 'lightgray',
        borderWidth: 2,
        borderRadius: 3,
        // fontSize: 25,
        fontSize: (Platform.OS === 'ios') ? 25 : 18,
        textAlign: 'center',
        // marginBottom: 5
        marginBottom: (Platform.OS === 'ios') ? 10 : 15,
    },
});
