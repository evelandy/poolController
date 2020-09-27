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

export default class ManualLights extends React.Component{
    static navigationOptions = {
        headerShown: false
    };
    state = {
        running: 'false'
    }
    
    manLgtOn = () => {
        fetch('http://127.0.0.1:5000/api/v1/light_on')
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
    manLgtOff = () => {
        fetch('http://127.0.0.1:5000/api/v1/light_off')
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
        top: 75,
        alignItems: 'center'
    },
    btnContainer: {
        flexDirection: 'row',
        top: 240
    },
    manLgtHeader: {
        fontSize: 30,
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
