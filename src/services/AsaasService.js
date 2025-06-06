import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import toastr, {ERROR} from './toastr';
import store from '../store';

// URLs base da API
const BASE_URLS = {
  sandbox: 'https://sandbox.asaas.com/api/v3',
  producao: 'https://www.asaas.com/api/v3',
};

// Função para obter configurações atualizadas do Redux store
const getConfig = () => {
  const state = store.getState();
  const ambiente = state.configReducer.environment || 'sandbox';

  const API_KEYS = {
    sandbox: state.configReducer.key_api_sandbox,
    producao: state.configReducer.key_api_prod,
  };

  return {
    ambiente,
    apiKey: API_KEYS[ambiente],
    baseUrl: BASE_URLS[ambiente],
  };
};

// Função para criar uma instância atualizada do axios
const createApi = () => {
  const {ambiente, apiKey, baseUrl} = getConfig();

  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      access_token: apiKey,
    },
  });
};

// --- Helper function to generate token storage key ---
const getTokenStorageKey = (
  customerId,
  cardNumber,
  expiryMonth,
  expiryYear,
) => {
  const last4 = String(cardNumber).replace(/\D/g, '').slice(-4);
  return `asaas_token_${customerId}_${last4}_${expiryMonth}${expiryYear}`;
};

export default {
  // Criar um cliente no Asaas (necessário antes de criar cobranças)
  async criarCliente(dados) {
    try {
      const api = createApi(); // Criar instância atualizada
      const response = await api.post('/customers', {
        name: dados.nome,
        email: dados.email,
        phone: dados.telefone,
        cpfCnpj: dados.cpfCnpj,
        postalCode: dados.cep,
        address: dados.endereco,
        addressNumber: dados.numero,
        complement: dados.complemento,
        province: dados.bairro,
        city: dados.cidade,
        state: dados.estado,
      });
      return response.data;
    } catch (error) {
      toastr.showToast(
        'Erro ao criar cliente. Por favor, tente novamente.',
        ERROR,
      );
      throw error;
    }
  },

  // Buscar cliente por CPF/CNPJ (para evitar duplicação)
  async buscarClientePorCpfCnpj(cpfCnpj) {
    try {
      const api = createApi(); // Criar instância atualizada
      const response = await api.get(`/customers?cpfCnpj=${cpfCnpj}`);
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0];
      }
      return null;
    } catch (error) {
      // Don't show toast here, let the calling function handle it
      // toastr.showToast(
      //   'Erro ao buscar cliente. Por favor, tente novamente.',
      //   ERROR,
      // );
      console.error('Erro ao buscar cliente por CPF/CNPJ:', error);
      throw error;
    }
  },

  // Criar cobrança PIX
  async criarCobrancaPix(clienteId, valor, descricao, referencia) {
    try {
      const dataVencimento = this.obterDataVencimento(1); // 1 dia à frente

      const api = createApi(); // Criar instância atualizada
      const response = await api.post('/payments', {
        customer: clienteId,
        billingType: 'PIX',
        value: valor,
        dueDate: dataVencimento,
        description: descricao,
        externalReference: referencia,
        postalService: false,
      });
      return response.data;
    } catch (error) {
      toastr.showToast(
        'Erro ao criar cobrança PIX. Por favor, tente novamente.',
        ERROR,
      );
      throw error;
    }
  },

  // Criar cobrança Cartão de Crédito (Tokeniza e Paga)
  async criarCobrancaCartao(
    clienteId,
    valor,
    descricao,
    referencia,
    cartao,
    parcelas = 1,
  ) {
    let creditCardToken = null; // Variable to store the token
    try {
      // Limpar o número do cartão de qualquer espaço ou caractere não numérico
      const numeroCartaoLimpo = cartao.numero.replace(/[^\d]/g, '');

      // Data de vencimento para cartão (hoje)
      const dataVencimento = this.obterDataVencimento(0);

      const api = createApi(); // Criar instância atualizada

      // Primeiro, tokenizar o cartão
      const tokenResponse = await api.post('/creditCard/tokenize', {
        customer: clienteId,
        creditCard: {
          holderName: cartao.titular,
          number: numeroCartaoLimpo,
          expiryMonth: cartao.mesExpiracao,
          expiryYear: cartao.anoExpiracao,
          ccv: cartao.cvv,
        },
      });

      creditCardToken = tokenResponse.data.creditCardToken; // Store the token

      // Depois, criar a cobrança com o token do cartão
      const response = await api.post('/payments', {
        customer: clienteId,
        billingType: 'CREDIT_CARD',
        dueDate: dataVencimento,
        value: valor,
        description: descricao,
        externalReference: referencia,
        installmentCount: parcelas,
        installmentValue: (valor / parcelas).toFixed(2),
        creditCardToken: creditCardToken, // Use the obtained token
        creditCardHolderInfo: {
          name: cartao.titular,
          email: cartao.email || 'cliente@exemplo.com',
          cpfCnpj: cartao.cpfCnpj,
          postalCode: cartao.cep || '01001000',
          addressNumber: cartao.numeroEndereco || '123',
          addressComplement: cartao.complemento || 'Apto 45',
          phone: cartao.telefone || '11999999999',
        },
      });

      // Return both payment data and the token
      return {...response.data, creditCardToken: creditCardToken};
    } catch (error) {
      // Handle specific Asaas errors if possible
      if (error.response && error.response.data && error.response.data.errors) {
        console.error(
          'Asaas API Error (Tokenize/Pay):',
          error.response.data.errors,
        );
        // You might want to throw a more specific error here based on error.response.data.errors[0].code
        // e.g., throw new Error(error.response.data.errors[0].description);
      }
      // Rethrow the error to be caught by the calling function
      throw error;
    }
  },

  // --- NEW FUNCTION: Create payment using an existing token ---
  async criarCobrancaComToken(
    clienteId,
    valor,
    descricao,
    referencia,
    creditCardToken, // Existing token
    cartaoInfoTitular, // Only holder info needed
    parcelas = 1,
  ) {
    try {
      const dataVencimento = this.obterDataVencimento(0);
      const api = createApi();

      const response = await api.post('/payments', {
        customer: clienteId,
        billingType: 'CREDIT_CARD',
        dueDate: dataVencimento,
        value: valor,
        description: descricao,
        externalReference: referencia,
        installmentCount: parcelas,
        installmentValue: (valor / parcelas).toFixed(2),
        creditCardToken: creditCardToken, // Use the existing token
        creditCardHolderInfo: {
          name: cartaoInfoTitular.titular,
          email: cartaoInfoTitular.email || 'cliente@exemplo.com',
          cpfCnpj: cartaoInfoTitular.cpfCnpj,
          postalCode: cartaoInfoTitular.cep || '01001000',
          addressNumber: cartaoInfoTitular.numeroEndereco || '123',
          addressComplement: cartaoInfoTitular.complemento || 'Apto 45',
          phone: cartaoInfoTitular.telefone || '11999999999',
        },
      });

      // Return only payment data (token already exists)
      return response.data;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        console.error(
          'Asaas API Error (Pay with Token):',
          error.response.data.errors,
        );
        // Check if the error is related to the token itself (e.g., expired, invalid)
        if (
          error.response.data.errors.some(
            e =>
              e.code === 'invalid_creditCardToken' ||
              e.code === 'expired_creditCardToken',
          )
        ) {
          // If token is invalid/expired, throw a specific error to trigger re-tokenization
          throw new Error('invalid_token');
        }
      }
      // Rethrow other errors
      throw error;
    }
  },

  // Obter QR Code do PIX
  async obterQrCodePix(pagamentoId) {
    try {
      const api = createApi(); // Criar instância atualizada
      const response = await api.get(`/payments/${pagamentoId}/pixQrCode`);
      return response.data;
    } catch (error) {
      toastr.showToast(
        'Erro ao obter QR Code PIX. Por favor, tente novamente.',
        ERROR,
      );
      throw error;
    }
  },

  // Consultar status de um pagamento
  async consultarPagamento(pagamentoId) {
    try {
      const api = createApi(); // Criar instância atualizada
      const response = await api.get(`/payments/${pagamentoId}`);
      return response.data;
    } catch (error) {
      toastr.showToast(
        'Erro ao consultar pagamento. Por favor, tente novamente.',
        ERROR,
      );
      throw error;
    }
  },

  // Função auxiliar para obter data de vencimento
  obterDataVencimento(diasAdicionais = 0) {
    const data = new Date();
    data.setDate(data.getDate() + diasAdicionais);

    // Formatar data no formato YYYY-MM-DD
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  },

  // Verificar se cliente existe e está ativo
  async verificarCliente(clienteId) {
    try {
      const api = createApi(); // Criar instância atualizada
      const response = await api.get(`/customers/${clienteId}`);
      // Se não der erro e o cliente não estiver removido, ele existe
      return response.data && response.data.deleted !== true;
    } catch (error) {
      // Se retornar 404, o cliente não existe mais
      if (error.response && error.response.status === 404) {
        return false;
      }
      // Don't show toast here
      // toastr.showToast(
      //   'Erro ao verificar cliente. Por favor, tente novamente.',
      //   ERROR,
      // );
      console.error('Erro ao verificar cliente:', error);
      throw error;
    }
  },

  // --- Token Management --- (Optional: Could be in a separate service)
  async saveToken(customerId, cardNumber, expiryMonth, expiryYear, token) {
    const key = getTokenStorageKey(
      customerId,
      cardNumber,
      expiryMonth,
      expiryYear,
    );
    try {
      await AsyncStorage.setItem(key, token);
    } catch (e) {
      console.error('Failed to save token to AsyncStorage:', e);
    }
  },

  async getToken(customerId, cardNumber, expiryMonth, expiryYear) {
    const key = getTokenStorageKey(
      customerId,
      cardNumber,
      expiryMonth,
      expiryYear,
    );
    try {
      const token = await AsyncStorage.getItem(key);
      return token;
    } catch (e) {
      console.error('Failed to get token from AsyncStorage:', e);
      return null;
    }
  },

  async removeToken(customerId, cardNumber, expiryMonth, expiryYear) {
    const key = getTokenStorageKey(
      customerId,
      cardNumber,
      expiryMonth,
      expiryYear,
    );
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to remove token from AsyncStorage:', e);
    }
  },
};
