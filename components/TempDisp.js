import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';
let jwtDecode = require('jwt-decode');
//await AsyncStorage.getItem('x-access-token').then(console.warn)

export default class TempDisp extends React.Component {
    state = {
        highTemp: 0,
        currentTemp: 0
    }
    displayHighTemp = () => {
        const apiKey = '5490a59fae143d65082c3beeaeaf6982';
        const tempData = fetch(`http://api.openweathermap.org/data/2.5/weather?q=galveston&appid=${apiKey}&units=imperial`, {
            method: 'GET'
        })
        .then((res) => {
            let data = res.json()
            return data
        })
        .then((data) => {
            this.setState({
                highTemp: data.main.temp_max,
                currentTemp: data.main.temp
            })
        })
        .catch((err) => {
            alert(err)
        })
    }
    componentDidMount(){
        this.displayHighTemp();
    }
    render() {
        return (
            <View style={styles.tempContainer}>
                <Text style={styles.currTemp}>
                    The Current Temp is: &nbsp; {this.state.currentTemp} &deg;F
                </Text>
                <Text style={styles.highTemp}>
                    Today's High Temp is: &nbsp; {this.state.highTemp} &deg;F
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    currTemp: {
        borderWidth: 1,
        borderColor: 'white',
        borderStyle: 'solid',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        paddingLeft: 40,
        paddingRight: 40
    },
    highTemp: {
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