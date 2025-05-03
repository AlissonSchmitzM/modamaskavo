import React, {useState, Component} from 'react';
import {View, StyleSheet, Image, ScrollView, Text} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import {signup} from '../imgs';
import {CpfCnpjInput, PhoneInput, CepInput} from '../common';
import {connect} from 'react-redux';
import {
  fetchAddressByCep,
  modifyAddress,
  modifyNeighborhood,
  modifyCity,
  modifyState,
} from '../store/actions/userActions';
import toastr, {ERROR} from '../services/toastr';
import Toast from 'react-native-toast-message';

class SignUp extends Component {
  constructor(props) {
    super(props);
  }

  handleCompleteCep = cep => {
    if (cep && cep.length >= 8) {
      this.props.fetchAddressByCep(cep);
    }

    if (this.props.error) {
      toastr.showToast(this.props.error, ERROR);
    }
  };

  render() {
    const {address} = this.props;

    return (
      <View>
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
              onCompleteCep={cep => this.handleCompleteCep(cep)}
            />
            <TextInput
              label="Endereço"
              style={styles.input}
              value={address.logradouro}
              onChangeText={text => this.props.modifyAddress(text)}
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
              value={address.bairro}
              onChangeText={text => this.props.modifyNeighborhood(text)}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
            />
            <TextInput
              label="Cidade"
              style={styles.input}
              value={address.localidade}
              onChangeText={text => this.props.modifyCity(text)}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
            />
            <TextInput
              label="Estado"
              style={styles.input}
              value={address.estado}
              onChangeText={text => this.props.modifyState(text)}
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
        <Toast />
      </View>
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

const mapStateToProps = state => ({
  address: state.userReducer.address,
  error: state.userReducer.error,
});

export default connect(mapStateToProps, {
  fetchAddressByCep,
  modifyAddress,
  modifyNeighborhood,
  modifyCity,
  modifyState,
})(SignUp);
