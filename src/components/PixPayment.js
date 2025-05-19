import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsaasService from '../services/AsaasService';

const PixPayment = ({valor, descricao, onSuccess, onCancel}) => {
  const [loading, setLoading] = useState(true);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [copiaCola, setCopiaCola] = useState('');
  const [pagamentoId, setPagamentoId] = useState(null);
  const [statusVerificacao, setStatusVerificacao] = useState(null);
  const [intervaloRef, setIntervaloRef] = useState(null);

  // Iniciar pagamento PIX
  useEffect(() => {
    const iniciarPagamento = async () => {
      try {
        setLoading(true);

        // Verificar se já temos o cliente salvo
        let clienteId = await AsyncStorage.getItem('asaas_cliente_id');

        // Se temos um ID de cliente, verificar se ele ainda existe e está ativo
        if (clienteId) {
          try {
            const clienteAtivo = await AsaasService.verificarCliente(clienteId);
            if (!clienteAtivo) {
              // Se o cliente foi removido, limpar o ID armazenado
              await AsyncStorage.removeItem('asaas_cliente_id');
              clienteId = null;
              console.log('Cliente removido no Asaas, será criado um novo');
            }
          } catch (error) {
            // Em caso de erro na verificação, é mais seguro tentar criar um novo cliente
            await AsyncStorage.removeItem('asaas_cliente_id');
            clienteId = null;
          }
        }

        // Se não temos um cliente válido, criar um novo
        if (!clienteId) {
          // Dados do cliente - em uma aplicação real, você obteria esses dados do usuário
          const dadosCliente = {
            nome: 'Alisson Schmitz',
            email: 'a@testeaaa.com',
            telefone: '47999064883',
            cpfCnpj: '10089777999', // CPF sem formatação
            cep: '88310050',
            endereco: 'aaaaaa',
            numero: '1233',
            complemento: 'Apto 435',
            bairro: 'Centroa',
            cidade: 'São Pauloa',
            estado: 'SC',
          };

          try {
            // Verificar se cliente já existe por CPF/CNPJ
            const clienteExistente = await AsaasService.buscarClientePorCpfCnpj(
              dadosCliente.cpfCnpj,
            );

            if (clienteExistente && !clienteExistente.deleted) {
              clienteId = clienteExistente.id;
            } else {
              // Criar cliente
              const novoCliente = await AsaasService.criarCliente(dadosCliente);
              clienteId = novoCliente.id;
            }

            // Salvar ID do cliente para uso futuro
            await AsyncStorage.setItem('asaas_cliente_id', clienteId);
          } catch (error) {
            console.error('Erro ao processar cliente:', error);
            setLoading(false);
            Alert.alert(
              'Erro',
              'Não foi possível processar os dados do cliente. Tente novamente.',
            );
            onCancel?.();
            return;
          }
        }

        // Criar cobrança PIX
        const referencia = `APP-${Date.now()}`;
        const cobranca = await AsaasService.criarCobrancaPix(
          clienteId,
          valor,
          descricao,
          referencia,
        );

        // Salvar ID do pagamento
        setPagamentoId(cobranca.id);

        // Obter QR Code do PIX
        const qrCodePix = await AsaasService.obterQrCodePix(cobranca.id);
        setQrCodeData(qrCodePix.encodedImage);
        setCopiaCola(qrCodePix.payload);

        // Iniciar verificação de pagamento
        iniciarVerificacaoPagamento(cobranca.id);

        setLoading(false);
      } catch (error) {
        console.error('Erro ao processar pagamento PIX:', error);

        // Verificar se é um erro de cliente removido
        if (
          error.response?.data?.errors &&
          error.response.data.errors.some(err =>
            err.description?.includes('cliente removido'),
          )
        ) {
          // Se for erro de cliente removido, limpar o ID armazenado e sugerir tentar novamente
          await AsyncStorage.removeItem('asaas_cliente_id');
          Alert.alert(
            'Erro',
            'O cliente associado foi removido. Por favor, tente novamente.',
            [
              {
                text: 'Tentar Novamente',
                onPress: iniciarPagamento,
              },
              {
                text: 'Cancelar',
                onPress: onCancel,
                style: 'cancel',
              },
            ],
          );
        } else {
          Alert.alert(
            'Erro',
            'Não foi possível gerar o QR Code do PIX. Tente novamente.',
          );
          onCancel?.();
        }
      }
    };

    iniciarPagamento();

    // Limpar intervalo quando o componente for desmontado
    return () => {
      if (intervaloRef) {
        clearInterval(intervaloRef);
      }
    };
  }, [valor, descricao]);

  // Verificar status do pagamento periodicamente
  const iniciarVerificacaoPagamento = id => {
    setStatusVerificacao('Aguardando pagamento...');

    const intervalo = setInterval(async () => {
      try {
        const status = await AsaasService.consultarPagamento(id);

        if (status.status === 'RECEIVED' || status.status === 'CONFIRMED') {
          // Pagamento confirmado
          setStatusVerificacao('Pagamento confirmado!');
          clearInterval(intervalo);
          onSuccess?.(status);
        } else if (status.status === 'PENDING') {
          // Ainda aguardando
          setStatusVerificacao('Aguardando pagamento...');
        } else if (
          status.status === 'CANCELLED' ||
          status.status === 'FAILED'
        ) {
          // Pagamento cancelado ou falhou
          setStatusVerificacao('Pagamento cancelado ou falhou');
          clearInterval(intervalo);
          onCancel?.();
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 5000); // Verificar a cada 5 segundos

    // Guardar referência do intervalo para limpar depois
    setIntervaloRef(intervalo);

    // Limpar intervalo após 10 minutos (tempo máximo de espera)
    setTimeout(() => {
      clearInterval(intervalo);
      if (statusVerificacao === 'Aguardando pagamento...') {
        setStatusVerificacao('Tempo esgotado. Verifique seu app de banco.');
      }
    }, 10 * 60 * 1000);
  };

  // Compartilhar código PIX
  const compartilharPix = async () => {
    try {
      await Share.share({
        message: `PIX para pagamento: ${copiaCola}`,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o código PIX');
    }
  };

  // Copiar código PIX
  const copiarPix = async () => {
    try {
      await Clipboard.setString(copiaCola);
      Alert.alert('Sucesso', 'Código PIX copiado para a área de transferência');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível copiar o código PIX');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text style={styles.loadingText}>Gerando QR Code PIX...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamento via PIX</Text>
      <Text style={styles.subtitle}>
        Escaneie o QR Code abaixo com o app do seu banco
      </Text>

      <View style={styles.qrContainer}>
        {qrCodeData ? (
          <QRCode
            value={copiaCola}
            size={200}
            backgroundColor="white"
            color="black"
          />
        ) : (
          <Text style={styles.errorText}>Erro ao gerar QR Code</Text>
        )}
      </View>

      <Text style={styles.statusText}>{statusVerificacao}</Text>

      <TouchableOpacity style={styles.button} onPress={copiarPix}>
        <Text style={styles.buttonText}>Copiar código PIX</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={compartilharPix}>
        <Text style={styles.buttonText}>Compartilhar PIX</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00AEEF',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00AEEF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default PixPayment;
