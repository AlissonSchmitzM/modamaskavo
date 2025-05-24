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
import toastr, {ERROR, toastConfig} from '../../services/toastr';
import Toast from 'react-native-toast-message';
import navigationService from '../../services/NavigatorService';
import {connect} from 'react-redux';
import {
  modifyEmail,
  modifyPassword,
  authUserEmail,
  authUserGoogle,
} from '../../store/actions/userActions';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../styles/Styles';

class FormLogin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      icon: 'eye-off',
      iconPassword: true,
    };

    this.passwordRef = React.createRef();
    this.btnLoginRef = React.createRef();
  }

  changeIcon() {
    this.setState(prevState => ({
      icon: prevState.icon === 'eye' ? 'eye-off' : 'eye',
      iconPassword: !prevState.iconPassword,
    }));
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
        textColor="#FFF"
        onPress={this.handleSubmit}>
        Login
      </Button>
    );
  }

  renderBtnGoogle() {
    if (this.props.loginGoogleInProgress) {
      return <ActivityIndicator size="large" color="#FF0000" />;
    }
    return (
      <Button
        icon={() => <Icon name="google" size={20} color="#FFF" />}
        mode="contained"
        style={styles.googleButton}
        textColor="#FFF"
        onPress={() => this.props.onAuthUserGoogle()}>
        Login com Google
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
      <SafeAreaView
        style={{flex: 1, backgroundColor: '#f5f5f5'}}
        edges={['bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 40}
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
              textColor="#000"
              onChangeText={text => this.props.onModifyEmail(text)}
              mode="outlined"
              theme={{
                colors: {primary: '#000000', onSurfaceVariant: '#999999'},
              }}
            />
            <TextInput
              label="Senha"
              value={this.props.password}
              ref={this.passwordRef}
              returnKeyType="go"
              style={styles.input}
              textColor="#000"
              onSubmitEditing={this.handleSubmit}
              onChangeText={text => this.props.onModifyPassword(text)}
              mode="outlined"
              secureTextEntry={this.state.iconPassword}
              right={
                <TextInput.Icon
                  icon={this.state.icon}
                  onPress={() => this.changeIcon()}
                />
              }
              theme={{
                colors: {primary: '#000000', onSurfaceVariant: '#999999'},
              }}
            />
            {this.renderBtnLogin()}
            {this.renderBtnGoogle()}
            <TouchableOpacity
              onPress={() => navigationService.navigate('FormSignUp')}>
              <Text style={styles.signUpText}>
                Não tem uma conta? Cadastre-se
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        <Toast config={toastConfig} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  input: {
    width: '90%',
    marginBottom: 15,
    backgroundColor: '#FFF',
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
  onAuthUserGoogle: () => dispatch(authUserGoogle()),
});

const mapStateToProps = state => ({
  email: state.userReducer.email,
  password: state.userReducer.password,
  loginInProgress: state.userReducer.loginInProgress,
  loginGoogleInProgress: state.userReducer.loginGoogleInProgress,
});

export default connect(mapStateToProps, mapDispatchToProps)(FormLogin);
