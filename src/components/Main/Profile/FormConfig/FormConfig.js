import React, {Component} from 'react';
import {View} from 'react-native';
import {
  Button,
  ActivityIndicator,
  Card,
  Text,
  TextInput,
  RadioButton,
} from 'react-native-paper';
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
  modifyEnvironment,
  modifyKeyApiSandbox,
  modifyKeyApiProd,
  readDataConfig,
  saveConfig,
} from '../../../../store/actions/configActions';
import LottieView from 'lottie-react-native';
import {config} from '../../../../assets';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

class FormConfig extends Component {
  constructor(props) {
    super(props);

    this.btnSaveRef = React.createRef();
  }

  componentDidMount() {
    this.props.onReadDataConfig();
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
        <KeyboardAwareScrollView
          style={{flex: 1}}
          extraScrollHeight={100}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
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
            <Card style={styles.card}>
              <Card.Content>
                <Text style={{marginBottom: 12}} variant="titleMedium">
                  Pedidos
                </Text>
                <PhoneInput
                  label="Celular"
                  ref={this.celularRef}
                  returnKeyType="go"
                  onSubmitEditing={this.handleSubmit}
                  style={styles.input}
                  value={this.props.phone_orders}
                  onChangeText={(formattedText, cleanText) => {
                    this.props.onModifyPhoneConfig(formattedText);
                  }}
                />
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Text style={{marginBottom: 12}} variant="titleMedium">
                  Pagamentos
                </Text>
                <Text variant="titleSmall">Ambiente</Text>
                <RadioButton.Group
                  onValueChange={value => this.props.onModifyEnvironment(value)}
                  value={this.props.environment}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <RadioButton.Item
                      color="#000"
                      label="Sandbox"
                      value="sandbox"
                    />
                    <RadioButton.Item
                      color="#000"
                      label="Produção"
                      value="producao"
                    />
                  </View>
                </RadioButton.Group>
                <TextInput
                  label="Chave API Sandbox"
                  style={[styles.input, {marginBottom: 15}]}
                  value={this.props.key_api_sandbox}
                  textColor="#000"
                  onChangeText={text => this.props.onModifyKeyApiSandbox(text)}
                  mode="outlined"
                  theme={{
                    colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                  }}
                />
                <TextInput
                  label="Chave API Produçãos"
                  style={styles.input}
                  value={this.props.key_api_prod}
                  textColor="#000"
                  onChangeText={text => this.props.onModifyKeyApiProd(text)}
                  mode="outlined"
                  theme={{
                    colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                  }}
                />
              </Card.Content>
            </Card>
            {this.renderBtnRegister()}
          </View>
        </KeyboardAwareScrollView>
        <Toast config={toastConfig} />
      </SafeAreaView>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onReadDataUser: () => dispatch(readDataUser()),
  onReadDataConfig: () => dispatch(readDataConfig()),
  onSaveConfig: config => dispatch(saveConfig(config)),
  onModifyPhoneConfig: phone => dispatch(modifyPhoneConfig(phone)),
  onModifyEnvironment: environment => dispatch(modifyEnvironment(environment)),
  onModifyKeyApiSandbox: key => dispatch(modifyKeyApiSandbox(key)),
  onModifyKeyApiProd: key => dispatch(modifyKeyApiProd(key)),
});

const mapStateToProps = state => ({
  saveConfigInProgress: state.configReducer.saveConfigInProgress,
  phone_orders: state.configReducer.phone_orders,
  environment: state.configReducer.environment,
  key_api_sandbox: state.configReducer.key_api_sandbox,
  key_api_prod: state.configReducer.key_api_prod,
});

export default connect(mapStateToProps, mapDispatchToProps)(FormConfig);
