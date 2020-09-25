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
let jwtDecode = require('jwt-decode');


export default class ControlDisp extends React.Component{
    static navigationOptions = {
        headerShown: false
    };

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
                            <BtnCard header={' Pump'} manual={'Manual Pump'} schedule={'Schedule Pump'} />
                            <BtnCard header={'Clean'} manual={'Manual Clean'} schedule={'Schedule Clean'} />
                            <BtnCard header={'Lights'} manual={'Manual Light'} schedule={'Schedule Light'} />
                            <BtnCard header={'   Aux'} manual={'Manual Aux'} schedule={'Schedule Aux'} />
                            <Logout navigation={this.props.navigation.navigate} logBtn={styles.logBtn} />
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
})
