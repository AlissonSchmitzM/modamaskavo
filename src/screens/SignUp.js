import React, {useState, Component} from 'react';
import {View, StyleSheet, Image, ScrollView, Text, Modal} from 'react-native';
import {TextInput, Button, ActivityIndicator} from 'react-native-paper';
import {signup} from '../imgs';
import {CpfCnpjInput, PhoneInput, CepInput, LoadingOverlay} from '../common';
import {connect} from 'react-redux';
import {
  fetchAddressByCep,
  modifyAddress,
  modifyNeighborhood,
  modifyCity,
  modifyState,
  modifyName,
  modifyEmail,
  modifyPassword,
  modifyCpfCnpj,
  modifyPhone,
  modifyCep,
  modifyNumber,
  modifyComplement,
  createUser,
} from '../store/actions/userActions';
import toastr, {ERROR} from '../services/toastr';
import Toast from 'react-native-toast-message';
import {colors} from '../styles/Styles';

class SignUp extends Component {
  constructor(props) {
    super(props);

    this.btnRegisterRef = React.createRef();
  }

  handleCompleteCep = cep => {
    console.log('cep', cep);
    if (cep && cep.length >= 8) {
      this.props.onFetchAddressByCep(cep);
    }

    if (this.props.error) {
      toastr.showToast(this.props.error, ERROR);
    }
  };

  renderBtnRegister() {
    if (this.props.registrationInProgress) {
      return <ActivityIndicator size="large" color={colors.PRIMARY} />;
    }
    return (
      <Button
        ref={this.btnRegisterRef}
        mode="contained"
        style={styles.button}
        onPress={
          () =>
            //if (this.validateFields()) {
            this.props.onCreateUser(this.props)
          //console.log('this.props', this.props)
          //}
        }>
        Cadastrar
      </Button>
    );
  }

  render() {
    const {address, loading} = this.props;

    return (
      <View style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Image source={signup} style={styles.signup} />
            <TextInput
              autoFocus
              label="Nome"
              style={styles.input}
              value={this.props.name}
              onChangeText={text => this.props.onModifyName(text)}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
            />
            <TextInput
              label="Email"
              style={styles.input}
              value={this.props.email}
              onChangeText={text => this.props.onModifyEmail(text)}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
            />
            <TextInput
              label="Senha"
              style={styles.input}
              value={this.props.password}
              onChangeText={text => this.props.onModifyPassword(text)}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
              secureTextEntry
            />
            <CpfCnpjInput
              style={styles.input}
              value={this.props.cpfcnpj}
              onChangeText={(formattedText, cleanText) => {
                this.props.onModifyCpfCnpj(formattedText);
              }}
            />
            <PhoneInput
              style={styles.input}
              value={this.props.phone}
              onChangeText={(formattedText, cleanText) => {
                this.props.onModifyPhone(formattedText);
              }}
            />
            <CepInput
              style={styles.input}
              value={this.props.cep}
              onChangeText={(formattedText, cleanText) => {
                this.props.onModifyCep(formattedText);
              }}
              onCompleteCep={cep => this.handleCompleteCep(cep)}
            />
            <TextInput
              label="Endereço"
              style={styles.input}
              value={address.logradouro}
              onChangeText={text => this.props.onModifyAddress(text)}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
            />
            <TextInput
              label="Número"
              style={styles.input}
              value={this.props.number}
              onChangeText={text => this.props.onModifyNumber(text)}
              mode="outlined"
              keyboardType="numeric"
              theme={{colors: {primary: '#000000'}}}
            />
            <TextInput
              label="Complemento (opcional)"
              style={styles.input}
              value={this.props.complement}
              onChangeText={text => this.props.onModifyComplement(text)}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
            />
            <TextInput
              label="Bairro"
              style={styles.input}
              value={address.bairro}
              onChangeText={text => this.props.onModifyNeighborhood(text)}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
            />
            <TextInput
              label="Cidade"
              style={styles.input}
              value={address.localidade}
              onChangeText={text => this.props.onModifyCity(text)}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
            />
            <TextInput
              label="Estado"
              style={styles.input}
              value={address.estado}
              onChangeText={text => this.props.onModifyState(text)}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
            />
            {this.renderBtnRegister()}
          </View>
        </ScrollView>
        <Toast />
        {loading && <LoadingOverlay message="Buscando endereço..." />}
      </View>
    );
  }
}

const absoluteFillObject = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

const modalOverlay = {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
};

const modalContent = {
  width: 200,
  backgroundColor: 'white',
  borderRadius: 10,
  padding: 20,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
};

const modalText = {
  marginTop: 10,
  fontSize: 16,
  color: '#333',
  textAlign: 'center',
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

const mapDispatchToProps = dispatch => ({
  onCreateUser: user => dispatch(createUser(user)),
  onFetchAddressByCep: cep => dispatch(fetchAddressByCep(cep)),
  onModifyAddress: logradouro => dispatch(modifyAddress(logradouro)),
  onModifyNeighborhood: bairro => dispatch(modifyNeighborhood(bairro)),
  onModifyCity: localidade => dispatch(modifyCity(localidade)),
  onModifyState: estado => dispatch(modifyState(estado)),
  onModifyName: name => dispatch(modifyName(name)),
  onModifyEmail: email => dispatch(modifyEmail(email)),
  onModifyPassword: password => dispatch(modifyPassword(password)),
  onModifyCpfCnpj: cpfcnpj => dispatch(modifyCpfCnpj(cpfcnpj)),
  onModifyPhone: phone => dispatch(modifyPhone(phone)),
  onModifyCep: cep => dispatch(modifyCep(cep)),
  onModifyNumber: number => dispatch(modifyNumber(number)),
  onModifyComplement: complement => dispatch(modifyComplement(complement)),
});

const mapStateToProps = state => ({
  registrationInProgress: state.userReducer.registrationInProgress,
  name: state.userReducer.name,
  email: state.userReducer.email,
  password: state.userReducer.password,
  cpfcnpj: state.userReducer.cpfcnpj,
  phone: state.userReducer.phone,
  cep: state.userReducer.cep,
  address: state.userReducer.address,
  complement: state.userReducer.complement,
  number: state.userReducer.number,
  error: state.userReducer.error,
  loading: state.userReducer.loading,
});

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
