import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    TextInput
} from 'react-native';
import Logout from '../../Logout';
import PumpDisp from '../../PumpDisp';
import TempDisp from '../../TempDisp';
import WaterTemp from '../../WaterTemp';

export default class Pump extends React.Component{
    static navigationOptions = {
        headerShown: false
    };
    state = {
        running: false,
        hour: 10,
        minute: 30,
        mid: 'AM',
        setSchHr: '12',
        setSchMin: '00',
        setSchMid: 'PM'
    }

    pumpState = () => {
        fetch('http://127.0.0.1:5000/api/v1/pump_status')
        .then((response) => {
            let data = response.json()
            return data
        })
        .then((data) => {
            this.setState({
                running: data.pswitch
            });
        })
        .catch((err) => {
            console.log(err)
        });
    }
    
    schPmpOn = (tm=4) => {
        // fetch(`http://127.0.0.1:5000/api/v1/sch_p_on/${tm}`)
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

    schPmpOff = (tm=4) => {
        fetch(`http://127.0.0.1:5000/api/v1/sch_p_off/${tm}`)
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

    setSchTime = () => {
        let collectTime = {}
        collectTime.pHr = this.state.hour
        collectTime.pMin = this.state.minute
        collectTime.pMid = this.state.mid
        this.setState({
            setSchHr: this.state.hour,
            setSchMin: this.state.minute,
            setSchMid: this.state.mid
        })
        fetch('http://127.0.0.1:5000/api/v1/add_p_time', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(collectTime)
        })
    }

    showSchTime = () => {
        fetch('http://127.0.0.1:5000/api/v1/show_p_time')
        .then((res) => {
            let data = res.json()
            return data
        })
        .then((data) => {
            this.setState({
                setSchHr: data.message.pHr,
                setSchMin: data.message.pMin,
                setSchMid: data.message.pMid
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
                        <View style={styles.btnContainer}>
                            <TouchableOpacity style={styles.schPmpBtn} onPress={() => this.setSchTime()}>
                                <Text style={styles.schPmpBtnTxt}>
                                    set
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.schPmpBtn} onPress={() => {this.schPmpOff(2)}}>
                                <Text style={styles.schPmpBtnTxt}>
                                    run
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TempDisp />
                        <WaterTemp />
                        <PumpDisp running={this.state.running} />
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
                                // value={this.state.hour}
                                keyboardType={'numeric'}
                                maxLength={2}
                                returnKeyType='next'
                                onSubmitEditing={() => this.minuteuInput.focus()}>
                                    {this.state.hour}
                            </TextInput>
                            <Text style={styles.colon}>
                                :
                            </Text>
                            <TextInput 
                                style={styles.schInput}
                                autoCorrect={false}
                                onChangeText={val => this.onChangeText('minute', val)}
                                // value={this.state.minute}
                                keyboardType={'numeric'}
                                maxLength={2}
                                returnKeyType='next'
                                ref={(input) => this.minuteuInput = input}
                                onSubmitEditing={() => this.midInput.focus()}>
                                    {this.state.minute}
                            </TextInput>
                            <TextInput 
                                style={styles.schInput}
                                autoCapitalize='characters'
                                autoCorrect={false}
                                onChangeText={val => this.onChangeText('mid', val)}
                                value={this.state.mid}
                                maxLength={2}
                                returnKeyType='go'
                                ref={(input) => this.midInput = input}
                                onSubmitEditing={() => this.setSchTime()}
                            />
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
        top: 75,
        alignItems: 'center'
    },
    btnContainer: {
        flexDirection: 'row',
        top: 240,
        zIndex: 1,
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
    schPmpHeader: {
        fontSize: 30,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
    schPmpBtn: {
        top: 100,
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
        top: 200,
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
        top: 220,
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
    currSchHeader: {
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
    inputContainer: {
        flexDirection: 'row',
        marginTop: 30
    },
    schInput: {
        width: 42,
        height: 35,
        backgroundColor: 'lightblue',
        borderColor: 'lightgray',
        borderWidth: 2,
        borderRadius: 3,
        fontSize: 25,
        marginRight: 3,
        textAlign: 'center'
    },
    colon: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
        marginRight: 3
    },
});
