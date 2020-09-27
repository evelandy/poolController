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
    // logoutBtn: {
    //     top: 250,
    //     padding: 15,
    //     borderRadius: 10,
    //     backgroundColor: 'navy',
    //     alignItems: 'center',
    //     margin: 10,
    //     paddingRight: 100,
    //     paddingLeft: 100,
    //     borderWidth: 2,
    //     borderStyle: 'solid',
    //     borderColor: 'lightgray',
    //     width: 340
    // },
    logoutBtnTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
});
