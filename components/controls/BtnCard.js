import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from 'react-native';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-community/async-storage';

export default class BtnCard extends React.Component{
    static navigationOptions = {
        headerShown: false
    };
    navManControl = () => {
        this.props.navigation(this.props.dest)
    }
    navSchControl = () => {
        this.props.navigation(this.props.destSch)
    }

    render() {
        return (
            <View style={styles.pmpContainer}>
                <Text style={styles.pmpHeader}>
                    {this.props.header}
                </Text>
                <View style={styles.pmpBtnContainer}>
                    <TouchableOpacity onPress={this.navManControl} style={styles.manPmpBtn}>
                        <Text style={styles.manPmpBtnTxt}>
                            {this.props.manual}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.navSchControl} style={styles.schPmpBtn}>
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
        flexDirection: 'column',
        zIndex: 1
    },
    pmpHeader: {
        marginTop: (Platform.OS === 'ios') ? 25 : 15,
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
        top: (Platform.OS === 'ios') ? 20 : 10,
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
        fontWeight: 'bold',
    },
    schPmpBtn: {
        top: (Platform.OS === 'ios') ? 20 : 10,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'navy',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'lightgray',
        width: 150,
    },
    schPmpBtnTxt: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },

});
