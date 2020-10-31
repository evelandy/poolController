import React from 'react';
import {
    Platform,
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
        currentTemp: 0,
        forecastData: 0,
        userId: '',
        city: ''
    }

    async displayHighTemp() {
        let token = await AsyncStorage.getItem('x-access-token')
        let decoded = jwtDecode(token)
        this.setState({
            userId: decoded.id,
            city: decoded.city
        });
        const apiKey = '5490a59fae143d65082c3beeaeaf6982';
        fetch(`http://api.openweathermap.org/data/2.5/weather?q=${this.state.city}&appid=${apiKey}&units=imperial`, {})
        .then((res) => {
            let data = res.json();
            return data;
        })
        .then((data) => {
            this.setState({
                highTemp: data.main.temp_max,
                currentTemp: data.main.temp
            })
        })
        .then(() => {
            console.log('testing this function for forecast data in the TempDisp.js component')
            // const apiKey = '5490a59fae143d65082c3beeaeaf6982';
            // fetch(`api.openweathermap.org/data/2.5/onecall?q=${this.state.city}&appid=${apiKey}&units=imperial`, {})
            // .then((res) => {
            //     let data = res.json();
            //     return data
            // })
            // .then((data) => {
            //     console.log('testing this function in the TempDisp.js component')
            // })
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
    tempContainer: {
        width: (Platform.OS === 'ios') ? 355 : 395,
        textAlign: 'center'
    },
    currTemp: {
        borderWidth: 1,
        borderColor: 'white',
        borderStyle: 'solid',
        color: 'white',
        fontWeight: 'bold',
        fontSize: (Platform.OS === 'ios') ? 17 : 21,
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
        fontSize: (Platform.OS === 'ios') ? 17 : 21,
        marginTop: (Platform.OS === 'ios') ? 15 : 10
    },
})