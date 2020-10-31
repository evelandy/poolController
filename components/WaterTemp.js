import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';

let ipAddr = (Platform.OS === 'ios') ? '127.0.0.1' : '10.0.2.2';

export default class WaterTemp extends React.Component{
    state = {
        temp: 0
    }

    async tempCheck() {
        let token = await AsyncStorage.getItem('x-access-token')
        fetch(`http://${ipAddr}:5000/api/v1/temp`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'x-access-token': token,
                withCredentials: true
            },
            body: JSON.stringify(token)
        })
        .then((res) => {
            let data = res.json();
            return data;
        })
        .then((data) => {
            this.setState({
                temp: data.message
            })
        })
    }
    
    componentDidMount(){
        this.tempCheck()
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
        width: (Platform.OS === 'ios') ? 355 : 395,
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: (Platform.OS === 'ios') ? 18 : 22,
        marginTop: (Platform.OS === 'ios') ? 15 : 10
    },
})