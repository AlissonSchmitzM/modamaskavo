import React, {useState, Component} from 'react';
import {View, StyleSheet, Image, ScrollView, Text, Modal} from 'react-native';
import {
  TextInput,
  Button,
  ActivityIndicator,
  Avatar,
  IconButton,
} from 'react-native-paper';
import {
  CpfCnpjInput,
  PhoneInput,
  CepInput,
  LoadingOverlay,
} from '../../../../common';
import {connect} from 'react-redux';
import {
  fetchAddressByCep,
  modifyAddress,
  modifyNeighborhood,
  modifyCity,
  modifyState,
  modifyName,
  modifyCpfCnpj,
  modifyPhone,
  modifyCep,
  modifyNumber,
  modifyComplement,
  saveProfileUser,
} from '../../../../store/actions/userActions';
import toastr, {ERROR} from '../../../../services/toastr';
import Toast from 'react-native-toast-message';
import {colors} from '../../../../styles/Styles';
import styles from './Styles';

class FormProfile extends Component {
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
    if (this.props.saveProfileInProgress) {
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
            this.props.onSaveProfileUser(this.props)
          //console.log('this.props', this.props)
          //}
        }>
        Salvar
      </Button>
    );
  }

  validateFields() {
    if (!this.props.name) {
      toastr.showToast('Nome é obrigatório!', ERROR);
      return false;
    } else if (!this.props.cpfcnpj) {
      toastr.showToast('CPF/CNPJ inválido!', ERROR);
      return false;
    } else if (!this.props.phone) {
      toastr.showToast('Telefone inválido!', ERROR);
      return false;
    } else if (!this.props.cep) {
      toastr.showToast('CEP inválido!', ERROR);
      return false;
    } else if (!this.props.number) {
      toastr.showToast('Número inválido!', ERROR);
      return false;
    } else if (!this.props.complement) {
      toastr.showToast('Complemento inválido!', ERROR);
      return false;
    } else if (!this.props.address) {
      toastr.showToast('Endereço inválido!', ERROR);
      return false;
    } else if (!this.props.neighborhood) {
      toastr.showToast('Bairro inválido!', ERROR);
      return false;
    } else if (!this.props.city) {
      toastr.showToast('Cidade inválida!', ERROR);
      return false;
    } else if (!this.props.state) {
      toastr.showToast('Estado inválido!', ERROR);
      return false;
    }

    return true;
  }

  render() {
    const {address, loading} = this.props;

    return (
      <View style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={styles.containerAvatar}>
              <Avatar.Text
                color="#FFF"
                backgroundColor={colors.SECONDARY}
                size={100}
                label={this.props.name.charAt(0)}
              />
              {/* <Avatar.Image
                color="#FFF"
                backgroundColor={colors.SECONDARY}
                size={100}
                source={require('../../../../imgs/logo.png')}
              />*/}
              <View style={styles.containerAvatarIcon}>
                <IconButton
                  icon="pencil"
                  size={14}
                  iconColor="white"
                  onPress={() => {}}
                  style={{margin: 0, padding: 0}}
                />
              </View>
            </View>
            <View>
              <Text style={{fontSize: 16, color: colors.SECONDARY}}>
                {this.props.email}
              </Text>
            </View>
            <TextInput
              autoFocus
              label="Nome"
              style={styles.input}
              value={this.props.name}
              onChangeText={text => this.props.onModifyName(text)}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
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

const mapDispatchToProps = dispatch => ({
  onSaveProfileUser: user => dispatch(saveProfileUser(user)),
  onFetchAddressByCep: cep => dispatch(fetchAddressByCep(cep)),
  onModifyAddress: logradouro => dispatch(modifyAddress(logradouro)),
  onModifyNeighborhood: bairro => dispatch(modifyNeighborhood(bairro)),
  onModifyCity: localidade => dispatch(modifyCity(localidade)),
  onModifyState: estado => dispatch(modifyState(estado)),
  onModifyName: name => dispatch(modifyName(name)),
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
  saveProfileInProgress: state.userReducer.saveProfileInProgress,
});

export default connect(mapStateToProps, mapDispatchToProps)(FormProfile);
