import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import the adjusted service
import AsaasService from '../../../../services/AsaasService';
import toastr, {
  ERROR,
  INFO,
  SUCCESS,
  toastConfig,
} from '../../../../services/toastr';
import Toast from 'react-native-toast-message';
import NavigatorService from '../../../../services/NavigatorService';
import {Button, TextInput} from 'react-native-paper';
import LottieView from 'lottie-react-native';
import {payment_process} from '../../../../assets';
import styles from './Styles';

const CardPayment = ({valor, descricao, onSuccess, onCancel, dadosCliente}) => {
  // Estados para os campos do formulário
  const [numeroCartao, setNumeroCartao] = useState('');
  const [titular, setTitular] = useState('');
  const [mesExpiracao, setMesExpiracao] = useState('');
  const [anoExpiracao, setAnoExpiracao] = useState('');
  const [cvv, setCvv] = useState('');
  const [cpf, setCpf] = useState('');
  const [parcelas, setParcelas] = useState('1');
  const [loading, setLoading] = useState(false);

  const titularRef = useRef(null);
  const mesExpiracaoRef = useRef(null);
  const anoExpiracaoRef = useRef(null);
  const cvvRef = useRef(null);
  const cpfRef = useRef(null);

  // Formatar número do cartão com espaços a cada 4 dígitos
  const formatarNumeroCartao = texto => {
    const numeroLimpo = texto.replace(/\s/g, '');
    const grupos = [];

    for (let i = 0; i < numeroLimpo.length; i += 4) {
      grupos.push(numeroLimpo.slice(i, i + 4));
    }

    return grupos.join(' ');
  };

  // --- Processar pagamento com lógica de reutilização de token ---
  const processarPagamento = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    let clienteId = null;
    let cobranca = null;
    let attemptTokenization = true; // Flag to control if we should try tokenizing

    try {
      // 1. Obter ou criar Cliente Asaas
      clienteId = await obterOuCriarClienteAsaas();
      if (!clienteId) {
        // Error handled inside obterOuCriarClienteAsaas
        setLoading(false);
        return;
      }

      // 2. Tentar buscar token existente
      const existingToken = await AsaasService.getToken(
        clienteId,
        numeroCartao,
        mesExpiracao,
        anoExpiracao,
      );

      // 3. Se token existir, tentar pagar com ele
      if (existingToken) {
        console.log('Token encontrado, tentando pagamento com token...');
        attemptTokenization = false; // Don't tokenize if we have a token
        try {
          const cartaoInfoTitular = {
            titular: titular,
            cpfCnpj: cpf.replace(/[^\d]/g, ''),
            email: dadosCliente.email,
            telefone: dadosCliente.telefone,
            cep: dadosCliente.cep,
            numeroEndereco: dadosCliente.numero,
            complemento: dadosCliente.complemento,
          };

          cobranca = await AsaasService.criarCobrancaComToken(
            clienteId,
            parseFloat(String(valor).replace(/\./g, '').replace(',', '.')),
            descricao,
            `APP-${Date.now()}`,
            existingToken,
            cartaoInfoTitular,
            parseInt(parcelas),
          );
          console.log('Pagamento com token existente:', cobranca);
        } catch (tokenError) {
          console.warn('Erro ao pagar com token existente:', tokenError);
          // Se o erro for token inválido/expirado, remove o token e tenta tokenizar novamente
          if (tokenError.message === 'invalid_token') {
            console.log(
              'Token inválido ou expirado, removendo e tentando tokenizar...',
            );
            await AsaasService.removeToken(
              clienteId,
              numeroCartao,
              mesExpiracao,
              anoExpiracao,
            );
            attemptTokenization = true; // Force tokenization attempt
          } else {
            // Outro erro ao pagar com token, tratar como erro geral
            throw tokenError;
          }
        }
      }

      // 4. Se não havia token ou o pagamento com token falhou (e precisa tokenizar)
      if (attemptTokenization) {
        console.log(
          'Token não encontrado ou inválido, tentando tokenizar e pagar...',
        );
        const dadosCartao = {
          titular: titular,
          numero: numeroCartao, // Service will clean it
          mesExpiracao: mesExpiracao,
          anoExpiracao: anoExpiracao,
          cvv: cvv,
          cpfCnpj: cpf.replace(/[^\d]/g, ''),
          email: dadosCliente.email,
          telefone: dadosCliente.telefone,
          cep: dadosCliente.cep,
          numeroEndereco: dadosCliente.numero,
          complemento: dadosCliente.complemento,
        };

        const resultadoCobranca = await AsaasService.criarCobrancaCartao(
          clienteId,
          parseFloat(String(valor).replace(/\./g, '').replace(',', '.')),
          descricao,
          `APP-${Date.now()}`,
          dadosCartao,
          parseInt(parcelas),
        );

        cobranca = resultadoCobranca; // Assign the payment result
        console.log('Pagamento com tokenização:', cobranca);

        // Se a cobrança foi criada (mesmo que PENDING), salva o token
        if (resultadoCobranca.creditCardToken) {
          await AsaasService.saveToken(
            clienteId,
            numeroCartao,
            mesExpiracao,
            anoExpiracao,
            resultadoCobranca.creditCardToken,
          );
        }
      }

      // 5. Processar resultado da cobrança (seja com token ou nova tokenização)
      setLoading(false);
      if (!cobranca) {
        // Should not happen if logic is correct, but as a safeguard
        throw new Error('Falha ao obter resultado da cobrança.');
      }

      if (cobranca.status === 'CONFIRMED' || cobranca.status === 'RECEIVED') {
        toastr.showToast('Pagamento aprovado com sucesso!', SUCCESS, 3000);
        NavigatorService.goBack();
        onSuccess?.();
      } else if (cobranca.status === 'PENDING') {
        toastr.showToast(
          'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.',
          INFO,
        );
        NavigatorService.goBack(); // Go back even if pending
        onSuccess?.(); // Consider success even if pending
      } else {
        // Handle other statuses like REJECTED, FAILED etc.
        toastr.showToast(
          `Pagamento não aprovado. Status: ${cobranca.status}`,
          ERROR,
        );
        onCancel?.();
      }
    } catch (error) {
      console.error('Erro GERAL no processarPagamento:', error);
      setLoading(false);
      handlePaymentError(error, clienteId); // Use helper function for error handling
    }
  };

  // --- Helper para obter/criar cliente Asaas ---
  const obterOuCriarClienteAsaas = async () => {
    let clienteId = await AsyncStorage.getItem('asaas_cliente_id');

    if (clienteId) {
      try {
        const clienteAtivo = await AsaasService.verificarCliente(clienteId);
        if (!clienteAtivo) {
          await AsyncStorage.removeItem('asaas_cliente_id');
          clienteId = null;
          console.log('Cliente Asaas removido, limpando ID local.');
        }
      } catch (error) {
        console.warn(
          'Erro ao verificar cliente Asaas, limpando ID local:',
          error,
        );
        await AsyncStorage.removeItem('asaas_cliente_id');
        clienteId = null;
      }
    }

    if (!clienteId) {
      console.log(
        'Cliente ID não encontrado ou inválido, tentando buscar/criar...',
      );
      try {
        const clienteExistente = await AsaasService.buscarClientePorCpfCnpj(
          dadosCliente.cpfCnpj,
        );

        if (clienteExistente && !clienteExistente.deleted) {
          clienteId = clienteExistente.id;
          console.log('Cliente encontrado por CPF/CNPJ:', clienteId);
        } else {
          console.log('Cliente não encontrado ou deletado, criando novo...');
          const novoCliente = await AsaasService.criarCliente(dadosCliente);
          clienteId = novoCliente.id;
          console.log('Novo cliente criado:', clienteId);
        }
        await AsyncStorage.setItem('asaas_cliente_id', clienteId);
      } catch (error) {
        console.error('Erro ao buscar/criar cliente Asaas:', error);
        toastr.showToast(
          'Não foi possível processar os dados do cliente. Tente novamente.',
          ERROR,
        );
        return null; // Indicate failure
      }
    }
    return clienteId;
  };

  // --- Helper para tratar erros de pagamento ---
  const handlePaymentError = async (error, clienteId) => {
    // Check for specific Asaas API errors
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const firstError = errors[0];
      console.error('Asaas Payment Error:', errors);

      // Specific card errors
      if (
        firstError.code === 'invalid_creditCard' ||
        firstError.description?.includes('inválido')
      ) {
        toastr.showToast(
          'Número de cartão inválido. Verifique os dados.',
          ERROR,
        );
      } else if (
        firstError.code === 'insufficient_funds' ||
        firstError.description?.includes('saldo insuficiente')
      ) {
        toastr.showToast('Saldo insuficiente no cartão.', ERROR);
      } else if (
        firstError.code === 'expired_card' ||
        firstError.description?.includes('expirado') ||
        firstError.description?.includes('vencido')
      ) {
        toastr.showToast('Cartão expirado.', ERROR);
      } else if (
        firstError.code === 'blocked_card' ||
        firstError.description?.includes('bloqueado')
      ) {
        toastr.showToast(
          'Cartão bloqueado. Entre em contato com seu banco.',
          ERROR,
        );
      } else if (
        firstError.code === 'invalid_creditCardToken' ||
        firstError.code === 'expired_creditCardToken'
      ) {
        // This case should ideally be handled by the retry logic, but show a generic message if it reaches here
        toastr.showToast(
          'Problema com o cartão salvo. Tente novamente.',
          ERROR,
        );
        // Optionally remove the bad token again here if needed
        if (clienteId) {
          await AsaasService.removeToken(
            clienteId,
            numeroCartao,
            mesExpiracao,
            anoExpiracao,
          );
        }
      } else if (firstError.description?.includes('cliente removido')) {
        await AsyncStorage.removeItem('asaas_cliente_id');
        Alert.alert(
          'Erro',
          'O cliente associado foi removido. Por favor, tente novamente.',
          [
            {text: 'Tentar Novamente', onPress: () => processarPagamento()},
            {text: 'Cancelar', onPress: onCancel, style: 'cancel'},
          ],
        );
      } else {
        // Show the first error description from Asaas
        toastr.showToast(firstError.description || 'Erro no pagamento.', ERROR);
      }
    } else {
      // Generic error (network issue, unexpected error)
      toastr.showToast(
        `Erro ao processar pagamento: ${error.message || 'Tente novamente.'}`,
        ERROR,
      );
    }
    onCancel?.(); // Call cancel callback on error
  };

  // Validar formulário
  const validarFormulario = () => {
    // Basic validations (keep them simple or enhance as needed)
    if (numeroCartao.replace(/\s/g, '').length < 13) {
      // Allow shorter numbers for some cards
      toastr.showToast('Número de cartão inválido', ERROR);
      return false;
    }
    if (titular.trim().length < 3) {
      toastr.showToast('Nome do titular inválido', ERROR);
      return false;
    }
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const expMonth = parseInt(mesExpiracao);
    const expYear = parseInt(anoExpiracao);
    if (!expMonth || expMonth < 1 || expMonth > 12) {
      toastr.showToast('Mês de expiração inválido', ERROR);
      return false;
    }
    if (
      !expYear ||
      expYear < currentYear ||
      (expYear === currentYear && expMonth < currentMonth)
    ) {
      toastr.showToast('Data de expiração inválida', ERROR);
      return false;
    }
    if (cvv.length < 3 || cvv.length > 4) {
      toastr.showToast('Código de segurança inválido', ERROR);
      return false;
    }
    if (cpf.replace(/[^\d]/g, '').length !== 11) {
      toastr.showToast('CPF inválido', ERROR);
      return false;
    }
    return true;
  };

  // Formatar CPF
  const formatarCPF = texto => {
    const cpfLimpo = texto.replace(/[^\d]/g, '');
    if (cpfLimpo.length <= 3) {
      return cpfLimpo;
    } else if (cpfLimpo.length <= 6) {
      return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3)}`;
    } else if (cpfLimpo.length <= 9) {
      return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(
        6,
      )}`;
    } else {
      return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(
        6,
        9,
      )}-${cpfLimpo.slice(9, 11)}`;
    }
  };

  // Opções de parcelas
  const opcoesParcelamento = () => {
    const valorNumerico = parseFloat(
      String(valor).replace(/\./g, '').replace(',', '.'),
    );
    if (isNaN(valorNumerico)) {
      return [];
    }
    const opcoes = [];
    // Define max installments based on value (example logic)
    const maxParcelas = valorNumerico >= 100 ? 12 : valorNumerico >= 50 ? 6 : 3;

    for (let i = 1; i <= maxParcelas; i++) {
      const valorParcela = valorNumerico / i;
      opcoes.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.parcelaOption,
            parcelas === i.toString() ? styles.parcelaSelected : null,
          ]}
          onPress={() => setParcelas(i.toString())}>
          <Text style={styles.parcelaText}>
            {i}x de R$ {valorParcela.toFixed(2).replace('.', ',')}
            {i === 1 ? ' (à vista)' : ''}
          </Text>
        </TouchableOpacity>,
      );
    }
    return opcoes;
  };

  // --- Renderização ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text style={styles.loadingText}>Processando pagamento...</Text>
        <LottieView
          source={payment_process}
          autoPlay
          loop
          style={{
            width: '80%',
            height: 350,
          }}
        />
        <Toast config={toastConfig} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: '#f5f5f5', marginBottom: 40}}
      edges={['bottom', 'left', 'right']}>
      <KeyboardAwareScrollView
        style={{flex: 1}}
        contentContainerStyle={{flexGrow: 1}} // Ensure content can grow
        extraScrollHeight={100}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Pagamento com Cartão</Text>
          <Text style={styles.subtitle}>Valor: R$ {valor}</Text>

          <View style={styles.formContainer}>
            <TextInput
              returnKeyType="next"
              onSubmitEditing={() => titularRef.current?.focus()}
              label="Número do Cartão"
              placeholder="0000 0000 0000 0000"
              style={styles.input}
              value={numeroCartao}
              onChangeText={text => {
                const formatted = formatarNumeroCartao(text);
                if (formatted.length <= 19) {
                  setNumeroCartao(formatted);
                }
              }}
              keyboardType="numeric"
              maxLength={19}
              mode="outlined"
              theme={{
                colors: {primary: '#000000', onSurfaceVariant: '#999999'},
              }}
            />

            <TextInput
              ref={titularRef}
              returnKeyType="next"
              onSubmitEditing={() => mesExpiracaoRef.current?.focus()}
              label="Nome do Titular"
              placeholder="Como está no cartão"
              style={styles.input}
              value={titular}
              onChangeText={setTitular}
              autoCapitalize="characters"
              mode="outlined"
              theme={{
                colors: {primary: '#000000', onSurfaceVariant: '#999999'},
              }}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <TextInput
                  ref={mesExpiracaoRef}
                  returnKeyType="next"
                  onSubmitEditing={() => anoExpiracaoRef.current?.focus()}
                  label="Mês"
                  placeholder="MM"
                  style={styles.input}
                  value={mesExpiracao}
                  onChangeText={text => {
                    const numerico = text.replace(/[^\d]/g, '');
                    if (numerico.length <= 2) {
                      setMesExpiracao(numerico);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                  mode="outlined"
                  theme={{
                    colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                  }}
                />
              </View>

              <View style={styles.halfInput}>
                <TextInput
                  ref={anoExpiracaoRef}
                  returnKeyType="next"
                  onSubmitEditing={() => cvvRef.current?.focus()}
                  label="Ano"
                  placeholder="AAAA"
                  style={styles.input}
                  value={anoExpiracao}
                  onChangeText={text => {
                    const numerico = text.replace(/[^\d]/g, '');
                    if (numerico.length <= 4) {
                      setAnoExpiracao(numerico);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={4}
                  mode="outlined"
                  theme={{
                    colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                  }}
                />
              </View>
            </View>

            <TextInput
              ref={cvvRef}
              returnKeyType="next"
              onSubmitEditing={() => cpfRef.current?.focus()}
              label="Código de Segurança (CVV)"
              placeholder="123"
              style={styles.input}
              value={cvv}
              onChangeText={text => {
                const numerico = text.replace(/[^\d]/g, '');
                if (numerico.length <= 4) {
                  setCvv(numerico);
                }
              }}
              keyboardType="numeric"
              maxLength={4}
              mode="outlined"
              theme={{
                colors: {primary: '#000000', onSurfaceVariant: '#999999'},
              }}
            />

            <TextInput
              ref={cpfRef}
              returnKeyType="done"
              label="CPF do Titular"
              placeholder="000.000.000-00"
              style={styles.input}
              value={cpf}
              onChangeText={text => {
                const formatted = formatarCPF(text);
                if (formatted.length <= 14) {
                  setCpf(formatted);
                }
              }}
              keyboardType="numeric"
              maxLength={14}
              mode="outlined"
              theme={{
                colors: {primary: '#000000', onSurfaceVariant: '#999999'},
              }}
            />
            <Text style={styles.parcelasTitle}>Opções de Parcelamento</Text>
            <View style={styles.parcelasContainer}>{opcoesParcelamento()}</View>
          </View>

          <Button
            mode="contained"
            style={styles.payButton}
            labelStyle={styles.payButtonText}
            onPress={processarPagamento}
            disabled={loading}
            icon="credit-card-check-outline">
            Pagar
          </Button>

          <Button
            mode="outlined"
            onPress={() => NavigatorService.goBack()}
            textColor="#000000"
            icon="close">
            Cancelar
          </Button>
        </ScrollView>
      </KeyboardAwareScrollView>
      <Toast config={toastConfig} />
    </SafeAreaView>
  );
};

export default CardPayment;
