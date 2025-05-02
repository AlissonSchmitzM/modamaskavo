import React, {useState, Component} from 'react';
import {View, StyleSheet, Image, ScrollView} from 'react-native';
import {TextInput, Button, RadioButton, HelperText} from 'react-native-paper';
import {signup} from '../imgs';
import {CpfCnpjInput, PhoneInput, CepInput} from '../common';
import ViaCepService from '../services/ViaCepService';

class SignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedOption: 'cpf',
      logradouro: '',
      bairro: '',
      localidade: '',
      estado: '',
    };
  }

  handleCompleteCep = async (value, cleanValue) => {
    console.log(cleanValue);
    try {
      const address = await ViaCepService.searchAddressCompletedByCep(
        cleanValue,
      );

      if (address) {
        const {logradouro, bairro, localidade, estado} = address;

        this.setState({
          logradouro: logradouro || '',
          bairro: bairro || '',
          localidade: localidade || '',
          estado: estado || '',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
    }
  };

  render() {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Image source={signup} style={styles.signup} />
          <TextInput
            autoFocus
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
          <CepInput
            style={styles.input}
            onCompleteCep={this.handleCompleteCep}
          />
          <TextInput
            label="Endereço"
            style={styles.input}
            value={this.state.logradouro}
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
            value={this.state.bairro}
            mode="outlined"
            theme={{colors: {primary: '#000000'}}}
          />
          <TextInput
            label="Cidade"
            style={styles.input}
            value={this.state.localidade}
            mode="outlined"
            theme={{colors: {primary: '#000000'}}}
          />
          <TextInput
            label="Estado"
            style={styles.input}
            value={this.state.estado}
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
  }
}

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
