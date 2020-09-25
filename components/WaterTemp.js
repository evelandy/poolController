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


export default class WaterTemp extends React.Component{
    state = {
        temp: 0
    }
    render() {
        return (
            <View style={styles.tempContainer}>
                <Text style={styles.tempHeader}>
                    Water Temp: &nbsp; {this.state.temp} &deg;F
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    tempHeader: {
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