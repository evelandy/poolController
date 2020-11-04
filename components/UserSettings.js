import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ImageBackground,
    StatusBar,
    ScrollView, Platform
} from 'react-native';
import Logout from './Logout';
let jwtDecode = require('jwt-decode');
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';

let ipAddr = (Platform.OS === 'ios') ? '127.0.0.1' : '10.0.2.2';

export default class UserSettings extends React.Component{
    static navigationOptions = {
        headerShown: false
    };

    constructor(props){
        super(props);
        this.state = {
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
        userId: '',
        text: ''
        }
        this.changeUsername = this.changeUsername.bind(this)
    }

    // state = {
    //     fname: '',
    //     lname: '',
    //     username: '',
    //     password: '',
    //     email: '',
    //     address: '',
    //     add2: '',
    //     city: '',
    //     sta: '',
    //     zipCode: '',
    //     phone: '',
    //     userId: '',
    //     text: ''
    // }

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

    async changeName() {
        let token = await AsyncStorage.getItem('x-access-token')
        let decoded = jwtDecode(token)
        // console.log(decoded.username)
        // alert(decoded.username)
        this.setState({
            userId: decoded.id
        });
        let newFname = this.state.fname;
        let newLname = this.state.lname;
        let userId = this.state.userId;
        if(newFname === '' || newLname === ''){
            alert('please make sure you filled out both entries.')
        } else {
            await fetch(`http://${ipAddr}:5000/api/v1/editname/${newFname}/${newLname}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                    withCredentials: true
                }
            })
            .then((res) => {
                let data = res.json();
                return data;
            })
            .then((data) => {
                alert(`new first name: ${this.state.fname} \nnew last name: ${this.state.lname}`)
            })
            .then(() => {
                this.setState({
                    fname: '',
                    lname: ''
                })
            })
            .catch((err) => {
                alert(`name error: ${err}`)
            })
        }
    }

    async changeUsername() {
        let token = await AsyncStorage.getItem('x-access-token')
        let decoded = jwtDecode(token)
        this.setState({
            userId: decoded.id
        });
        let newUname = this.state.username
        let userId = this.state.userId
        if(newUname === ''){
            alert('please make sure you filled out the username input')
        } else {
            fetch(`http://${ipAddr}:5000/api/v1/user/edituname/${newUname}/${userId}`, {
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
                alert(`username updated to: ${this.state.username}`)
            })
            .then(() => {
                this.setState({
                    username: ''
                })
                // this.props.navigation.navigate('Dashboard')
            })
            .catch((error) => {
                alert('username already exists! please try again with a different username.');
            })
        }
    }

    async changePassword() {
        let token = await AsyncStorage.getItem('x-access-token')
        let decoded = jwtDecode(token)
        this.setState({
            userId: decoded.id
        })
        let newPass = this.state.password
        let userId = this.state.userId
        if(newPass === ''){
            alert('please make sure you filled out the password input')
        } else {
            fetch(`http://${ipAddr}:5000/api/v1/user/editpass/${newPass}/${userId}`, {
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
                alert(`Password changed to: ${this.state.password}`)
            })
            .then((data) => {
                this.setState({
                    password: ''
                })
                // this.props.navigation.navigate('Dashboard')
            })
            .catch((error) => {
                alert(`password edit error: ${error}`);
            })
        }
    }

    async changeEmail() {
        let token = await AsyncStorage.getItem('x-access-token')
        let decoded = jwtDecode(token)
        this.setState({
            userId: decoded.id
        });
        let newEmail = this.state.email;
        let userId = this.state.userId;
        if(newEmail === ''){
            alert('please make sure you filled out the email input')
        } else {
            fetch(`http://${ipAddr}:5000/api/v1/editemail/${newEmail}/${userId}`, {
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
                alert(`email changed to: ${this.state.email}`)
            })
            .then(() => {
                this.setState({
                    email: ''
                })
            })
            .catch((error) => {
                alert(`email error ${error}`);
            })
        }
    }

    async changeAddress() {
        let token = await AsyncStorage.getItem('x-access-token')
        let decoded = jwtDecode(token)
        this.setState({
            userId: decoded.id
        });
        let addObj = {};
        addObj.address = this.state.address;
        addObj.add2 = this.state.add2;
        addObj.city = this.state.city;
        addObj.sta = this.state.sta;
        addObj.zipCode = this.state.zipCode;
        let userId = this.state.userId;
        if(this.state.address === '' || this.state.city === '' || this.state.sta === '' || this.state.zipCode === ''){
            alert('please fill out all address fields')
        } else {
            await fetch(`http://${ipAddr}:5000/api/v1/editaddress/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                    withCredentials: true
                },
                body: JSON.stringify(addObj)
            })
            .then((res) => {
                let data = res.json();
                return data;
            })
            .then((data) => {
                alert('address updated successfully')
            })
            .then(() => {
                this.setState({
                    address: '',
                    add2: '',
                    city: '',
                    sta: '',
                    zipCode: ''
                })
            })
            .catch((err) => {
                alert(`address error: ${err}`)
            })
        }
    }

    async changePhone() {
        let token = await AsyncStorage.getItem('x-access-token')
        let decoded = jwtDecode(token)
        this.setState({
            userId: decoded.id
        });
        let newPhone = this.state.phone;
        let userId = this.state.userId;
        if(newPhone === ''){
            alert('please make sure you filled out the phone input')
        } else {
            fetch(`http://${ipAddr}:5000/api/v1/editphone/${newPhone}/${userId}`, {
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
                alert(`phone changed to: ${this.state.phone}`)
            })
            .then(() => {
                this.setState({
                    phone: ''
                })
            })
            .catch((error) => {
                alert(`phone error ${error}`);
            })
        }
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
                                    clearButtonMode='always'
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
                                    returnKeyType='done'
                                    clearButtonMode='always'
                                    onChangeText={val => this.onChangeText('lname', val)}
                                    ref={(input) => this.lname = input}
                                    onSubmitEditing={() => this.changeName()}
                                />
                            </View>
                            <TouchableOpacity style={styles.setBtnName} onPress={() => this.changeName()}>
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
                                    returnKeyType='done'
                                    clearButtonMode='always'
                                    onChangeText={val => this.onChangeText('username', val)}
                                    onSubmitEditing={() => this.changeUsername()}
                                />
                            </View>
                            <TouchableOpacity style={styles.setBtnName} onPress={() => this.changeUsername()}>
                                <Text style={styles.setBtnTxt}>
                                    update username
                                </Text>
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.inputLabel}>
                                    Password
                                </Text>
                                <TextInput
                                    style={styles.txtInput}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType='email-address'
                                    returnKeyType='done'
                                    clearButtonMode='always'
                                    secureTextEntry={true}
                                    onChangeText={val => this.onChangeText('password', val)}
                                    onSubmitEditing={() => this.changePassword()}
                                />
                            </View>
                            <TouchableOpacity style={styles.setBtnName} onPress={() => this.changePassword()}>
                                <Text style={styles.setBtnTxt}>
                                    update password
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
                                    returnKeyType='done'
                                    clearButtonMode='always'
                                    onChangeText={val => this.onChangeText('email', val)}
                                    onSubmitEditing={() => this.changeEmail()}
                                />
                            </View>
                            <TouchableOpacity style={styles.setBtnName} onPress={() => this.changeEmail()}>
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
                                    clearButtonMode='always'
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
                                    clearButtonMode='always'
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
                                    clearButtonMode='always'
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
                                    clearButtonMode='always'
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
                                    clearButtonMode='always'
                                    onChangeText={val => this.onChangeText('zipCode', val)}
                                    ref={(input) => this.zipCode = input}
                                    onSubmitEditing={() => this.changeAddress()}
                                />
                            </View>
                            <TouchableOpacity style={styles.setBtnName} onPress={() => this.changeAddress()}>
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
                                    clearButtonMode='always'
                                    onChangeText={val => this.onChangeText('phone', val)}
                                    onSubmitEditing={() => this.changePhone()}
                                />
                            </View>
                            <TouchableOpacity style={styles.setBtnName} onPress={() => this.changePhone()}>
                                <Text style={styles.setBtnTxt}>
                                    update phone
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.endBtnContainer}>
                            <TouchableOpacity style={styles.setBtn} onPress={() => this.props.navigation.navigate('Dashboard')}>
                                <Text style={styles.setBtnTxt}>
                                    Back
                                </Text>
                            </TouchableOpacity>
                            <Logout navigation={this.props.navigation.navigate} logBtn={styles.logBtn}/>
                        </View>
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
        fontSize: (Platform.OS === 'ios') ? 40 : 47,
        textTransform: 'uppercase',
        marginBottom: 25
    },
    txtInput: {
        height: 40,
        width: (Platform.OS === 'ios') ? 275 : 325,
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
        fontSize: (Platform.OS === 'ios') ? 0 : 18,
    },
    setBtnName: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: (Platform.OS === 'ios') ? 275 : 325,
        marginTop: 18,
        // top: 20,
        marginBottom: 40,
        zIndex: 1
    },
    setBtn: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: (Platform.OS === 'ios') ? 275 : 325,
        left: (Platform.OS === 'ios') ? 50 : 10,
        top: (Platform.OS === 'ios') ? 110 : 130,
        // marginTop: 150,
        zIndex: 1
    },
    setBtnTxt: {
        color: 'white',
        fontSize: (Platform.OS === 'ios') ? 16 : 19,
        fontWeight: 'bold',
    },
    logBtn: {
        top: (Platform.OS === 'ios') ? 120 : 150,
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 10,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: (Platform.OS === 'ios') ? 275 : 325,
        left: (Platform.OS === 'ios') ? 40 : 0,
        marginBottom: (Platform.OS === 'ios') ? 190 : 180,
    },
    endBtnContainer: {
        marginLeft: (Platform.OS === 'ios') ? 0 : 33,
    },
});
