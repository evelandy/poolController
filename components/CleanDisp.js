import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';

export default class CleanDisp extends React.Component{
    state = {
        running: this.props.running
    }
    
    render() {
        return (
            <View style={styles.cleanContainer}>
                <Text style={styles.cleanHeader}>
                    Clean State: &nbsp; {this.props.running === false ? 'off' : 'on'}
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    cleanHeader: {
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
