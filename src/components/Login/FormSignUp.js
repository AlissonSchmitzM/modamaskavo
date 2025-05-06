import React, {useState, Component} from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {TextInput, Button, ActivityIndicator} from 'react-native-paper';
import {signup} from '../../imgs';
import {connect} from 'react-redux';
import {
  modifyName,
  modifyEmail,
  modifyPassword,
  createUser,
} from '../../store/actions/userActions';
import toastr, {ERROR} from '../../services/toastr';
import Toast from 'react-native-toast-message';
import {colors} from '../../styles/Styles';

class FormSignUp extends Component {
  constructor(props) {
    super(props);

    this.btnRegisterRef = React.createRef();
    this.nameRef = React.createRef();
    this.emailRef = React.createRef();
    this.passwordRef = React.createRef();
  }

  renderBtnRegister() {
    if (this.props.registrationInProgress) {
      return <ActivityIndicator size="large" color={colors.PRIMARY} />;
    }
    return (
      <Button
        ref={this.btnRegisterRef}
        mode="contained"
        style={styles.button}
        onPress={this.handleSubmit}>
        Cadastrar
      </Button>
    );
  }

  validateFields() {
    if (!this.props.name) {
      toastr.showToast('Nome é obrigatório!', ERROR);
      return false;
    } else if (!this.props.email) {
      toastr.showToast('Email inválido!', ERROR);
      return false;
    } else if (!this.props.password) {
      toastr.showToast('Senha inválida!', ERROR);
      return false;
    }

    return true;
  }

  handleSubmit = () => {
    if (this.validateFields()) {
      this.props.onCreateUser(this.props);
    }
  };

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <View style={styles.container}>
            <Image source={signup} style={styles.signup} />
            <TextInput
              autoFocus
              ref={this.nameRef}
              label="Nome"
              returnKeyType="next"
              onSubmitEditing={() => this.emailRef.current?.focus()}
              style={styles.input}
              value={this.props.name}
              onChangeText={text => this.props.onModifyName(text)}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
            />
            <TextInput
              ref={this.emailRef}
              label="Email"
              returnKeyType="next"
              keyboardType="email-address"
              onSubmitEditing={() => this.passwordRef.current?.focus()}
              style={styles.input}
              value={this.props.email}
              onChangeText={text => this.props.onModifyEmail(text)}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
            />
            <TextInput
              ref={this.passwordRef}
              label="Senha"
              returnKeyType="go"
              style={styles.input}
              onSubmitEditing={this.handleSubmit}
              value={this.props.password}
              onChangeText={text => this.props.onModifyPassword(text)}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
              secureTextEntry
            />
            {this.renderBtnRegister()}
          </View>
          <Toast />
        </View>
      </KeyboardAvoidingView>
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

const mapDispatchToProps = dispatch => ({
  onModifyName: name => dispatch(modifyName(name)),
  onModifyEmail: email => dispatch(modifyEmail(email)),
  onModifyPassword: password => dispatch(modifyPassword(password)),
  onCreateUser: user => dispatch(createUser(user)),
});

const mapStateToProps = state => ({
  registrationInProgress: state.userReducer.registrationInProgress,
  name: state.userReducer.name,
  email: state.userReducer.email,
  password: state.userReducer.password,
});

export default connect(mapStateToProps, mapDispatchToProps)(FormSignUp);
