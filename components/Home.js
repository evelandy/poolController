import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';


export default class Home extends React.Component{
    render() {
        return (
            <View style={styles.container}>
                <Text>
                    Hello World
                </Text>
            </View>
        );
    }
}


const styles = StyleSheet.create({

});
