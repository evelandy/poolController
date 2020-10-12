import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default class PumpDisp extends React.Component{
    state = {
        running: this.props.running
    }
    
    render() {
        return (
            <View style={styles.pmpContainer}>
                <Text style={styles.pmpHeader}>
                    Pump State: &nbsp; {this.props.running === false ? 'off' : 'on'}
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
