import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import {login} from '../imgs';
import toastr, {SUCCESS, INFO, ERROR} from '../services/toastr';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [text, setText] = useState('');

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
          onSubmitEditing={() => {
            //this.Password.focus();
          }}
          style={styles.input}
          mode="outlined"
          onChangeText={text => {
            setText(text);
          }}
          theme={{colors: {primary: '#000000'}}}
        />
        <TextInput
          label="Senha"
          ref={input => {
            //this.Password = input;
          }}
          returnKeyType="go"
          style={styles.input}
          mode="outlined"
          secureTextEntry
          theme={{colors: {primary: '#000000'}}}
        />
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => navigation.navigate('Main')}>
          Login
        </Button>
        <Button
          icon={() => <Icon name="google" size={20} color="#fff" />}
          mode="contained"
          style={styles.googleButton}
          onPress={() =>
            toastr.showToastTitle('Ocorreu um erro!', 'Erro ao logar', ERROR)
          }>
          Login com Google
        </Button>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpText}>Não tem uma conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

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
