import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import {login} from '../../imgs';
import toastr, {SUCCESS, INFO, ERROR} from '../../services/toastr';
import Toast from 'react-native-toast-message';
import navigationService from '../../services/NavigatorService';
import {connect} from 'react-redux';
import {
  modifyEmail,
  modifyPassword,
  authUserEmail,
} from '../../store/actions/userActions';
import {colors} from '../../styles/Styles';

class FormLogin extends Component {
  constructor(props) {
    super(props);

    this.passwordRef = React.createRef();
    this.btnLoginRef = React.createRef();
  }

  renderBtnLogin() {
    if (this.props.loginInProgress) {
      return (
        <ActivityIndicator
          style={{marginBottom: 10}}
          size="large"
          color={colors.PRIMARY}
        />
      );
    }
    return (
      <Button
        ref={this.btnLoginRef}
        mode="contained"
        style={styles.button}
        onPress={this.handleSubmit}>
        Login
      </Button>
    );
  }

  validateFields() {
    if (!this.props.email) {
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
      this.props.onAuthUserEmail(this.props);
    }
  };

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <View style={styles.container}>
          <Image source={login} style={styles.login} />
          <TextInput
            label="Email"
            value={this.props.email}
            returnKeyType="next"
            keyboardType="email-address"
            onSubmitEditing={() => this.passwordRef.current?.focus()}
            style={styles.input}
            onChangeText={text => this.props.onModifyEmail(text)}
            mode="outlined"
            theme={{colors: {primary: '#000000'}}}
          />
          <TextInput
            label="Senha"
            value={this.props.password}
            ref={this.passwordRef}
            returnKeyType="go"
            style={styles.input}
            onSubmitEditing={this.handleSubmit}
            onChangeText={text => this.props.onModifyPassword(text)}
            mode="outlined"
            secureTextEntry
            theme={{colors: {primary: '#000000'}}}
          />
          {this.renderBtnLogin()}
          <Button
            icon={() => <Icon name="google" size={20} color="#fff" />}
            mode="contained"
            style={styles.googleButton}
            onPress={() => toastr.showToast('Ocorreu um erro!', ERROR)}>
            Login com Google
          </Button>
          <TouchableOpacity
            onPress={() => navigationService.navigate('FormSignUp')}>
            <Text style={styles.signUpText}>
              Não tem uma conta? Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
        <Toast />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
  googleButton: {
    width: '90%',
    backgroundColor: '#DB4437',
  },
  signUpText: {
    marginTop: 20,
    textAlign: 'center',
  },
  login: {
    width: '80%',
    height: '40%',
    marginBottom: 20,
  },
});

const mapDispatchToProps = dispatch => ({
  onAuthUserEmail: user => dispatch(authUserEmail(user)),
  onModifyEmail: email => dispatch(modifyEmail(email)),
  onModifyPassword: password => dispatch(modifyPassword(password)),
});

const mapStateToProps = state => ({
  email: state.userReducer.email,
  password: state.userReducer.password,
  loginInProgress: state.userReducer.loginInProgress,
});

export default connect(mapStateToProps, mapDispatchToProps)(FormLogin);
