import React from 'react';
import {View, StyleSheet, Image, ScrollView} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import {signup} from '../imgs';

const SignUp = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.signupContainer}>
          <Image source={signup} style={styles.signup} />
        </View>
        <View style={styles.formContainer}>
          <TextInput
            label="Nome"
            style={styles.input}
            mode="outlined"
            theme={{colors: {primary: '#000000'}}}
          />
          <TextInput
            label="Email"
            style={styles.input}
            mode="outlined"
            theme={{colors: {primary: '#000000'}}}
          />
          <TextInput
            label="Senha"
            style={styles.input}
            mode="outlined"
            theme={{colors: {primary: '#000000'}}}
            secureTextEntry
          />
          <TextInput
            label="Confirmar Senha"
            style={styles.input}
            mode="outlined"
            theme={{colors: {primary: '#000000'}}}
            secureTextEntry
          />
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => console.log('Cadastro Pressionado')}>
            Cadastrar
          </Button>
        </View>
      </ScrollView>
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
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    marginBottom: 10,
    backgroundColor: '#000000',
  },
  signup: {
    width: 350,
    height: 350,
  },
  signupContainer: {
    flex: 1,
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
  },
});

export default SignUp;
