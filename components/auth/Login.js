import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    StatusBar,
    TextInput, 
    KeyboardAvoidingView,
    TouchableWithoutFeedback, 
    Keyboard
} from 'react-native';
import { encode as btoa } from 'base-64';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';
import DismissKeyboard from '../DismissKeyboard';


export default class Login extends React.Component{
    static navigationOptions = {
        headerShown: false
    };
    state = {
        username: '',
        password: ''
    }

    nav_to_signUp = () => {
        this.props.navigation.navigate('SignUp')
    }
    nav_to_forgot = () => {
        this.props.navigation.navigate('Forgot')
    }

    loginUser(){
        let test = Platform.OS == "ios" ? "127.0.0.1" : "10.0.2.2" 
        let collection = {}
        collection.username = this.state.username
        collection.password = this.state.password
        let username = this.state.username
        let password = this.state.password
        let headers = new Headers()
        headers.append('Content-Type', 'text/json')
        headers.append('Authorization', 'Basic ' + btoa(username + ':' + password))
        fetch(`http://${test}:5000/api/v1/login`, {
            method: 'POST',
            headers: headers
        })
        .then((response) => {
            let data = response.json()
            return data
        })
        .then(async(data) => {
            let token = data.token
            await AsyncStorage.setItem('x-access-token', token)
            this.props.navigation.navigate('Dashboard')
            this.setState({
                username: '',
                password: ''
            })
        })
        .catch((error) => {
            if(error){
                alert('username or password does not exist! please check and try again')
                this.setState({
                    username: '',
                    password: ''
                })
            }
        })
    }
    // 10.0.2.2 45457

    updateValue(text, field){
        if (field == 'username'){
            this.setState({
                username: text
            })
        } else if (field == 'password'){
            this.setState({
                password: text
            })
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle={'light-content'} />
                <ImageBackground
                    style={styles.image}
                    source={require('../img/landingPage.jpg')}>
                        <DismissKeyboard keyboard={Keyboard}>
                            <View style={styles.subContainer}>
                                <Text style={styles.loginHeader}>
                                    Login
                                </Text>
                                <TextInput 
                                    style={styles.loginName}
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    onChangeText={(text) => this.updateValue(text, 'username')}
                                    value={this.state.username}
                                    keyboardType={'email-address'}
                                    returnKeyType='next'
                                    onSubmitEditing={() => this.passwordInput.focus()}
                                />
                                <TextInput 
                                    style={styles.loginPass}
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    secureTextEntry
                                    onChangeText={(text) => this.updateValue(text, 'password')}
                                    value={this.state.password}
                                    returnKeyType='done'
                                    ref={(input) => this.passwordInput = input}
                                    onSubmitEditing={() => this.loginUser()}
                                />
                                <TouchableOpacity style={styles.loginBtn} onPress={() => this.loginUser()}>
                                    <Text style={styles.loginBtnText}>
                                        Login
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.loginBtn} onPress={() => {this.nav_to_signUp()}}>
                                    <Text style={styles.loginBtnText}>
                                        SignUp
                                    </Text>
                                </TouchableOpacity>
                                <View style={styles.forgotContainer}>
                                    <TouchableOpacity style={styles.forgotBtn} onPress={() => {this.nav_to_forgot()}}>
                                        <Text style={styles.forgotBtnText}>
                                            Forgot Username/Password?
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </DismissKeyboard>
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
        top: 180,
        alignItems: 'center'
    },
    loginHeader: {
        fontSize: 40,
        fontWeight: 'bold',
        letterSpacing: 1,
        paddingBottom: 20,
        textTransform: 'uppercase'
    },
    loginName: {
        height: 45,
        width: 275,
        borderColor: 'gray',
        borderWidth: 2,
        borderRadius: 3,
        marginTop: 15,
        backgroundColor: 'lightblue',
        fontSize: 20,
    },
    loginPass: {
        height: 45,
        width: 275,
        borderColor: 'gray',
        borderWidth: 2,
        borderRadius: 3,
        marginTop: 15,
        marginBottom: 35,
        backgroundColor: 'lightblue',
        fontSize: 20
    },
    loginBtn: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 10,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 275,
    },
    loginBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
    forgotContainer: {
        left: 40,
        marginTop: 25,
    },
    forgotBtn: {
        
    },
    forgotBtnText: {
        color: 'white',
    },
});