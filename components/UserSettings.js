import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ImageBackground,
    StatusBar,
    ScrollView
} from 'react-native';
import Logout from './Logout';
let jwtDecode = require('jwt-decode');
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';

export default class UserSettings extends React.Component{
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
        phone: '',
        userId: ''
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

    async changeUsername() {
        let token = await AsyncStorage.getItem('x-access-token')
        let decoded = jwtDecode(token)
        // console.log(decoded.username)
        // alert(decoded.username)
        this.setState({
            userId: decoded.id
        })
        let newUname = this.state.username
        let userId = this.state.userId
        fetch(`http://127.0.0.1:5000/api/v1/${newUname}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': token,
                withCredentials: true
            }
        })
        .then((response) => {
            let data = response.json()
            return data
        })
        .then((data) => {
            this.setState({
                username: ''
            })
        })
        .then((data) => {
            alert('username updated!')
            // this.props.navigation.navigate('Login')
        })
        .catch((error) => {
            alert('username already exists! please try again with a different username.');
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle={'light-content'} />
                <ImageBackground
                    style={styles.image}
                    source={require('./img/landingPage.jpg')}>
                    <ScrollView>
                        <View style={styles.subContainer}>
                            <Text style={styles.setHeader}>
                                User settings
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
                            <TouchableOpacity style={styles.setBtnName}>
                                <Text style={styles.setBtnTxt}>
                                    update name
                                </Text>
                            </TouchableOpacity>
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
                            <TouchableOpacity style={styles.setBtnName} onPress={() => this.changeUsername()}>
                                <Text style={styles.setBtnTxt}>
                                    update username/password
                                </Text>
                            </TouchableOpacity>
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
                            <TouchableOpacity style={styles.setBtnName}>
                                <Text style={styles.setBtnTxt}>
                                    update email
                                </Text>
                            </TouchableOpacity>
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
                            <TouchableOpacity style={styles.setBtnName}>
                                <Text style={styles.setBtnTxt}>
                                    update address
                                </Text>
                            </TouchableOpacity>
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
                                    // onSubmitEditing={() => this.signUpUser()}
                                />
                            </View>
                            <TouchableOpacity style={styles.setBtnName}>
                                <Text style={styles.setBtnTxt}>
                                    update phone
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.setBtn} onPress={() => this.props.navigation.navigate('Dashboard')}>
                            <Text style={styles.setBtnTxt}>
                                Back
                            </Text>
                        </TouchableOpacity>
                        <Logout navigation={this.props.navigation.navigate} logBtn={styles.logBtn}/>
                    </ScrollView>
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
        top: 60,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
    setHeader: {
        fontWeight: 'bold',
        fontSize: 40,
        textTransform: 'uppercase',
        marginBottom: 25
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
    setBtnName: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 275,
        top: 20,
        marginBottom: 40,
    },
    setBtn: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 275,
        left: 50,
        top: 100,
        zIndex: 1
    },
    setBtnTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logBtn: {
        top: 110,
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 10,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 275,
        left: 40,
        marginBottom: 200
    },
});
