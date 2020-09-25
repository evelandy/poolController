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


export default class LightDisp extends React.Component{
    state = {
        running: false
    }
    render() {
        return (
            <View style={styles.lightContainer}>
                <Text style={styles.lightHeader}>
                    Light State: &nbsp; {this.state.running === 'false' ? 'on' : 'off'}
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    lightHeader: {
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