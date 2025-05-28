import axios from 'axios';
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
      toastr.showToast(
        'Erro ao buscar cliente. Por favor, tente novamente.',
        ERROR,
      );
      throw error;
    }
  },

  // Criar cobrança PIX
  async criarCobrancaPix(clienteId, valor, descricao, referencia) {
    try {
      const dataVencimento = this.obterDataVencimento(1); // 1 dia à frente
      console.log('Data de vencimento para PIX:', dataVencimento);

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

  // Criar cobrança Cartão de Crédito
  async criarCobrancaCartao(
    clienteId,
    valor,
    descricao,
    referencia,
    cartao,
    parcelas = 1,
  ) {
    try {
      // Limpar o número do cartão de qualquer espaço ou caractere não numérico
      const numeroCartaoLimpo = cartao.numero.replace(/[^\d]/g, '');

      console.log('Número do cartão (limpo):', numeroCartaoLimpo);

      // Data de vencimento para cartão (hoje)
      const dataVencimento = this.obterDataVencimento(0);
      console.log('Data de vencimento para cartão:', dataVencimento);

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

      console.log(
        'Token gerado com sucesso:',
        tokenResponse.data.creditCardToken,
      );

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
        creditCardToken: tokenResponse.data.creditCardToken,
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

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        toastr.showToast(
          'Saldo insuficiente no cartão. Tente outro cartão ou forma de pagamento.',
          ERROR,
        );
      } else {
        toastr.showToast(
          'Erro ao processar pagamento. Por favor, tente novamente.',
          ERROR,
        );
      }
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
      toastr.showToast(
        'Erro ao verificar cliente. Por favor, tente novamente.',
        ERROR,
      );
      throw error;
    }
  },
};
