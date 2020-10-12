import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';


export default class WaterTemp extends React.Component{
    state = {
        temp: 0
    }
    tempCheck = () => {
        fetch('http://127.0.0.1:5000/api/v1/temp')
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
        // paddingRight: 40,
        // paddingLeft: 40,
        width: (Platform.OS === 'ios') ? 355 : 395,
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: (Platform.OS === 'ios') ? 18 : 22,
        marginTop: 20
    },
})