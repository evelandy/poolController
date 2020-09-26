import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    StatusBar,
    TouchableOpacity
} from 'react-native';
import CleanDisp from '../CleanDisp';
import Logout from '../Logout';
import PumpDisp from '../PumpDisp';
import TempDisp from '../TempDisp';
import WaterTemp from '../WaterTemp';
let jwtDecode = require('jwt-decode');


export default class ManualCleaner extends React.Component{
    static navigationOptions = {
        headerShown: false
    };
    state = {
        running: 'false'
    }
    
    manClnOn = () => {
        fetch('http://127.0.0.1:5000/api/v1/clean_on')
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
    manClnOff = () => {
        fetch('http://127.0.0.1:5000/api/v1/clean_off')
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

    render() {
        return (
            <View style={styles.container}>
                <ImageBackground
                    style={styles.image}
                    source={require('../img/landingPage.jpg')}>
                    <View style={styles.subContainer}>
                        <Text style={styles.manClnHeader}>
                            Manual Clean Controls
                        </Text>
                        <View style={styles.btnContainer}>
                            <TouchableOpacity style={styles.manClnBtn} onPress={() => this.manClnOn()}>
                                <Text style={styles.manClnBtnTxt}>
                                    on
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.manClnBtn} onPress={() => this.manClnOff()}>
                                <Text style={styles.manClnBtnTxt}>
                                    off
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TempDisp />
                        <WaterTemp />
                        <CleanDisp running={this.state.running} />
                        <Logout navigation={this.props.navigation.navigate} logBtn={styles.logBtn} />
                        <TouchableOpacity style={styles.backBtn} onPress={() => this.props.navigation.navigate('ControlDisp')}>
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
        top: 240
    },
    manClnHeader: {
        fontSize: 30,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
    manClnBtn: {
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
    manClnBtnTxt: {
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
});
