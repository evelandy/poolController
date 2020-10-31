import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Platform
} from 'react-native';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';

export default class Aux1Disp extends React.Component{
    state = {
        running: this.props.running
    }
    
    render() {
        return (
            <View style={styles.aux1Container}>
                <Text style={styles.aux1Header}>
                    Aux1 State: &nbsp; {this.props.running === false ? 'off' : 'on'}
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    aux1Header: {
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
        marginTop: (Platform.OS === 'ios') ? 15 : 10
    },
});
