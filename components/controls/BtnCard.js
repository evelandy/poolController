import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from 'react-native';
let jwtDecode = require('jwt-decode');


export default class BtnCard extends React.Component{
    static navigationOptions = {
        headerShown: false
    };

    render() {
        return (
            <View style={styles.pmpContainer}>
                <Text style={styles.pmpHeader}>
                    {this.props.header}
                </Text>
                <View style={styles.pmpBtnContainer}>
                    <TouchableOpacity style={styles.manPmpBtn}>
                        <Text style={styles.manPmpBtnTxt}>
                            {this.props.manual}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.schPmpBtn}>
                        <Text style={styles.schPmpBtnTxt}>
                            {this.props.schedule}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    pmpContainer: {
        flexDirection: 'column'
    },
    pmpHeader: {
        marginTop: 25,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 27,
        textTransform: 'uppercase',
        left: 130,
    },
    pmpBtnContainer: {
        flexDirection: 'row',
    },
    manPmpBtn: {
        top: 20,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 150,
        marginRight: 50
    },
    manPmpBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    schPmpBtn: {
        top: 20,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 150
    },
    schPmpBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },

});
