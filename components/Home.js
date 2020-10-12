import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default class Home extends React.Component{
    static navigationOptions = {
        headerShown: false
    };
    nav_to_login = () => {
        this.props.navigation.navigate('Login')
    }
    nav_to_signUp = () => {
        this.props.navigation.navigate('SignUp')
    }
    
    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content"/>
                <ImageBackground
                    style={styles.image}
                    source={require('../components/img/landingPage.jpg')}>
                    <View style={styles.subContainer}>
                        <Text style={styles.homeHeader}>
                            Pool Controller
                        </Text>
                        <View style={styles.logBtnContainer}>
                            <TouchableOpacity style={styles.lpBtn} onPress={this.nav_to_login}>
                                <Text style={styles.lpBtnText}>Login</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.lpBtn} onPress={this.nav_to_signUp}>
                                <Text style={styles.lpBtnText}>
                                    SignUp
                                </Text>
                            </TouchableOpacity>
                        </View>
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
        alignItems: 'center',
    },
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
    subContainer: {
        top: 225,
        alignItems: 'center',
    },
    homeHeader: {
        fontSize: 32,
        textTransform: 'uppercase',
        paddingBottom: 40,
        fontWeight: 'bold',
    },
    lpBtn: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 20,
        paddingRight: 100,
        paddingLeft: 100,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray'
    },
    lpBtnText: {
        color: 'white',
        textTransform: 'uppercase',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1
    },
});
