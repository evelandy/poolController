import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

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
        paddingRight: 40,
        paddingLeft: 40,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 20
    },
});
