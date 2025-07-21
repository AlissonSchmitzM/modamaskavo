import React, {useState, Component} from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {TextInput, Button, ActivityIndicator} from 'react-native-paper';
import {connect} from 'react-redux';
import {
  modifyName,
  modifyEmail,
  modifyPassword,
  createUser,
  forgotPassword,
} from '../../../../store/actions/userActions';
import toast, {ERROR, toastConfig} from '../../../../services/toastr';
import Toast from 'react-native-toast-message';
import styles from '../Styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import {forgot_password} from '../../../../assets';
import LottieView from 'lottie-react-native';
import {colors} from '../../../../styles/Styles';
import toastr from '../../../../services/toastr';

class FormForgotPassword extends Component {
  constructor(props) {
    super(props);

    this.emailRef = React.createRef();
  }

  renderBtnRegister() {
    if (this.props.forgotPasswordInProgress) {
      return <ActivityIndicator size="large" color={colors.PRIMARY} />;
    }
    return (
      <Button
        mode="contained"
        style={styles.button}
        onPress={this.handleSubmit}>
        Enviar Instruções de Redefinição
      </Button>
    );
  }

  validateFields() {
    if (!this.props.email) {
      toastr.showToast('Email inválido!', ERROR);
      return false;
    }

    return true;
  }

  handleSubmit = () => {
    this.setState({loading: true});
    if (this.validateFields()) {
      this.props.onForgotPassword(this.props.email);
    }
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 80}
          style={{flex: 1}}>
          <View style={styles.container}>
            <LottieView
              source={forgot_password}
              autoPlay
              loop
              style={{
                width: '100%',
                height: 200,
              }}
            />
            <TextInput
              label="Email"
              returnKeyType="go"
              keyboardType="email-address"
              onSubmitEditing={this.handleSubmit}
              style={styles.input}
              value={this.props.email}
              textColor="#000"
              onChangeText={text => this.props.onModifyEmail(text)}
              mode="outlined"
              theme={{
                colors: {primary: '#000000', onSurfaceVariant: '#999999'},
              }}
            />
            {this.renderBtnRegister()}
          </View>
        </KeyboardAvoidingView>
        <Toast config={toastConfig} />
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onModifyEmail: email => dispatch(modifyEmail(email)),
  onForgotPassword: email => dispatch(forgotPassword(email)),
});

const mapStateToProps = state => ({
  forgotPasswordInProgress: state.userReducer.forgotPasswordInProgress,
  email: state.userReducer.email,
});

export default connect(mapStateToProps, mapDispatchToProps)(FormForgotPassword);
