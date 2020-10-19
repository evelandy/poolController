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
import Aux1Disp from '../../Aux1Disp';

let ipAddr = (Platform.OS === 'ios') ? '127.0.0.1' : '10.0.2.2';

export default class Aux1 extends React.Component{
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
            a1Time: '10:01AM'
        }
        this.aux1State = this.aux1State.bind(this)
    }

    // state = {
    //     running: false,
    //     hour: 10,
    //     minute: 30,
    //     mid: 'AM',
    //     setSchHr: '12',
    //     setSchMin: '00',
    //     setSchMid: 'PM'
    // }

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
                running: data.a1switch,
            })
        })
        .catch((err) => {
            console.log(err)
        })
    }
    
    schAux1On = (tm=4) => {
        // fetch(`http://${ipAddr}:5000/api/v1/sch_a1_on/${tm}`)
        // .then((response) => {
        //     let data = response.json()
        //     return data
        // })
        // .then((data) => {
        //     this.setState({
        //         running: data.msg
        //     })
        // })
        // .catch((error) => {
        //     console.warn(error)
        // })
    }

    schAux1Off = (tm=4) => {
        fetch(`http://${ipAddr}:5000/api/v1/sch_a1_off/${tm}`)
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
        let collectTime = {}
        collectTime.a1Hr = this.state.hour
        collectTime.a1Min = this.state.minute
        collectTime.a1Mid = this.state.mid
        this.setState({
            setSchHr: this.state.hour,
            setSchMin: this.state.minute,
            setSchMid: this.state.mid
        })
        fetch(`http://${ipAddr}:5000/api/v1/add_a1_time`, {
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

    async showSchTime() {
        let token = await AsyncStorage.getItem('x-access-token')
        fetch(`http://${ipAddr}:5000/api/v1/show_a1_time`, {
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
                data: data.a1time
            })
        })
        .then((data) => {
            this.setState({
                setSchHr: this.state.data[0].a1Hr,
                setSchMin: this.state.data[0].a1Min,
                setSchMid: this.state.data[0].a1Mid
            })
        })
        .catch((err) => {
            console.log(err)
        })
    }

    runSchTime = () => {
        fetch(`http://${ipAddr}:5000/api/v1/run_a1_time`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            let data = res.json()
            return data
        })
        .then((data) => {
            console.log(data)
        })
        .catch((err) => {
            console.log(err)
        })
    }

    componentDidMount(){
        this.showSchTime()
        this.aux1State()
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

                        <Text style={styles.schAux1Header}>
                            Schedule Aux1 Control
                        </Text>

                        <TempDisp />
                        <WaterTemp />
                        <Aux1Disp running={this.state.running} />
                        {/* <PumpDisp running={this.state.running} /> */}

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
                                placeholder={"AM"} />
                        </View>
                        <View style={styles.btnContainer}>
                            <TouchableOpacity style={styles.schAux1Btn} onPress={() => this.setSchTime()}>
                                <Text style={styles.schAux1BtnTxt}>
                                    set
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.schAux1Btn} onPress={() => this.runSchTime()}>
                                <Text style={styles.schAux1BtnTxt}>
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
    schAux1Header: {
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
        width: (Platform.OS === 'ios') ? 355 : 395,
        marginTop: 20
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
    schAux1Btn: {
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
    schAux1BtnTxt: {
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
