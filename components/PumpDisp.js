import React from 'react';
import {
    StyleSheet,
    TextInput,
    Text,
    View,
    ImageBackground,
    StatusBar
} from 'react-native';
let jwtDecode = require('jwt-decode');


export default class PumpDisp extends React.Component{
    state = {
        running: false
    }
    render() {
        return (
            <View style={styles.pmpContainer}>
                <Text style={styles.pmpHeader}>
                    Pump State: &nbsp; {this.state.running === 'false' ? 'on' : 'off'}
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
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
})