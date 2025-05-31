import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import PixPayment from './Pix/PixPayment.js';
import CardPayment from './Card/CardPayment.js';
import {styles} from './Styles.js';
import {connect} from 'react-redux';
import {logo_cartao, logo_pix} from '../../../imgs/index.js';
import {paymentSuccessOrder} from '../../../store/actions/orderActions.js';
import {toastConfig} from '../../../services/toastr.js';
import Toast from 'react-native-toast-message';

class PaymentScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metodoPagamento: null,
    };
  }

  setMetodoPagamento = metodo => {
    this.setState({metodoPagamento: metodo});
  };

  handleSuccess = () => {
    const {orderiD} = this.props.route.params;
    this.props.onPaymentSuccessOrder(orderiD);
  };

  render() {
    const {
      route,
      name,
      email,
      phone,
      cpfcnpj,
      cep,
      address,
      complement,
      number,
    } = this.props;
    const {valor, descricao} = route.params;
    const {metodoPagamento} = this.state;

    const dadosCliente = {
      nome: name,
      email: email,
      telefone: phone.replace(/[\s()-]/g, ''),
      cpfCnpj: cpfcnpj.replace(/[.\/-]/g, ''),
      cep: cep.replace('-', ''),
      endereco: address.logradouro,
      numero: number,
      complemento: complement,
      bairro: address.neighborhood,
      cidade: address.city,
      estado: address.state,
    };

    // Renderizar o método de pagamento selecionado
    if (metodoPagamento === 'pix') {
      return (
        <PixPayment
          valor={valor}
          descricao={descricao}
          dadosCliente={dadosCliente}
          onSuccess={this.handleSuccess}
        />
      );
    }

    if (metodoPagamento === 'cartao') {
      return (
        <CardPayment
          valor={valor}
          descricao={descricao}
          dadosCliente={dadosCliente}
          onSuccess={this.handleSuccess}
        />
      );
    }

    // Tela de seleção de método de pagamento
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Escolha como pagar</Text>
        <Text style={styles.subtitle}>
          Valor: R$ {valor.toFixed(2).replace('.', ',')}
        </Text>
        <Text style={styles.description}>{descricao}</Text>

        <TouchableOpacity
          style={styles.methodButton}
          onPress={() => this.setMetodoPagamento('pix')}>
          <Image
            source={logo_pix}
            style={styles.methodIcon}
            resizeMode="contain"
          />
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>PIX</Text>
            <Text style={styles.methodDescription}>Pagamento instantâneo</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.methodButton}
          onPress={() => this.setMetodoPagamento('cartao')}>
          <Image
            source={logo_cartao}
            style={styles.methodIcon}
            resizeMode="contain"
          />
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>Cartão de Crédito</Text>
            <Text style={styles.methodDescription}>Pagamento em até 12x</Text>
          </View>
        </TouchableOpacity>
        <Toast config={toastConfig} />
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onPaymentSuccessOrder: orderiD => dispatch(paymentSuccessOrder(orderiD)),
});

const mapStateToProps = state => ({
  name: state.userReducer.name,
  email: state.userReducer.email,
  cpfcnpj: state.userReducer.cpfcnpj,
  phone: state.userReducer.phone,
  cep: state.userReducer.cep,
  address: state.userReducer.address,
  complement: state.userReducer.complement,
  number: state.userReducer.number,
});

export default connect(mapStateToProps, mapDispatchToProps)(PaymentScreen);
