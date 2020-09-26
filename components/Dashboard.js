import React from 'react';
import {
    StyleSheet,
    TextInput,
    Text,
    View,
    ImageBackground,
    StatusBar,
    TouchableOpacity
} from 'react-native';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';
//import Logout from './Logout';
let jwtDecode = require('jwt-decode');
console.disableYellowBox = true;
import TempDisp from './TempDisp';
import PumpDisp from './PumpDisp';
import CleanDisp from './CleanDisp';
import LightDisp from './LightDisp';
import WaterTemp from './WaterTemp';
import Logout from './Logout';


export default class Dashboard extends React.Component{
    static navigationOptions = {
        headerShown: false
    };

    state = {
        username: '',
        running: this.props.running
    }

    componentDidMount(){
        this.displayUsername()
    }

    async displayUsername(){
        let token = await AsyncStorage.getItem('x-access-token');
        let decoded = jwtDecode(token);
        this.setState({
            username: decoded.username
        });
    }

    render() {        
        return (
            <View style={styles.container}>
                <StatusBar barStyle={'light-content'} />
                <ImageBackground
                        style={styles.image}
                        source={require('./img/landingPage.jpg')}>
                        <View style={styles.subContainer}>
                            <Text style={styles.dashHeader}>
                                welcome, {this.state.username}
                            </Text>
                            <View style={styles.dispContainer}>
                                <TempDisp/>
                                <WaterTemp />
                                <CleanDisp />
                                <PumpDisp />
                                <LightDisp />
                            </View>
                            <View style={styles.ctrlContainer}>
                                <TouchableOpacity style={styles.ctrlBtn} onPress={() => this.props.navigation.navigate('ControlDisp')}>
                                    <Text style={styles.ctrlBtnTxt}>
                                        Controls
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Logout navigation={this.props.navigation.navigate} logBtn={styles.logBtn}/>
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
        top: 50,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
    dashHeader: {
        fontSize: 30,
        fontWeight: 'bold',
        letterSpacing: 1,
        paddingBottom: 20,
    },
    ctrlBtn: {
        top: 225,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 10,
        paddingRight: 100,
        paddingLeft: 100,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 340
    },
    ctrlBtnTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    logBtn: {
        top: 250,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 10,
        paddingRight: 100,
        paddingLeft: 100,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 340
    },
})