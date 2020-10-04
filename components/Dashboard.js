import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    StatusBar,
    TouchableOpacity,
    LogBox,
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


export default class Dashboard extends React.Component{
    static navigationOptions = {
        headerShown: false
    };

    state = {
        greet: 'Hey',
        fname: '',
        username: '',
        running: this.props.running
    }

    greet_lst = [
        'Welcome',
        'Hello',
        'Hi',
        'Greetings',
        'Hey',
    ];

    componentDidMount(){
        this.displayFname()
        this.disp_greet_lst()
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
                                <TempDisp/>
                                <WaterTemp />
                                <CleanDisp />
                                <PumpDisp />
                                <LightDisp />
                            </View>
                            <View style={styles.ctrlContainer}>
                                <TouchableOpacity style={styles.ctrlBtn} onPress={() => this.props.navigation.navigate('ControlDisp')}>
                                    <Text style={styles.ctrlBtnTxt}>
                                        Controls
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
        zIndex: 1
    },
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
    dashHeader: {
        fontSize: 30,
        fontWeight: 'bold',
        letterSpacing: 1,
        paddingBottom: 20,
        color: 'lightblue'
    },
    ctrlBtn: {
        top: 225,
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
    logBtn: {
        top: 250,
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
})