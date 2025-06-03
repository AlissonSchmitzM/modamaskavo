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

  // Processar pagamento
  const processarPagamento = async () => {
    // Validar campos
    if (!validarFormulario()) {
      return;
    }

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
          //console.error('Erro ao processar cliente:', error);
          setLoading(false);
          toastr.showToast(
            'Não foi possível processar os dados do cliente. Tente novamente.',
            ERROR,
          );
          return;
        }
      }

      // Dados do cartão
      const dadosCartao = {
        titular: titular,
        numero: numeroCartao,
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

      // Criar cobrança com cartão
      const referencia = `APP-${Date.now()}`;
      const cobranca = await AsaasService.criarCobrancaCartao(
        clienteId,
        parseFloat(String(valor).replace(/\./g, '').replace(',', '.')),
        descricao,
        referencia,
        dadosCartao,
        parseInt(parcelas),
      );

      setLoading(false);
      console.log('cobranca', cobranca);

      // Verificar resultado
      if (cobranca.status === 'CONFIRMED' || cobranca.status === 'RECEIVED') {
        toastr.showToast('Pagamento aprovado com sucesso!', SUCCESS, 3000);
        NavigatorService.goBack();
        onSuccess?.();
      } else if (cobranca.status === 'PENDING') {
        toastr.showToast(
          'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.',
          INFO,
        );
        onSuccess?.();
      } else {
        toastr.showToast(
          `Não foi possível processar o pagamento. Status: ${cobranca.status}`,
          ERROR,
        );
        onCancel?.();
      }
    } catch (error) {
      console.log('error', error);
      setLoading(false);
      toastr.showToast(
        `Erro ao processar pagamento com cartão: ${error}`,
        ERROR,
      );

      // Verificar tipos específicos de erro de cartão
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        // Verificar erro de cliente removido
        if (errors.some(err => err.description?.includes('cliente removido'))) {
          await AsyncStorage.removeItem('asaas_cliente_id');
          Alert.alert(
            'Erro',
            'O cliente associado foi removido. Por favor, tente novamente.',
            [
              {
                text: 'Tentar Novamente',
                onPress: () => processarPagamento(),
              },
              {
                text: 'Cancelar',
                onPress: onCancel,
                style: 'cancel',
              },
            ],
          );
          return;
        }
        console.log('errors', errors);

        errors.some(err => console.log('err.code', err.code));

        // Verificar erros específicos de cartão
        if (
          errors.some(
            err =>
              err.code === 'invalid_creditCard' ||
              err.code === 'insufficient_funds' ||
              err.description?.includes('saldo insuficiente'),
          )
        ) {
          toastr.showToast(
            'Saldo insuficiente no cartão. Tente outro cartão ou forma de pagamento.',
            ERROR,
          );

          /*Alert.alert('Erro no Pagamento', errors[0].description, [
            {text: 'OK', onPress: () => console.log('OK Pressionado')},
          ]);*/
          return;
        }

        if (
          errors.some(
            err =>
              err.code === 'expired_card' ||
              err.description?.includes('expirado') ||
              err.description?.includes('vencido'),
          )
        ) {
          toastr.showToast(
            'Cartão expirado. Verifique a data de validade ou use outro cartão.',
            ERROR,
          );
          return;
        }

        if (
          errors.some(
            err =>
              err.code === 'blocked_card' ||
              err.description?.includes('bloqueado'),
          )
        ) {
          toastr.showToast(
            'Cartão bloqueado. Entre em contato com seu banco ou use outro cartão.',
            ERROR,
          );
          return;
        }

        if (
          errors.some(
            err =>
              err.description?.includes('inválido') ||
              err.description?.includes('invalido'),
          )
        ) {
          toastr.showToast(
            'Número de cartão inválido. Verifique os dados e tente novamente.',
            ERROR,
          );
          return;
        }

        // Mostrar o primeiro erro se nenhum dos casos específicos foi identificado
        toastr.showToast(
          errors[0].description || 'Erro ao processar o pagamento.',
          ERROR,
        );
        return;
      }

      // Erro genérico
      toastr.showToast(
        'Não foi possível processar o pagamento. Verifique os dados e tente novamente.',
        ERROR,
      );
    }
  };

  // Validar formulário
  const validarFormulario = () => {
    if (numeroCartao.replace(/\s/g, '').length < 16) {
      toastr.showToast('Número de cartão inválido', ERROR);
      return false;
    }

    if (titular.length < 3) {
      toastr.showToast('Nome do titular inválido', ERROR);
      return false;
    }

    if (
      mesExpiracao.length !== 2 ||
      parseInt(mesExpiracao) < 1 ||
      parseInt(mesExpiracao) > 12
    ) {
      toastr.showToast('Mês de expiração inválido', ERROR);
      return false;
    }

    if (
      anoExpiracao.length !== 4 ||
      parseInt(anoExpiracao) < new Date().getFullYear()
    ) {
      toastr.showToast('Ano de expiração inválido', ERROR);
      return false;
    }

    if (cvv.length < 3) {
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
      return []; // Retorna array vazio ou trata o erro como preferir
    }
    const opcoes = [];
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
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: '#f5f5f5', marginBottom: 40}}
      edges={['bottom', 'left', 'right']}>
      <KeyboardAwareScrollView
        style={{flex: 1}}
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
                  // 16 dígitos + 3 espaços
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
              returnKeyType="go"
              label="CPF do Titular"
              placeholder="000.000.000-00"
              style={styles.input}
              value={cpf}
              onChangeText={text => setCpf(formatarCPF(text))}
              keyboardType="numeric"
              maxLength={14}
              mode="outlined"
              theme={{
                colors: {primary: '#000000', onSurfaceVariant: '#999999'},
              }}
            />

            <Text style={styles.label}>Selecione o número de parcelas:</Text>
            <View style={styles.parcelasContainer}>{opcoesParcelamento()}</View>
          </View>

          <Button
            mode="contained"
            style={styles.payButton}
            textColor="#FFF"
            onPress={processarPagamento}>
            Finalizar Pagamento
          </Button>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default CardPayment;
