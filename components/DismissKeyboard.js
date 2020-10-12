import React from 'react';
import {TouchableWithoutFeedback} from 'react-native';

export default DismissKeyboard = ({children, keyboard}) => {
    return (
        <TouchableWithoutFeedback
            onPress={() => keyboard.dismiss()}>
                {children}
        </TouchableWithoutFeedback>
    );
}
