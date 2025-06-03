import React, {useState, useEffect} from 'react';
import {View, Text, ActivityIndicator, Alert, Share} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsaasService from '../../../../services/AsaasService';
import toastr, {ERROR, SUCCESS, toastConfig} from '../../../../services/toastr';
import Toast from 'react-native-toast-message';
import {Button} from 'react-native-paper';
import NavigatorService from '../../../../services/NavigatorService';
import styles from './Styles';

const PixPayment = ({valor, descricao, onSuccess, onCancel, dadosCliente}) => {
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
            toastr.showToast('Erro ao carregar dados do cliente', ERROR);
            setLoading(false);
            onCancel?.();
            return;
          }
        }

        // Criar cobrança PIX
        const referencia = `APP-${Date.now()}`;
        const cobranca = await AsaasService.criarCobrancaPix(
          clienteId,
          parseFloat(String(valor).replace(/\./g, '').replace(',', '.')),
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
          toastr.showToast(
            'Não foi possível gerar o QR Code do PIX. Tente novamente.',
            ERROR,
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

          toastr.showToast('Pagamento aprovado com sucesso!', SUCCESS);
          await new Promise(r => setTimeout(r, 3000));
          NavigatorService.goBack();
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
      toastr.showToast('Não foi possível compartilhar o código PIX.', ERROR);
    }
  };

  // Copiar código PIX
  const copiarPix = () => {
    try {
      Clipboard.setString(copiaCola);
      /*toastr.showToast(
        'Código PIX copiado para a área de transferência',
        SUCCESS,
      );*/
    } catch (error) {
      toastr.showToast('Não foi possível copiar o código PIX' + error, ERROR);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text style={styles.loadingText}>Gerando QR Code PIX...</Text>
        <Toast config={toastConfig} />
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

      <Button
        mode="contained"
        style={styles.button}
        textColor="#FFF"
        onPress={copiarPix}>
        Copiar código PIX
      </Button>

      <Button
        mode="contained"
        style={[styles.button, {marginBottom: 30}]}
        textColor="#FFF"
        onPress={compartilharPix}>
        Compartilhar PIX
      </Button>
    </View>
  );
};

export default PixPayment;
