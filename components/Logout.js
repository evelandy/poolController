import React from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity,
} from 'react-native';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';


export default class Logout extends React.Component{
    async logoutUser(props) {
        await AsyncStorage.removeItem('x-access-token')
        this.props.navigation('Home')
    }
    render() {
        return (
            <View>
                <TouchableOpacity style={this.props.logBtn} onPress={() => this.logoutUser()}>
                    <Text style={styles.logoutBtnTxt}>Logout</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    logoutBtnTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
});
