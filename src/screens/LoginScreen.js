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
      <ScrollView>
        <View style={styles.loginContainer}>
          <Image source={login} style={styles.login} />
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
            <Text style={styles.signUpText}>
              Não tem uma conta? Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
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
  login: {
    width: 350,
    height: 350,
  },
  loginContainer: {
    flex: 1,
    marginVertical: 50,
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
  },
});

export default LoginScreen;
