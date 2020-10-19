import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity
} from 'react-native';
import LightDisp from '../LightDisp';
import Logout from '../Logout';
import TempDisp from '../TempDisp';
import WaterTemp from '../WaterTemp';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';

let ipAddr = (Platform.OS === 'ios') ? '127.0.0.1' : '10.0.2.2';

export default class ManualLights extends React.Component{
    static navigationOptions = {
        headerShown: false
    };

    constructor(props){
        super(props);
        this.state = {
            running: false
        }
        this.lightDisplay = this.lightDisplay.bind(this);
        this.manLgtOn = this.manLgtOn.bind(this);
        this.manLgtOff = this.manLgtOff.bind(this);
    }

    // state = {
    //     running: false
    // }

    componentDidMount() {
        this.lightDisplay()
    }

    async lightDisplay() {
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
    
    async manLgtOn() {
        let token = await AsyncStorage.getItem('x-access-token')
        fetch(`http://${ipAddr}:5000/api/v1/light_on`, {
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
                running: data.lswitch
            })
        })
        .catch((error) => {
            console.log(error)
        })
    }

    async manLgtOff() {
        let token = await AsyncStorage.getItem('x-access-token')
        fetch(`http://${ipAddr}:5000/api/v1/light_off`, {
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
                running: data.lswitch
            })
        })
        .catch((error) => {
            console.log(error)
        })
    }
    
    backToCtrl = () => {
        this.props.navigation.navigate('ControlDisp')
    }

    render() {
        return (
            <View style={styles.container}>
                <ImageBackground
                    style={styles.image}
                    source={require('../img/landingPage.jpg')}>
                    <View style={styles.subContainer}>
                        <Text style={styles.manLgtHeader}>
                            Manual Light Controls
                        </Text>
                        <View style={styles.btnContainer}>
                            <TouchableOpacity style={styles.manLgtBtn} onPress={this.manLgtOn}>
                                <Text style={styles.manLgtBtnTxt}>
                                    on
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.manLgtBtn} onPress={this.manLgtOff}>
                                <Text style={styles.manLgtBtnTxt}>
                                    off
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TempDisp />
                        <WaterTemp />
                        <LightDisp running={this.state.running} />
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
        // top: 75,
        top: (Platform.OS === 'ios') ? 75 : 30,
        alignItems: 'center'
    },
    btnContainer: {
        flexDirection: 'row',
        top: 240,
        zIndex: 1,
    },
    manLgtHeader: {
        // fontSize: 30,
        fontSize: (Platform.OS === 'ios') ? 30 : 35,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
    manLgtBtn: {
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
    manLgtBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    logBtn: {
        // top: 300,
        top: (Platform.OS === 'ios') ? 300 : 250,
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
        // top: 320,
        top: (Platform.OS === 'ios') ? 320 : 270,
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
