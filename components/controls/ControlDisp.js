import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    StatusBar,
    TouchableOpacity
} from 'react-native';
import Logout from '../Logout';
import BtnCard from './BtnCard';

export default class ControlDisp extends React.Component{
    static navigationOptions = {
        headerShown: false
    };
    state = {
        running: false
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

    navControl = () => {
        this.props.navigation.navigate('Dashboard');
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle={'light-content'} />
                <ImageBackground
                    style={styles.image}
                    source={require('../img/landingPage.jpg')}>
                    <View style={styles.subContainer}>
                        <Text style={styles.ctrlHeader}>
                            Control Center
                        </Text>
                        <View style={styles.btnContainer}>
                            <BtnCard dest={'ManualPump'} destSch={'Pump'} navigation={this.props.navigation.navigate} header={' Pump'} manual={'Manual Pump'} schedule={'Schedule Pump'} />
                            <BtnCard dest={'ManualCleaner'} destSch={'Clean'} navigation={this.props.navigation.navigate} header={'Clean'} manual={'Manual Clean'} schedule={'Schedule Clean'} />
                            <BtnCard dest={'ManualLights'} destSch={'Light'} navigation={this.props.navigation.navigate} header={'Lights'} manual={'Manual Light'} schedule={'Schedule Light'} />
                            <BtnCard dest={'ManualAux1'} destSch={'Aux1'} navigation={this.props.navigation.navigate} header={'  Aux1'} manual={'Manual Aux1'} schedule={'Schedule Aux1'} />
                            <Logout navigation={this.props.navigation.navigate} logBtn={styles.logBtn} />
                            <TouchableOpacity style={styles.backBtn} onPress={this.navControl}>
                                <Text style={styles.backBtnTxt}>
                                    Back
                                </Text>
                            </TouchableOpacity>
                        </View>
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
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
    ctrlHeader: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 27,
        textTransform: 'uppercase',
    },
    logBtn: {
        top: 50,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 350,
        marginTop: 10
    },
    backBtn: {
        top: 90,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 150,
        left: 95
    },
    backBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
})
