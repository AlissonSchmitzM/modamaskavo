import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Clipboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsaasService from '../services/AsaasService';

const CardPayment = ({valor, descricao, onSuccess, onCancel}) => {
  // Estados para os campos do formulário
  const [numeroCartao, setNumeroCartao] = useState('');
  const [titular, setTitular] = useState('');
  const [mesExpiracao, setMesExpiracao] = useState('');
  const [anoExpiracao, setAnoExpiracao] = useState('');
  const [cvv, setCvv] = useState('');
  const [cpf, setCpf] = useState('');
  const [parcelas, setParcelas] = useState('1');
  const [loading, setLoading] = useState(false);

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
        // Dados do cliente - em uma aplicação real, você obteria esses dados do usuário
        const dadosCliente = {
          nome: titular,
          email: 'cliente@exemplo.com',
          telefone: '11999999999',
          cpfCnpj: cpf.replace(/[^\d]/g, ''), // Remover formatação
          cep: '01001000',
          endereco: 'Rua Exemplo',
          numero: '123',
          complemento: 'Apto 45',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
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
        email: 'cliente@exemplo.com',
        telefone: '11999999999',
        cep: '01001000',
        numeroEndereco: '123',
        complemento: 'Apto 45',
      };

      // Criar cobrança com cartão
      const referencia = `APP-${Date.now()}`;
      const cobranca = await AsaasService.criarCobrancaCartao(
        clienteId,
        valor,
        descricao,
        referencia,
        dadosCartao,
        parseInt(parcelas),
      );

      setLoading(false);

      // Verificar resultado
      if (cobranca.status === 'CONFIRMED' || cobranca.status === 'RECEIVED') {
        Alert.alert('Sucesso', 'Pagamento aprovado com sucesso!');
        onSuccess?.(cobranca);
      } else if (cobranca.status === 'PENDING') {
        Alert.alert(
          'Processando',
          'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.',
        );
        onSuccess?.(cobranca);
      } else {
        Alert.alert(
          'Erro',
          `Não foi possível processar o pagamento. Status: ${cobranca.status}`,
        );
        onCancel?.();
      }
    } catch (error) {
      setLoading(false);
      console.error('Erro ao processar pagamento com cartão:', error);

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

        // Verificar erros específicos de cartão
        if (
          errors.some(
            err =>
              err.code === 'invalid_creditCard' ||
              err.code === 'insufficient_funds' ||
              err.description?.includes('saldo insuficiente'),
          )
        ) {
          Alert.alert(
            'Erro',
            'Saldo insuficiente no cartão. Tente outro cartão ou forma de pagamento.',
          );
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
          Alert.alert(
            'Erro',
            'Cartão expirado. Verifique a data de validade ou use outro cartão.',
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
          Alert.alert(
            'Erro',
            'Cartão bloqueado. Entre em contato com seu banco ou use outro cartão.',
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
          Alert.alert(
            'Erro',
            'Número de cartão inválido. Verifique os dados e tente novamente.',
          );
          return;
        }

        // Mostrar o primeiro erro se nenhum dos casos específicos foi identificado
        Alert.alert(
          'Erro',
          errors[0].description || 'Erro ao processar o pagamento.',
        );
        return;
      }

      // Erro genérico
      Alert.alert(
        'Erro',
        'Não foi possível processar o pagamento. Verifique os dados e tente novamente.',
      );
    }
  };

  // Validar formulário
  const validarFormulario = () => {
    if (numeroCartao.replace(/\s/g, '').length < 16) {
      Alert.alert('Erro', 'Número de cartão inválido');
      return false;
    }

    if (titular.length < 3) {
      Alert.alert('Erro', 'Nome do titular inválido');
      return false;
    }

    if (
      mesExpiracao.length !== 2 ||
      parseInt(mesExpiracao) < 1 ||
      parseInt(mesExpiracao) > 12
    ) {
      Alert.alert('Erro', 'Mês de expiração inválido');
      return false;
    }

    if (
      anoExpiracao.length !== 4 ||
      parseInt(anoExpiracao) < new Date().getFullYear()
    ) {
      Alert.alert('Erro', 'Ano de expiração inválido');
      return false;
    }

    if (cvv.length < 3) {
      Alert.alert('Erro', 'Código de segurança inválido');
      return false;
    }

    if (cpf.replace(/[^\d]/g, '').length !== 11) {
      Alert.alert('Erro', 'CPF inválido');
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
    const opcoes = [];
    const maxParcelas = valor >= 100 ? 12 : valor >= 50 ? 6 : 3;

    for (let i = 1; i <= maxParcelas; i++) {
      const valorParcela = (valor / i).toFixed(2);
      opcoes.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.parcelaOption,
            parcelas === i.toString() ? styles.parcelaSelected : null,
          ]}
          onPress={() => setParcelas(i.toString())}>
          <Text style={styles.parcelaText}>
            {i}x de R$ {valorParcela}
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
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pagamento com Cartão</Text>
      <Text style={styles.subtitle}>Valor: R$ {valor.toFixed(2)}</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Número do Cartão</Text>
        <TextInput
          style={styles.input}
          placeholder="0000 0000 0000 0000"
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
        />

        <Text style={styles.label}>Nome do Titular</Text>
        <TextInput
          style={styles.input}
          placeholder="Como está no cartão"
          value={titular}
          onChangeText={setTitular}
          autoCapitalize="characters"
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Mês</Text>
            <TextInput
              style={styles.input}
              placeholder="MM"
              value={mesExpiracao}
              onChangeText={text => {
                const numerico = text.replace(/[^\d]/g, '');
                if (numerico.length <= 2) {
                  setMesExpiracao(numerico);
                }
              }}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          <View style={styles.halfInput}>
            <Text style={styles.label}>Ano</Text>
            <TextInput
              style={styles.input}
              placeholder="AAAA"
              value={anoExpiracao}
              onChangeText={text => {
                const numerico = text.replace(/[^\d]/g, '');
                if (numerico.length <= 4) {
                  setAnoExpiracao(numerico);
                }
              }}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>

        <Text style={styles.label}>Código de Segurança (CVV)</Text>
        <TextInput
          style={styles.input}
          placeholder="123"
          value={cvv}
          onChangeText={text => {
            const numerico = text.replace(/[^\d]/g, '');
            if (numerico.length <= 4) {
              setCvv(numerico);
            }
          }}
          keyboardType="numeric"
          maxLength={4}
        />

        <Text style={styles.label}>CPF do Titular</Text>
        <TextInput
          style={styles.input}
          placeholder="000.000.000-00"
          value={cpf}
          onChangeText={text => setCpf(formatarCPF(text))}
          keyboardType="numeric"
          maxLength={14}
        />

        <Text style={styles.label}>Selecione o número de parcelas:</Text>
        <View style={styles.parcelasContainer}>{opcoesParcelamento()}</View>
      </View>

      <TouchableOpacity style={styles.payButton} onPress={processarPagamento}>
        <Text style={styles.payButtonText}>Finalizar Pagamento</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#00AEEF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  parcelasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  parcelaOption: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    margin: 5,
    minWidth: '45%',
  },
  parcelaSelected: {
    backgroundColor: '#e0f7ff',
    borderColor: '#00AEEF',
  },
  parcelaText: {
    fontSize: 14,
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: '#00AEEF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default CardPayment;
