import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default class CleanDisp extends React.Component{
    state = {
        running: this.props.running
    }

    render() {
        return (
            <View style={styles.cleanContainer}>
                <Text style={styles.cleanHeader}>
                    Cleaner State: &nbsp; {this.props.running === 'false' ? 'off' : 'on'}
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
        paddingRight: 40,
        paddingLeft: 40,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 20
    },
});
