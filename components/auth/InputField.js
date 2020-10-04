import React from 'react';
import {
    TextInput,
    StyleSheet
} from 'react-native';

export default class InputField extends React.Component{
    state = {
        fname: '',
        lname: '',
        username: '',
        password: '',
        email: '',
        address: '',
        city: '',
        zip_code: '',
        phone: ''
    }

    onChangeText = (key, val) => {
        this.setState({
            [key]: val
        });
    }

    needToFigureThisOut = () => {
        let ttt = this.state.fname;
        props.test(ttt); 
    }

    // from in signup class
     // changeFname = (childData) => {
    //     this.setState({
    //         fname: childData
    //     })
        // let ttt = this.state.fname;
        // props.test(ttt); 
    // }

    // alert(`parent = ${this.state.fname}`)


    // <InputField test={this.changeFname} name={'fname'} move={() => this.lname.focus()} retKeyType={'next'} keyType={'default'} sec={false} />
    // <InputField name={'lname'} nxt={(input) => this.lname = input} move={() => this.username.focus()} retKeyType={'next'} keyType={'default'} sec={false} /> 
    // <InputField name={'username'} nxt={(input) => this.username = input} move={() => this.password.focus()} retKeyType={'next'} keyType={'email-address'} sec={false} />
    // <InputField name={'password'} nxt={(input) => this.password = input} move={() => this.email.focus()} retKeyType={'next'} keyType={'email-address'} sec={true} />
    // <InputField name={'email'} nxt={(input) => this.email = input} move={() => this.address.focus()} retKeyType={'next'} keyType={'email-address'} sec={false} />
    // <InputField name={'address'} nxt={(input) => this.address = input} move={() => this.city.focus()} retKeyType={'next'} keyType={'numbers-and-punctuation'} sec={false} />
    // <InputField name={'city'} nxt={(input) => this.city = input} move={() => this.zip_code.focus()} retKeyType={'next'} keyType={'default'} sec={false} />
    // <InputField name={'zip_code'} nxt={(input) => this.zip_code = input} move={() => this.phone.focus()} retKeyType={'next'} keyType={'numbers-and-punctuation'} sec={false} />
    // <InputField name={'phone'} nxt={(input) => this.phone = input} move={() => this.signUpUser()} retKeyType={'go'} keyType={'numbers-and-punctuation'} sec={false} />

    render() {
        return (
            <TextInput
                style={styles.txtInput}
                // placeholder='Username'
                secureTextEntry={this.props.sec}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType={this.props.keyType}
                returnKeyType={this.props.retKeyType}
                onChangeText={val => this.onChangeText(`${this.props.name}`, val)}
                ref={this.props.nxt}
                onSubmitEditing={this.props.move}
                // onEndEditing={this.needToFigureThisOut}
                onBlur={this.props.test('testing')}
            />
        );
    }
}

const styles = StyleSheet.create({
    txtInput: {
        height: 40,
        width: 275,
        borderColor: 'gray',
        borderWidth: 2,
        borderRadius: 3,
        marginTop: 15,
        backgroundColor: 'lightblue',
        fontSize: 27,
    },
});
