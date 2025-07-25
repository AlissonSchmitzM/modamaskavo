import React, {useState, Component} from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {TextInput, Button, ActivityIndicator} from 'react-native-paper';
import {signup} from '../../../imgs';
import {connect} from 'react-redux';
import {
  modifyName,
  modifyEmail,
  modifyPassword,
  createUser,
} from '../../../store/actions/userActions';
import toastr, {ERROR, toastConfig} from '../../../services/toastr';
import Toast from 'react-native-toast-message';
import {SafeAreaView} from 'react-native-safe-area-context';
import styles from './Styles';
import {colors} from '../../../styles';

class FormSignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      icon: 'eye-off',
      iconPassword: true,
    };

    this.btnRegisterRef = React.createRef();
    this.nameRef = React.createRef();
    this.emailRef = React.createRef();
    this.passwordRef = React.createRef();
  }

  changeIcon() {
    this.setState(prevState => ({
      icon: prevState.icon === 'eye' ? 'eye-off' : 'eye',
      iconPassword: !prevState.iconPassword,
    }));
  }

  renderBtnRegister() {
    if (this.props.registrationInProgress) {
      return <ActivityIndicator size="large" color={colors.PRIMARY} />;
    }
    return (
      <Button
        ref={this.btnRegisterRef}
        mode="contained"
        icon="account-plus"
        style={styles.button}
        onPress={this.handleSubmit}>
        Cadastrar
      </Button>
    );
  }

  validateFields() {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!this.props.name) {
      toastr.showToast('Nome é obrigatório!', ERROR);
      return false;
    } else if (!this.props.email) {
      toastr.showToast('Email inválido!', ERROR);
      return false;
    } else if (!regex.test(this.props.email)) {
      toastr.showToast('Formato de email inválido!', ERROR);
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
      <SafeAreaView style={{flex: 1}} edges={['left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 80}
          style={{flex: 1}}>
          <ScrollView
            contentContainerStyle={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
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
                textColor="#000"
                onChangeText={text => this.props.onModifyName(text)}
                mode="outlined"
                theme={{
                  colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                }}
              />
              <TextInput
                ref={this.emailRef}
                label="Email"
                returnKeyType="next"
                keyboardType="email-address"
                onSubmitEditing={() => this.passwordRef.current?.focus()}
                style={styles.input}
                value={this.props.email}
                textColor="#000"
                onChangeText={text => this.props.onModifyEmail(text)}
                mode="outlined"
                theme={{
                  colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                }}
              />
              <TextInput
                ref={this.passwordRef}
                label="Senha"
                returnKeyType="go"
                style={styles.input}
                onSubmitEditing={this.handleSubmit}
                value={this.props.password}
                textColor="#000"
                onChangeText={text => this.props.onModifyPassword(text)}
                mode="outlined"
                theme={{
                  colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                }}
                secureTextEntry={this.state.iconPassword}
                right={
                  <TextInput.Icon
                    icon={this.state.icon}
                    onPress={() => this.changeIcon()}
                  />
                }
              />
              {this.renderBtnRegister()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Toast config={toastConfig} />
      </SafeAreaView>
    );
  }
}

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
