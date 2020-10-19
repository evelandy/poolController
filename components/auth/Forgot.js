import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Text,
    StatusBar,
    TextInput, 
    KeyboardAvoidingView
} from 'react-native';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';

export default class Forgot extends React.Component {
    static navigationOptions = {
        headerShown: false
    };

    state = {
        email: ''
    }

    onChangeText = (key, val) => {
        this.setState({
            [key]: val
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle={'light-content'} />
                <ImageBackground style={styles.image} source={require('../img/landingPage.jpg')}>
                    <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"}>
                        <View style={styles.subContainer}>
                            <Text style={styles.headerText}>
                                Forgot Password
                            </Text>
                            <View>
                                <Text style={styles.emailInputLabel}>
                                    Email
                                </Text>
                                <TextInput 
                                    style={styles.emailInput}
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    onChangeText={val => this.onChangeText('email', val)}
                                    returnKeyType='send'
                                    // onSubmitEditing={() => this.setSchTime()}
                                />
                            </View>
                            <TouchableOpacity style={styles.forgotBtn}>
                                <Text style={styles.forgotBtnTxt}>
                                    Submit
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
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
        top: 250,
        alignItems: 'center'
    },
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
    headerText: {
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    emailInputLabel: {
        fontWeight: 'bold',
        marginTop: 5,
        left: 1,
        fontSize: 16,
        marginTop: 25,
        color: 'white'
    },
    emailInput: {
        height: 40,
        width: 275,
        borderColor: 'gray',
        borderWidth: 2,
        borderRadius: 7,
        marginTop: 2,
        marginBottom: 15,
        backgroundColor: 'lightblue',
        fontSize: 27
    },
    forgotBtn: {
        padding: 10,
        borderRadius: 7,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 275
    },
    forgotBtnTxt: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
});
