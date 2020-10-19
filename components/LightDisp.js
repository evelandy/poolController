import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';

export default class LightDisp extends React.Component{
    state = {
        running: this.props.running
    }
    
    render() {
        return (
            <View style={styles.lightContainer}>
                <Text style={styles.lightHeader}>
                    Light State: &nbsp; {this.props.running === false ? 'off' : 'on'}
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
        // paddingRight: 40,
        // paddingLeft: 40,
        width: (Platform.OS === 'ios') ? 355 : 395,
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: (Platform.OS === 'ios') ? 18 : 22,
        marginTop: 20
    },
});
