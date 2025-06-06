import store from '../store';

const API_BASE_URL = 'https://api.superfrete.com/api/v0';

const ORIGEM_CEP = '88310050';
const PACOTE_PESO_KG = 0.3; // 300g
const PACOTE_ALTURA_CM = 5;
const PACOTE_LARGURA_CM = 25;
const PACOTE_COMPRIMENTO_CM = 35;

const getDefaultHeaders = () => {
  const state = store.getState();
  const apiToken = state.configReducer.token_superfrete;
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiToken}`,
    'User-Agent': 'ModaMaskavo/1.0.0 (modamaskavo@gmail.com)',
  };
};

const calculateShipping = async destinationCep => {
  const state = store.getState();
  const apiToken = state.configReducer.token_superfrete;
  const endpoint = `${API_BASE_URL}/calculator`;
  const headers = getDefaultHeaders(apiToken);

  const cleanDestinationCep = String(destinationCep).replace(/\D/g, '');

  const body = {
    from: {
      postal_code: ORIGEM_CEP,
    },
    to: {
      postal_code: cleanDestinationCep,
    },
    services: '1,2,17', // Opcional: Se quiser filtrar serviços específicos (1:PAC, 2:Sedex, 17:Mini Envios)
    package: {
      height: PACOTE_ALTURA_CM,
      width: PACOTE_LARGURA_CM,
      length: PACOTE_COMPRIMENTO_CM,
      weight: PACOTE_PESO_KG,
    },
    options: {
      receipt: false, // Aviso de Recebimento
      own_hand: false, // Mão Própria
      // insurance_value: 0, // Valor declarado para seguro (opcional)
      // use_insurance_value: false,
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Tenta extrair uma mensagem de erro mais específica da resposta
      const errorMessage =
        responseData?.error?.message ||
        responseData?.message ||
        `Erro HTTP: ${response.status}`;
      console.error('Erro ao calcular frete:', errorMessage, responseData);
      throw new Error(`Erro ao calcular frete: ${errorMessage}`);
    }

    // Retorna a lista de serviços/preços calculados
    return responseData;
  } catch (error) {
    console.error('Falha na requisição de cálculo de frete:', error);
    throw error; // Re-lança o erro para ser tratado no componente
  }
};

const generateLabel = async shippingDetails => {
  const state = store.getState();
  const apiToken = state.configReducer.token_superfrete;
  const cartEndpoint = `${API_BASE_URL}/cart`;
  const checkoutEndpoint = `${API_BASE_URL}/checkout`;
  const headers = getDefaultHeaders(apiToken);

  const cartBody = {
    from: {
      name: shippingDetails?.from?.name || 'Moda Maskavo',
      postal_code: shippingDetails?.from?.postal_code || ORIGEM_CEP,
      address: shippingDetails?.from?.address || 'Rua Pedro Camilo Vicente',
      number: shippingDetails?.from?.number || '567',
      district: shippingDetails?.from?.district || 'Cordeiros',
      city: shippingDetails?.from?.city || 'Itajaí',
      state_abbr: shippingDetails?.from?.state_abbr || 'SC',
      complement: shippingDetails?.from?.complement || 'Maskavo na Frente',
      email: shippingDetails?.from?.email || 'modamaskavo@gmail.com',
      phone: shippingDetails?.from?.phone || '5547996676910',
    },
    to: shippingDetails.to,
    service: shippingDetails.service,
    products: shippingDetails.products,
    options: {
      insurance_value: shippingDetails.options.insurance_value || 0,
      receipt: shippingDetails.options.receipt || false,
      own_hand: shippingDetails.options.own_hand || false,
      // A API espera que use_insurance_value seja true se insurance_value > 0
      use_insurance_value: (shippingDetails.options.insurance_value || 0) > 0,
    },
    // Adiciona as dimensões fixas se não vierem dos produtos/cálculo
    // A API /cart espera "volume" em vez de "package"
    volumes: {
      height: PACOTE_ALTURA_CM,
      width: PACOTE_LARGURA_CM,
      length: PACOTE_COMPRIMENTO_CM,
      weight: PACOTE_PESO_KG,
    },
    // platform: "NomeDaSuaPlataforma", // Opcional: Identificador da plataforma
    // internal_id: "SeuIdInterno", // Opcional: ID interno do pedido
  };

  try {
    const cartResponse = await fetch(cartEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(cartBody),
    });

    const cartData = await cartResponse.json();
    /**  AQUI SERIA CASO PRECISAR PAGAR O FRETE NA HORA DE GERAR A ETIQUETA  */

    /*
    if (!cartResponse.ok || !cartData[0]?.id) {
      const errorMessage =
        cartData?.error?.message ||
        cartData?.message ||
        `Erro HTTP: ${cartResponse.status}`;
      console.error(
        'Erro ao adicionar frete ao carrinho:',
        errorMessage,
        cartData,
      );
      throw new Error(`Erro ao adicionar frete ao carrinho: ${errorMessage}`);
    }

    const orderId = cartData[0].id; // Pega o ID do primeiro (e único) item adicionado
    console.log('Pedido adicionado ao carrinho com ID:', orderId);

    // --- Passo 2: Finalizar Compra (Checkout) ---
    const checkoutBody = {
      orders: [orderId],
    };

    console.log('Enviando requisição para (Checkout):', checkoutEndpoint);
    console.log('Headers:', {
      ...headers,
      Authorization: 'Bearer [TOKEN OMITIDO]',
    });
    console.log('Body (Checkout):', JSON.stringify(checkoutBody));

    const checkoutResponse = await fetch(checkoutEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(checkoutBody),
    });

    const checkoutData = await checkoutResponse.json();
    console.log('Resposta da API (Checkout):', checkoutData);

    if (!checkoutResponse.ok) {
      const errorMessage =
        checkoutData?.error?.message ||
        checkoutData?.message ||
        `Erro HTTP: ${checkoutResponse.status}`;
      console.error(
        'Erro ao finalizar pedido (checkout):',
        errorMessage,
        checkoutData,
      );
      // Aqui pode ser útil verificar se o erro é saldo insuficiente, etc.
      throw new Error(`Erro ao finalizar pedido: ${errorMessage}`);
    }

    console.log('Pedido finalizado com sucesso:', checkoutData);
    // checkoutData deve conter informações sobre a etiqueta gerada
    // Você pode querer chamar a API /preview aqui para obter o link de impressão
    // ou retornar checkoutData para o componente decidir o que fazer.
    return checkoutData;*/
  } catch (error) {
    console.error('Falha na requisição de geração de etiqueta:', error);
    throw error; // Re-lança o erro
  }
};

export const SuperFreteService = {
  calculateShipping,
  generateLabel,
};
