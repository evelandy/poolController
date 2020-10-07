import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    TextInput
} from 'react-native';
import Logout from '../Logout';
import PumpDisp from '../PumpDisp';
import TempDisp from '../TempDisp';
import WaterTemp from '../WaterTemp';

export default class ManualPump extends React.Component{
    static navigationOptions = {
        headerShown: false
    };

    state = {
        running: false,
        triggerTemp: 0,
        setTriggerTemp: '0'
    }

    componentDidMount() {
        this.pumpDisplay()
        this.showTriggerTemp()
    }

    async pumpDisplay() {
        await fetch('http://127.0.0.1:5000/api/v1/pump_status')
        .then((res) => {
            let data = res.json();
            return data;
        })
        .then((data) => {
            this.setState({
                running: data.pswitch
            })
        })
        .catch((err) => {
            console.log(err)
        })
    }

    manPmpOn = () => {
        fetch('http://127.0.0.1:5000/api/v1/pump_on')
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

    manPmpOff = () => {
        fetch('http://127.0.0.1:5000/api/v1/pump_off')
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

    setTriggerTemp = () => {
        let collectTemp = {}
        collectTemp.triggerTemp = this.state.triggerTemp
        if(collectTemp.triggerTemp == 0){
            alert('please make sure you enter a value in the temperature input box')
        } else {
            this.setState({
                setTriggerTemp: this.state.triggerTemp
            })
            fetch('http://127.0.0.1:5000/api/v1/temp/trigger_temp', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(collectTemp)
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
    }

    showTriggerTemp = () => {
        fetch('http://127.0.0.1:5000/api/v1/show_trigger_temp')
        .then((res) => {
            let data = res.json()
            return data
        })
        .then((data) => {
            this.setState({
                setTriggerTemp: data.triggerTemp
            })
        })
        .catch((err) => {
            console.log(err)
        })
    }

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

                        <View style={styles.triggerContainer}>
                            <Text style={styles.triggerHeader}>Set Temperature Trigger</Text>
                            <Text style={styles.tempHeader}>current temperature:  {this.state.setTriggerTemp} &deg;F</Text>
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

                        <TempDisp />
                        <WaterTemp />
                        <PumpDisp running={this.state.running} />
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
        top: 75,
        alignItems: 'center'
    },
    triggerContainer: {
        position: "absolute",
        top: 360,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnContainer: {
        flexDirection: 'row',
        top: 240,
        zIndex: 1,
    },
    manPmpHeader: {
        fontSize: 30,
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
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 150,
        marginLeft: 10,
        marginRight: 12
    },
    manPmpBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    logBtn: {
        top: 300,
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
        top: 320,
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
    tempHeader: {
        borderWidth: 1,
        borderColor: 'white',
        borderStyle: 'solid',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 3,
        paddingBottom: 3,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 10,
        marginBottom: 5
    },
    triggerHeader: {
        fontSize: 23,
        fontWeight: 'bold',
    },
    triggerBtn: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 150,
    },
    triggerBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    triggerInput: {
        width: 55,
        height: 35,
        backgroundColor: 'lightblue',
        borderColor: 'lightgray',
        borderWidth: 2,
        borderRadius: 3,
        fontSize: 25,
        textAlign: 'center',
        marginBottom: 5
    },
});
