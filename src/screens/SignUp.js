import React, {useState} from 'react';
import {View, StyleSheet, Image, ScrollView} from 'react-native';
import {TextInput, Button, RadioButton, HelperText} from 'react-native-paper';
import {signup} from '../imgs';
import {CpfCnpjInput, PhoneInput, CepInput} from '../common';
import ViaCepService from '../services/ViaCepService';

const SignUp = () => {
  const [selectedOption, setSelectedOption] = useState('cpf');

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
        <CpfCnpjInput style={styles.input} />
        <PhoneInput style={styles.input} />
        <CepInput style={styles.input} onCompleteCep={handleCompleteCep} />
        <TextInput
          label="Endereço"
          style={styles.input}
          mode="outlined"
          theme={{colors: {primary: '#000000'}}}
        />
        <TextInput
          label="Número"
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
          theme={{colors: {primary: '#000000'}}}
        />
        <TextInput
          label="Complemento (opcional)"
          style={styles.input}
          mode="outlined"
          theme={{colors: {primary: '#000000'}}}
        />
        <TextInput
          label="Bairro"
          style={styles.input}
          mode="outlined"
          theme={{colors: {primary: '#000000'}}}
        />
        <TextInput
          label="Cidade"
          style={styles.input}
          mode="outlined"
          theme={{colors: {primary: '#000000'}}}
        />
        <TextInput
          label="Estado"
          style={styles.input}
          mode="outlined"
          theme={{colors: {primary: '#000000'}}}
        />
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => console.log('Cadastro Pressionado')}>
          Cadastrar
        </Button>
      </View>
    </ScrollView>
  );
};

const handleCompleteCep = async (value, cleanValue) => {
  const {} = await ViaCepService.get(cleanValue);
  console.log('value', response);
  console.log('cleanValue', cleanValue);
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f5f5f5',
  },
  container: {
    width: '100%',
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
    height: 200,
    marginBottom: 20,
  },
});

export default SignUp;
