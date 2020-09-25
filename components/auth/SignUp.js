import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    StatusBar,
} from 'react-native';
import { TextInput } from 'react-native';

export default class SignUp extends React.Component{
    static navigationOptions = {
        headerShown: false
    };

    nav_to_login = () => {
        this.props.navigation.navigate('Login')
    }

    signUpUser = () => {
        fetch('http://192.168.1.118:5000/api/v1/check')
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle={'light-content'} />
                <ImageBackground
                    style={styles.image}
                    source={require('../img/landingPage.jpg')}>
                        <View style={styles.subContainer}>
                            <Text style={styles.signUpHeader}>
                                SignUp
                            </Text>
                            <TextInput 
                            style={styles.signUpName}/>
                            <TextInput 
                            style={styles.signUpPass}/>
                            <TouchableOpacity style={styles.signUpBtn} onPress={() => {this.nav_to_login()}}>
                                <Text style={styles.signUpBtnText}>
                                    Login
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.signUpBtn}>
                                <Text style={styles.signUpBtnText}>
                                    SignUp
                                </Text>
                            </TouchableOpacity>
                        </View>
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    subContainer: {
        top: 200,
        alignItems: 'center'
    },
    signUpHeader: {
        fontSize: 40,
        fontWeight: 'bold',
        letterSpacing: 1,
        paddingBottom: 20,
    },
    signUpName: {
        height: 40,
        width: 275,
        borderColor: 'gray',
        borderWidth: 2,
        borderRadius: 3,
        marginTop: 15,
        backgroundColor: 'lightblue',
        fontSize: 27,
    },
    signUpPass: {
        height: 40,
        width: 275,
        borderColor: 'gray',
        borderWidth: 2,
        borderRadius: 3,
        marginTop: 15,
        marginBottom: 35,
        backgroundColor: 'lightblue',
        fontSize: 27
    },
    signUpBtn: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 10,
        paddingRight: 100,
        paddingLeft: 100,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 275
    },
    signUpBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
});