import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
let jwtDecode = require('jwt-decode');


export default class PumpDisp extends React.Component{
    state = {
        running: this.props.running
    }
    pumpState = () => {
        fetch('http://127.0.0.1:5000/api/v1/pump_disp')
        .then((response) => {
            let data = response.json()
            return data
        })
        .then((data) => {
            this.setState({
                running: this.props.running
            })
        })
    }

    render() {
        return (
            <View style={styles.pmpContainer}>
                <Text style={styles.pmpHeader}>
                    Pump State: &nbsp; {this.props.running === 'false' ? 'off' : 'on'}
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