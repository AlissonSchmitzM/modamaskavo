// productActions.js
import axios from 'axios';
import toastr, {ERROR, SUCCESS} from '../../services/toastr';
import {
  FETCH_PRODUCTS_IN_PROGRESS,
  FETCH_PRODUCTS_SUCCESS,
  FETCH_PRODUCTS_ERROR,
  LOAD_MORE_PRODUCTS,
  FETCH_VARIATIONS_IN_PROGRESS,
  FETCH_VARIATIONS_SUCCESS,
  FETCH_VARIATIONS_ERROR,
  UPDATE_PRODUCT_STOCK_IN_PROGRESS,
  UPDATE_PRODUCT_STOCK_SUCCESS,
  UPDATE_PRODUCT_STOCK_ERROR,
  SELECT_VARIATION,
  SET_ACTIVE_IMAGE_INDEX,
  TOGGLE_DROPDOWN,
  SET_DROPDOWN_LAYOUT,
} from './actionTypes';

const WOO_API_URL = 'https://www.modamaskavo.com.br/wp-json/wc/v3';

// Buscar produtos
export const fetchProducts =
  (pageNumber = 1, isLoadMore = false) =>
  async (dispatch, getState) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!isLoadMore) {
        dispatch({type: FETCH_PRODUCTS_IN_PROGRESS});
      }

      const response = await axios.get(`${WOO_API_URL}/products`, {
        params: {
          stock_status: 'instock',
          status: 'publish',
          per_page: 20,
          page: pageNumber,
          catalog_visibility: 'visible',
        },
        auth: {
          username: getState().configReducer.user_woo,
          password: getState().configReducer.password_woo,
        },
      });

      const totalPages = response.headers['x-wp-totalpages'];
      const hasMoreProducts = pageNumber < parseInt(totalPages);

      if (isLoadMore) {
        dispatch({
          type: LOAD_MORE_PRODUCTS,
          payload: {
            products: response.data,
            page: pageNumber,
            hasMoreProducts,
          },
        });
      } else {
        dispatch({
          type: FETCH_PRODUCTS_SUCCESS,
          payload: {
            products: response.data,
            page: pageNumber,
            hasMoreProducts,
          },
        });
      }
    } catch (error) {
      console.error(
        'Erro ao buscar produtos:',
        error.response?.data || error.message,
      );
      dispatch({type: FETCH_PRODUCTS_ERROR});
      toastr.showToast('Não foi possível carregar os produtos.', ERROR);
    }
  };

// Carregar mais produtos
export const loadMoreProducts = currentPage => (dispatch, getState) => {
  const {hasMoreProducts, loading} = getState().productReducer;

  if (!loading && hasMoreProducts) {
    const nextPage = currentPage + 1;
    dispatch(fetchProducts(nextPage, true));
  }
};

// Buscar variações de um produto
export const fetchVariations = productId => async (dispatch, getState) => {
  try {
    dispatch({type: FETCH_VARIATIONS_IN_PROGRESS, payload: productId});

    const response = await axios.get(
      `${WOO_API_URL}/products/${productId}/variations`,
      {
        params: {
          per_page: 100,
        },
        auth: {
          username: getState().configReducer.user_woo,
          password: getState().configReducer.password_woo,
        },
      },
    );

    // Filtrar apenas variações em estoque
    const variacoesEmEstoque = response.data.filter(
      variation =>
        variation.stock_status === 'instock' && variation.stock_quantity > 0,
    );

    dispatch({
      type: FETCH_VARIATIONS_SUCCESS,
      payload: {
        productId,
        variations: variacoesEmEstoque,
      },
    });
  } catch (error) {
    console.error(
      'Erro ao buscar variações:',
      error.response?.data || error.message,
    );
    dispatch({type: FETCH_VARIATIONS_ERROR, payload: productId});
    toastr.showToast(
      'Não foi possível carregar as variações do produto.',
      ERROR,
    );
  }
};

// Atualizar estoque de produto simples
export const reduceProductStockSimple =
  product => async (dispatch, getState) => {
    // Verifica se o produto tem estoque gerenciado e quantidade definida
    if (!product.manage_stock || product.stock_quantity === null) {
      toastr.showToast('Este produto não tem estoque gerenciado.', ERROR);
      return;
    }

    // Verifica se há estoque suficiente
    if (product.stock_quantity <= 0) {
      toastr.showToast('Produto sem estoque disponível.', ERROR);
      return;
    }

    try {
      dispatch({type: UPDATE_PRODUCT_STOCK_IN_PROGRESS, payload: product.id});

      // Calcula nova quantidade
      const novaQuantidade = product.stock_quantity - 1;

      // Faz a requisição para atualizar o estoque
      await axios.put(
        `${WOO_API_URL}/products/${product.id}`,
        {
          stock_quantity: novaQuantidade,
        },
        {
          auth: {
            username: getState().configReducer.user_woo,
            password: getState().configReducer.password_woo,
          },
        },
      );

      dispatch({
        type: UPDATE_PRODUCT_STOCK_SUCCESS,
        payload: {
          productId: product.id,
          newQuantity: novaQuantidade,
        },
      });

      // Opcional: mostrar mensagem de sucesso
      // toastr.showToast(`Estoque do produto ${product.name} reduzido para ${novaQuantidade}.`, SUCCESS);
    } catch (error) {
      console.error(
        'Erro ao atualizar estoque:',
        error.response?.data || error.message,
      );
      dispatch({type: UPDATE_PRODUCT_STOCK_ERROR, payload: product.id});
      toastr.showToast('Não foi possível atualizar o estoque.', ERROR);
    }
  };

// Atualizar estoque de variação
export const reduceProductStockVariation =
  (productId, variation) => async (dispatch, getState) => {
    if (!variation) {
      toastr.showToast('Selecione uma variação primeiro.', ERROR);
      return;
    }

    try {
      dispatch({type: UPDATE_PRODUCT_STOCK_IN_PROGRESS, payload: variation.id});

      // Calcula nova quantidade
      const novaQuantidade = variation.stock_quantity - 1;

      // Faz a requisição para atualizar o estoque da variação
      await axios.put(
        `${WOO_API_URL}/products/${productId}/variations/${variation.id}`,
        {
          stock_quantity: novaQuantidade,
        },
        {
          auth: {
            username: getState().configReducer.user_woo,
            password: getState().configReducer.password_woo,
          },
        },
      );

      dispatch({
        type: UPDATE_PRODUCT_STOCK_SUCCESS,
        payload: {
          productId,
          variationId: variation.id,
          newQuantity: novaQuantidade,
        },
      });

      // Formata os atributos para exibição
      const atributos = variation.attributes
        .map(attr => `${attr.name}: ${attr.option}`)
        .join(', ');

      toastr.showToast(
        `Estoque da variação ${atributos} reduzido para ${novaQuantidade}.`,
        SUCCESS,
      );
    } catch (error) {
      console.error(
        'Erro ao atualizar estoque da variação:',
        error.response?.data || error.message,
      );
      dispatch({type: UPDATE_PRODUCT_STOCK_ERROR, payload: variation.id});
      toastr.showToast(
        'Não foi possível atualizar o estoque da variação.',
        ERROR,
      );
    }
  };

// Selecionar uma variação
export const selectVariation = (productId, variation) => dispatch => {
  dispatch({
    type: SELECT_VARIATION,
    payload: {productId, variation},
  });
};

// Atualizar o índice de imagem ativa
export const setActiveImageIndex = (productId, index) => dispatch => {
  dispatch({
    type: SET_ACTIVE_IMAGE_INDEX,
    payload: {productId, index},
  });
};

// Alternar o dropdown
export const toggleDropdown = productId => (dispatch, getState) => {
  const {openDropdowns, productVariations} = getState().productReducer;

  // Se o dropdown está fechado e não temos variações, buscamos elas
  if (!openDropdowns[productId] && !productVariations[productId]) {
    dispatch(fetchVariations(productId));
  }

  dispatch({
    type: TOGGLE_DROPDOWN,
    payload: productId,
  });
};

// Definir layout do dropdown
export const setDropdownLayout = (productId, layout) => dispatch => {
  dispatch({
    type: SET_DROPDOWN_LAYOUT,
    payload: {productId, layout},
  });
};
