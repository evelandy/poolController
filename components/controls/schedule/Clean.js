import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    TextInput
} from 'react-native';
import Logout from '../../Logout';
import CleanDisp from '../../CleanDisp';
import TempDisp from '../../TempDisp';
import WaterTemp from '../../WaterTemp';

export default class Clean extends React.Component{
    static navigationOptions = {
        headerShown: false
    };
    state = {
        running: 'false',
        hour: 10,
        minute: 30,
        mid: 'AM',
        setSchHr: '12',
        setSchMin: '00',
        setSchMid: 'PM'
    }
    
    schClnOn = (tm=4) => {
        fetch(`http://127.0.0.1:5000/api/v1/sch_c_on/${tm}`)
        .then((response) => {
            let data = response.json()
            return data
        })
        .then((data) => {
            this.setState({
                running: data.msg
            })
        })
        .catch((error) => {
            console.warn(error)
        })
    }

    schClnOff = (tm=4) => {
        fetch(`http://127.0.0.1:5000/api/v1/sch_c_off/${tm}`)
        .then((response) => {
            let data = response.json()
            return data
        })
        .then((data) => {
            this.setState({
                running: data.msg
            })
        })
        .catch((error) => {
            console.warn(error)
        })
    }

    updateValue(text, field){
        if (field == 'hour'){
            this.setState({
                hour: text
            })
        } else if (field == 'min'){
            this.setState({
                minute: text
            })
        } else if (field == 'mid'){
            this.setState({
                mid: text
            })
        }
    }

    navControl = () => {
        this.props.navigation.navigate('ControlDisp')
    }

    render() {
        return (
            <View style={styles.container}>
                <ImageBackground
                    style={styles.image}
                    source={require('../../img/landingPage.jpg')}>
                    <View style={styles.subContainer}>
                        <Text style={styles.schClnHeader}>
                            Schedule Clean Control
                        </Text>
                        <View style={styles.btnContainer}>
                            <TouchableOpacity style={styles.schClnBtn} onPress={() => {this.schClnOn(2)}}>
                                <Text style={styles.schClnBtnTxt}>
                                    set
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.schClnBtn} onPress={() => {this.schClnOff(2)}}>
                                <Text style={styles.schClnBtnTxt}>
                                    run
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TempDisp />
                        <WaterTemp />
                        <CleanDisp running={this.state.running} />
                        <View style={styles.currSchContainer}>
                            <Text style={styles.currSchHeader}>
                                Current Schedule: &nbsp; {this.state.setSchHr}:{this.state.setSchMin} {this.state.setSchMid}
                            </Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.schInput}
                                autoCorrect={false}
                                onChangeText={(text) => this.updateValue(text, 'hour')}
                                // value={this.state.hour}
                                keyboardType={'numeric'}
                                maxLength={2}
                                returnKeyType='next'
                                onSubmitEditing={() => this.minuteuInput.focus()}>
                                    {this.state.hour}
                            </TextInput>
                            <Text style={styles.colon}>
                                :
                            </Text>
                            <TextInput 
                                style={styles.schInput}
                                autoCorrect={false}
                                onChangeText={(text) => this.updateValue(text, 'min')}
                                // value={this.state.minute}
                                keyboardType={'numeric'}
                                maxLength={2}
                                returnKeyType='next'
                                ref={(input) => this.minuteuInput = input}
                                onSubmitEditing={() => this.midInput.focus()}>
                                    {this.state.minute}
                            </TextInput>
                            <TextInput 
                                style={styles.schInput}
                                autoCapitalize='characters'
                                autoCorrect={false}
                                onChangeText={(text) => this.updateValue(text, 'mid')}
                                value={this.state.mid}
                                maxLength={2}
                                returnKeyType='go'
                                ref={(input) => this.midInput = input}
                                onSubmitEditing={() => alert(`${this.state.hour}:${this.state.minute} ${this.state.mid}`)}
                            />
                        </View>
                        <Logout navigation={this.props.navigation.navigate} logBtn={styles.logBtn} />
                        <TouchableOpacity style={styles.backBtn} onPress={this.navControl}>
                            <Text style={styles.backBtnTxt}>
                                Back
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
        top: 75,
        alignItems: 'center'
    },
    btnContainer: {
        flexDirection: 'row',
        top: 240
    },
    schClnHeader: {
        fontSize: 30,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    image: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover'
    },
    schClnBtn: {
        top: 100,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 150,
        marginLeft: 10,
        marginRight: 12
    },
    schClnBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    logBtn: {
        top: 200,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        margin: 10,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 340
    },
    backBtn: {
        top: 220,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 150,
    },
    backBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    currSchHeader: {
        borderWidth: 1,
        borderColor: 'white',
        borderStyle: 'solid',
        paddingRight: 40,
        paddingLeft: 40,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 20
    },
    inputContainer: {
        flexDirection: 'row',
        marginTop: 30
    },
    schInput: {
        width: 42,
        height: 35,
        backgroundColor: 'lightblue',
        borderColor: 'lightgray',
        borderWidth: 2,
        borderRadius: 3,
        fontSize: 25,
        marginRight: 3,
        textAlign: 'center'
    },
    colon: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
        marginRight: 3
    },
});
