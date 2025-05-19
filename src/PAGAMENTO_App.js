import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import PaymentScreen from './components/PaymentScreen';

export default function App() {
  const [showPayment, setShowPayment] = useState(false);
  const [pagamentoRealizado, setPagamentoRealizado] = useState(false);
  const [detalhesCompra, setDetalhesCompra] = useState(null);

  // Exemplo de produto para compra
  const produto = {
    nome: 'Produto Exemplo',
    valor: 200.0,
    descricao: 'Pagamento referente à compra do Produto Exemplo',
  };

  const iniciarPagamento = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = dados => {
    setPagamentoRealizado(true);
    setDetalhesCompra(dados);
    setShowPayment(false);
    Alert.alert('Sucesso', 'Pagamento realizado com sucesso!');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    Alert.alert('Cancelado', 'O pagamento foi cancelado');
  };

  if (showPayment) {
    return (
      <PaymentScreen
        valor={produto.valor}
        descricao={produto.descricao}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Minha Loja</Text>

        <View style={styles.productCard}>
          <Text style={styles.productTitle}>{produto.nome}</Text>
          <Text style={styles.productPrice}>R$ {produto.valor.toFixed(2)}</Text>
          <Text style={styles.productDescription}>{produto.descricao}</Text>

          {!pagamentoRealizado ? (
            <TouchableOpacity
              style={styles.buyButton}
              onPress={iniciarPagamento}>
              <Text style={styles.buyButtonText}>Comprar Agora</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                Compra realizada com sucesso!
              </Text>
              <TouchableOpacity
                style={styles.newPurchaseButton}
                onPress={() => setPagamentoRealizado(false)}>
                <Text style={styles.newPurchaseButtonText}>Nova Compra</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 24,
    color: '#00AEEF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  buyButton: {
    backgroundColor: '#00AEEF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  successText: {
    color: 'green',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  newPurchaseButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  newPurchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
