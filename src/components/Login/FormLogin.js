import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import {login} from '../../imgs';
import toastr, {SUCCESS, INFO, ERROR} from '../../services/toastr';
import Toast from 'react-native-toast-message';
import navigationService from '../../services/NavigatorService';

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };

    this.passwordRef = React.createRef();
  }

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <View style={styles.container}>
          <Toast />
          <Image source={login} style={styles.login} />
          <TextInput
            label="Email"
            returnKeyType="next"
            keyboardType="email-address"
            onSubmitEditing={() => this.passwordRef.current?.focus()}
            style={styles.input}
            mode="outlined"
            onChangeText={text => {
              setText(text);
            }}
            theme={{colors: {primary: '#000000'}}}
          />
          <TextInput
            label="Senha"
            ref={this.passwordRef}
            returnKeyType="go"
            style={styles.input}
            mode="outlined"
            secureTextEntry
            theme={{colors: {primary: '#000000'}}}
          />
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => navigationService.navigate('Main')}>
            Login
          </Button>
          <Button
            icon={() => <Icon name="google" size={20} color="#fff" />}
            mode="contained"
            style={styles.googleButton}
            onPress={() => toastr.showToast('Ocorreu um erro!', ERROR)}>
            Login com Google
          </Button>
          <TouchableOpacity
            onPress={() => navigationService.navigate('SignUp')}>
            <Text style={styles.signUpText}>
              Não tem uma conta? Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  input: {
    width: '90%',
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    width: '90%',
    marginBottom: 10,
    backgroundColor: '#000000',
  },
  googleButton: {
    width: '90%',
    backgroundColor: '#DB4437',
  },
  signUpText: {
    marginTop: 20,
    textAlign: 'center',
  },
  login: {
    width: '80%',
    height: '40%',
    marginBottom: 20,
  },
});

export default LoginScreen;
