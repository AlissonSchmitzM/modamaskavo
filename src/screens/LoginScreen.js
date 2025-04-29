import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import {login} from '../imgs';

const LoginScreen = ({navigation}) => {
  const [text, setText] = useState('');

  return (
    <View style={styles.container}>
      <Image source={login} style={styles.login} />
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
        onPress={() => navigation.navigate('Main')}>
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
