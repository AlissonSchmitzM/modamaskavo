import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import PixPayment from './PixPayment';
import CardPayment from './CardPayment';

const PaymentScreen = ({valor, descricao, onSuccess, onCancel}) => {
  const [metodoPagamento, setMetodoPagamento] = useState(null);

  const handleSuccess = dadosPagamento => {
    // Aqui você pode processar os dados do pagamento bem-sucedido
    console.log('Pagamento realizado com sucesso:', dadosPagamento);
    onSuccess?.(dadosPagamento);
  };

  const handleCancel = () => {
    // Resetar o método de pagamento para voltar à tela de seleção
    setMetodoPagamento(null);
    onCancel?.();
  };

  // Renderizar o método de pagamento selecionado
  if (metodoPagamento === 'pix') {
    return (
      <PixPayment
        valor={valor}
        descricao={descricao}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  if (metodoPagamento === 'cartao') {
    return (
      <CardPayment
        valor={valor}
        descricao={descricao}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  // Tela de seleção de método de pagamento
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha como pagar</Text>
      <Text style={styles.subtitle}>Valor: R$ {valor.toFixed(2)}</Text>
      <Text style={styles.description}>{descricao}</Text>

      <TouchableOpacity
        style={styles.methodButton}
        onPress={() => setMetodoPagamento('pix')}>
        <Image
          source={require('../imgs/logo.png')}
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
        onPress={() => setMetodoPagamento('cartao')}>
        <Image
          source={require('../imgs/logo.png')}
          style={styles.methodIcon}
          resizeMode="contain"
        />
        <View style={styles.methodInfo}>
          <Text style={styles.methodTitle}>Cartão de Crédito</Text>
          <Text style={styles.methodDescription}>Pagamento em até 12x</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 5,
    color: '#00AEEF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
    textAlign: 'center',
  },
  methodButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  methodIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default PaymentScreen;
