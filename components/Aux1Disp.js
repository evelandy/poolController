import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

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
        paddingRight: 40,
        paddingLeft: 40,
        color: 'white',
        fontWeight: 'bold',
        fontSize: (Platform.OS === 'ios') ? 18 : 22,
        marginTop: 20
    },
});
