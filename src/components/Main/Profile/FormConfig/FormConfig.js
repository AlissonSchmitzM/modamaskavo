import React, {Component} from 'react';
import {View, ScrollView} from 'react-native';
import {Button, ActivityIndicator, PaperProvider} from 'react-native-paper';
import {PhoneInput} from '../../../common';
import {connect} from 'react-redux';
import {readDataUser} from '../../../../store/actions/userActions';
import toastr, {ERROR, toastConfig} from '../../../../services/toastr';
import Toast from 'react-native-toast-message';
import {colors} from '../../../../styles/Styles';
import styles from './Styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  modifyPhoneConfig,
  saveConfig,
} from '../../../../store/actions/configActions';
import LottieView from 'lottie-react-native';
import {config} from '../../../../assets';

class FormConfig extends Component {
  constructor(props) {
    super(props);

    this.btnSaveRef = React.createRef();
  }

  componentDidMount() {
    //this.props.onReadDataUser();
  }

  renderBtnRegister() {
    if (this.props.saveConfigInProgress) {
      return <ActivityIndicator size="large" color={colors.PRIMARY} />;
    }
    return (
      <Button
        ref={this.btnSaveRef}
        mode="contained"
        style={styles.button}
        textColor="#FFF"
        onPress={this.handleSubmit}>
        Salvar
      </Button>
    );
  }

  validateFields() {
    if (!this.props.phone_orders || this.props.phone_orders.length < 15) {
      toastr.showToast('Telefone inválido!', ERROR);
      return false;
    }

    return true;
  }

  handleSubmit = () => {
    if (this.validateFields()) {
      this.props.onSaveConfig(this.props);
    }
  };

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.container}>
          <LottieView
            source={config}
            autoPlay
            loop
            style={{
              width: '100%',
              height: 150,
            }}
          />
          <PhoneInput
            label="Celular Pedidos"
            ref={this.celularRef}
            returnKeyType="go"
            onSubmitEditing={this.handleSubmit}
            style={styles.input}
            value={this.props.phone_orders}
            onChangeText={(formattedText, cleanText) => {
              this.props.onModifyPhoneConfig(formattedText);
            }}
          />
          {this.renderBtnRegister()}
        </View>
        <Toast config={toastConfig} />
      </SafeAreaView>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onReadDataUser: () => dispatch(readDataUser()),
  onSaveConfig: config => dispatch(saveConfig(config)),
  onModifyPhoneConfig: phone => dispatch(modifyPhoneConfig(phone)),
});

const mapStateToProps = state => ({
  saveConfigInProgress: state.configReducer.saveConfigInProgress,
  phone_orders: state.configReducer.phone_orders,
});

export default connect(mapStateToProps, mapDispatchToProps)(FormConfig);
