import React, {useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import {TextInput, Button, Title} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import {logo} from '../imgs';

const LoginScreen = ({navigation}) => {
  const [text, setText] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
      </View>
      <View style={styles.formContainer}>
        <TextInput
          label="Email"
          style={styles.input}
          mode="outlined"
          onChangeText={text => {
            setText(text);
          }}
          theme={{colors: {primary: '#000000'}}}
        />
        <TextInput
          label="Senha"
          style={styles.input}
          mode="outlined"
          secureTextEntry
          theme={{colors: {primary: '#000000'}}}
        />
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => console.log('Login Pressionado')}>
          Login
        </Button>
        <Button
          icon={() => <Icon name="google" size={20} color="#fff" />}
          mode="contained"
          style={styles.googleButton}
          onPress={() => console.log('Login com Google')}>
          Login com Google
        </Button>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpText}>Não tem uma conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    marginBottom: 10,
    backgroundColor: '#000000',
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  signUpText: {
    marginTop: 20,
    textAlign: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  logoContainer: {
    flex: 1,
    marginTop: 50,
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
  },
});

export default LoginScreen;
