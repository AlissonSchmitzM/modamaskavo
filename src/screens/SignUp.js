import React from 'react';
import {View, StyleSheet, Image, ScrollView} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import {signup} from '../imgs';

const SignUp = () => {
  return (
    <View style={styles.container}>
      <Image source={signup} style={styles.signup} />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  signup: {
    width: '90%',
    height: '40%',
  },
});

export default SignUp;
