import React from 'react';
import {View, StyleSheet} from 'react-native';
import {TextInput, Button, Title} from 'react-native-paper';

const SignUp = () => {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Crie sua conta</Title>
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
    marginTop: 10,
    backgroundColor: '#000000',
  },
});

export default SignUp;
