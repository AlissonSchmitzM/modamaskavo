import axios from 'axios';

// Ambiente: 'sandbox' ou 'producao'
const AMBIENTE = 'sandbox';

// Configure suas chaves de API
const API_KEYS = {
  sandbox:
    '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjY1NTU3NzNhLTNkNmMtNGY1YS05ZDdhLWU2NWMzZGJlOTZhNzo6JGFhY2hfMmY0NWE4MDQtNGM0MS00ODFlLTk2ZGMtMjhkMGFmMjVkZWEz',
  producao:
    '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjM0MzYxODY0LWE0NGQtNDc5NC05ZGVmLTE5ZThiN2YyYjRhNjo6JGFhY2hfOTc5ODZkMjMtYmRlMy00NzVjLTk2ZTktZDg3MWVhZTUwYzg1',
};

// URLs base da API
const BASE_URLS = {
  sandbox: 'https://sandbox.asaas.com/api/v3',
  producao: 'https://www.asaas.com/api/v3',
};

const api = axios.create({
  baseURL: BASE_URLS[AMBIENTE],
  headers: {
    'Content-Type': 'application/json',
    access_token: API_KEYS[AMBIENTE],
  },
});

export default {
  // Criar um cliente no Asaas (necessário antes de criar cobranças)
  async criarCliente(dados) {
    try {
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
      console.error('Erro ao criar cliente:', error.response?.data || error);
      throw error;
    }
  },

  // Buscar cliente por CPF/CNPJ (para evitar duplicação)
  async buscarClientePorCpfCnpj(cpfCnpj) {
    try {
      const response = await api.get(`/customers?cpfCnpj=${cpfCnpj}`);
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0];
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error.response?.data || error);
      throw error;
    }
  },

  // Criar cobrança PIX
  async criarCobrancaPix(clienteId, valor, descricao, referencia) {
    try {
      const dataVencimento = this.obterDataVencimento(1); // 1 dia à frente
      console.log('Data de vencimento para PIX:', dataVencimento);

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
      console.error(
        'Erro ao criar cobrança PIX:',
        error.response?.data || error,
      );
      throw error;
    }
  },

  // Criar cobrança Cartão de Crédito
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
        creditCardToken: tokenResponse.data.creditCardToken, // ALTERAÇÃO AQUI - Movido para fora do objeto creditCard
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
      console.error('Erro ao criar cobrança com cartão:');

      if (error.response && error.response.data) {
        console.error('Detalhes do erro:', JSON.stringify(error.response.data));
      } else {
        console.error(error);
      }

      throw error;
    }
  },

  // Obter QR Code do PIX
  async obterQrCodePix(pagamentoId) {
    try {
      const response = await api.get(`/payments/${pagamentoId}/pixQrCode`);
      return response.data;
    } catch (error) {
      console.error(
        'Erro ao obter QR Code PIX:',
        error.response?.data || error,
      );
      throw error;
    }
  },

  // Consultar status de um pagamento
  async consultarPagamento(pagamentoId) {
    try {
      const response = await api.get(`/payments/${pagamentoId}`);
      return response.data;
    } catch (error) {
      console.error(
        'Erro ao consultar pagamento:',
        error.response?.data || error,
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
      const response = await api.get(`/customers/${clienteId}`);
      // Se não der erro e o cliente não estiver removido, ele existe
      return response.data && response.data.deleted !== true;
    } catch (error) {
      // Se retornar 404, o cliente não existe mais
      if (error.response && error.response.status === 404) {
        return false;
      }
      console.error(
        'Erro ao verificar cliente:',
        error.response?.data || error,
      );
      throw error;
    }
  },
};
