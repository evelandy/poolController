import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    StatusBar,
    TextInput,
    ScrollView, 
    KeyboardAvoidingView
} from 'react-native';

export default class SignUp extends React.Component{
    static navigationOptions = {
        headerShown: false
    };

    state = {
        fname: '',
        lname: '',
        username: '',
        password: '',
        email: '',
        address: '',
        add2: '',
        city: '',
        sta: '',
        zipCode: '',
        phone: ''
    }

    nav_to_login = () => {
        this.props.navigation.navigate('Login')
    }

    signUpUser = () => {
        let usrObj = {}
        usrObj.fname = this.state.fname
        usrObj.lname = this.state.lname
        usrObj.username = this.state.username
        usrObj.password = this.state.password
        usrObj.email = this.state.email
        usrObj.address = this.state.address
        usrObj.add2 = this.state.add2
        usrObj.city = this.state.city
        usrObj.sta = this.state.sta
        usrObj.zipCode = this.state.zipCode
        usrObj.phone = this.state.phone
        fetch('http://127.0.0.1:5000/api/v1/user', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usrObj)
        })
        .then((res) => {
            let data = res.json();
            return data;
        })
        .then((data) => {
            alert('You are now registered');
            this.clearState();
            this.props.navigation.navigate('Login');
        })
        .catch((err) => {
                alert("that username exists please choose another.");
                this.clearState();
        })
    }
    clearState = () => {
        this.setState({
            fname: '',
            lname: '',
            username: '',
            password: '',
            email: '',
            address: '',
            add2: '',
            city: '',
            sta: '',
            zipCode: '',
            phone: ''
        });
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
                <ImageBackground
                    style={styles.image}
                    source={require('../img/landingPage.jpg')}>
                        <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"}>
                            <ScrollView>
                                <View style={styles.subContainer}>
                                    <Text style={styles.signUpHeader}>
                                        SignUp
                                    </Text>
                                    <View>
                                        <Text style={styles.inputLabel}>
                                            First Name
                                        </Text>
                                        <TextInput
                                            style={styles.txtInput}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            keyboardType='default'
                                            returnKeyType='next'
                                            onChangeText={val => this.onChangeText('fname', val)}
                                            onSubmitEditing={() => this.lname.focus()}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.inputLabel}>
                                            Last Name
                                        </Text>
                                        <TextInput
                                            style={styles.txtInput}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            keyboardType='default'
                                            returnKeyType='next'
                                            onChangeText={val => this.onChangeText('lname', val)}
                                            ref={(input) => this.lname = input}
                                            onSubmitEditing={() => this.username.focus()}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.inputLabel}>
                                            Username
                                        </Text>
                                        <TextInput
                                            style={styles.txtInput}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            keyboardType='email-address'
                                            returnKeyType='next'
                                            onChangeText={val => this.onChangeText('username', val)}
                                            ref={(input) => this.username = input}
                                            onSubmitEditing={() => this.password.focus()}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.inputLabel}>
                                            Password
                                        </Text>
                                        <TextInput
                                            style={styles.txtInput}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            keyboardType='email-address'
                                            returnKeyType='next'
                                            secureTextEntry={true}
                                            onChangeText={val => this.onChangeText('password', val)}
                                            ref={(input) => this.password = input}
                                            onSubmitEditing={() => this.email.focus()}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.inputLabel}>
                                            Email
                                        </Text>
                                        <TextInput
                                            style={styles.txtInput}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            keyboardType='email-address'
                                            returnKeyType='next'
                                            onChangeText={val => this.onChangeText('email', val)}
                                            ref={(input) => this.email = input}
                                            onSubmitEditing={() => this.address.focus()}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.inputLabel}>
                                            Address
                                        </Text>
                                        <TextInput
                                            style={styles.txtInput}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            keyboardType='numbers-and-punctuation'
                                            returnKeyType='next'
                                            onChangeText={val => this.onChangeText('address', val)}
                                            ref={(input) => this.address = input}
                                            onSubmitEditing={() => this.add2.focus()}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.inputLabel}>
                                            Address 2
                                        </Text>
                                        <TextInput
                                            style={styles.txtInput}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            keyboardType='numbers-and-punctuation'
                                            returnKeyType='next'
                                            onChangeText={val => this.onChangeText('add2', val)}
                                            ref={(input) => this.add2 = input}
                                            onSubmitEditing={() => this.city.focus()}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.inputLabel}>
                                            City
                                        </Text>
                                        <TextInput
                                            style={styles.txtInput}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            keyboardType='default'
                                            returnKeyType='next'
                                            onChangeText={val => this.onChangeText('city', val)}
                                            ref={(input) => this.city = input}
                                            onSubmitEditing={() => this.sta.focus()}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.inputLabel}>
                                            State (abbr.)
                                        </Text>
                                        <TextInput
                                            style={styles.txtInput}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            keyboardType='default'
                                            returnKeyType='next'
                                            onChangeText={val => this.onChangeText('sta', val)}
                                            ref={(input) => this.sta = input}
                                            onSubmitEditing={() => this.zipCode.focus()}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.inputLabel}>
                                            Zip Code
                                        </Text>
                                        <TextInput
                                            style={styles.txtInput}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            keyboardType='numbers-and-punctuation'
                                            returnKeyType='next'
                                            onChangeText={val => this.onChangeText('zipCode', val)}
                                            ref={(input) => this.zipCode = input}
                                            onSubmitEditing={() => this.phone.focus()}
                                        />
                                    </View>
                                    <View style={styles.finalInput}>
                                        <Text style={styles.inputLabel}>
                                            Phone Number
                                        </Text>
                                        <TextInput
                                            style={styles.txtInput}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            keyboardType='numbers-and-punctuation'
                                            returnKeyType='done'
                                            onChangeText={val => this.onChangeText('phone', val)}
                                            ref={(input) => this.phone = input}
                                            onSubmitEditing={() => this.signUpUser()}
                                        />
                                    </View>
                                    
                                    <TouchableOpacity style={styles.signUpBtn} onPress={() => {this.nav_to_login()}}>
                                        <Text style={styles.signUpBtnText}>
                                            Login
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.signUpUser()} style={styles.signUpBtn}>
                                        <Text style={styles.signUpBtnText}>
                                            SignUp
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
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
        top: 50,
        alignItems: 'center',
        marginBottom: 100
    },
    signUpHeader: {
        fontSize: 40,
        fontWeight: 'bold',
        letterSpacing: 1,
        paddingBottom: 20,
        textTransform: 'uppercase'
    },
    txtInput: {
        height: 40,
        width: 275,
        borderColor: 'gray',
        borderWidth: 2,
        borderRadius: 3,
        marginTop: 2,
        backgroundColor: 'lightblue',
        fontSize: 27,
    },
    inputLabel: {
        color: 'white',
        marginTop: 15,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',  
    },
    finalInput: {
        marginBottom: 15
    },
    signUpBtn: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 12,
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
        resizeMode: 'cover',
    },
});