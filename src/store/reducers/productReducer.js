// productReducer.js
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
} from '../actions/actionTypes';

const INITIAL_STATE = {
  products: [],
  loading: false,
  error: false,
  page: 1,
  hasMoreProducts: true,
  updatingProductId: null,
  productVariations: {},
  loadingVariations: {},
  selectedVariations: {},
  openDropdowns: {},
  activeImageIndexes: {},
  dropdownLayout: {},
};

const productReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_PRODUCTS_IN_PROGRESS:
      return {
        ...state,
        loading: true,
      };

    case FETCH_PRODUCTS_SUCCESS: {
      // Inicializa os índices ativos para o carrossel de cada produto
      const initialActiveIndexes = {};
      action.payload.products.forEach(product => {
        initialActiveIndexes[product.id] = 0;
      });

      return {
        ...state,
        products: [...action.payload.products], // Cria uma nova cópia do array
        page: action.payload.page,
        hasMoreProducts: action.payload.hasMoreProducts,
        loading: false,
        error: false,
        activeImageIndexes: initialActiveIndexes,
      };
    }

    case FETCH_PRODUCTS_ERROR:
      return {
        ...state,
        loading: false,
        error: true,
      };

    case LOAD_MORE_PRODUCTS: {
      // Inicializa os índices ativos para os novos produtos
      const newActiveIndexes = {...state.activeImageIndexes};
      action.payload.products.forEach(product => {
        newActiveIndexes[product.id] = 0;
      });

      return {
        ...state,
        products: [...state.products, ...action.payload.products],
        page: action.payload.page,
        hasMoreProducts: action.payload.hasMoreProducts,
        loading: false,
        activeImageIndexes: newActiveIndexes,
      };
    }

    case FETCH_VARIATIONS_IN_PROGRESS:
      return {
        ...state,
        loadingVariations: {
          ...state.loadingVariations,
          [action.payload]: true,
        },
      };

    case FETCH_VARIATIONS_SUCCESS:
      return {
        ...state,
        productVariations: {
          ...state.productVariations,
          [action.payload.productId]: [...action.payload.variations], // Cria uma nova cópia do array
        },
        loadingVariations: {
          ...state.loadingVariations,
          [action.payload.productId]: false,
        },
      };

    case FETCH_VARIATIONS_ERROR:
      return {
        ...state,
        loadingVariations: {
          ...state.loadingVariations,
          [action.payload]: false,
        },
      };

    case UPDATE_PRODUCT_STOCK_IN_PROGRESS:
      return {
        ...state,
        updatingProductId: action.payload,
      };

    case UPDATE_PRODUCT_STOCK_SUCCESS:
      // Verifica se é uma atualização de produto simples ou variação
      if (action.payload.variationId) {
        // Verifica se o produto tem variações
        const productVariations =
          state.productVariations[action.payload.productId];
        if (!productVariations) {
          return {
            ...state,
            updatingProductId: null,
          };
        }

        // Atualização de variação
        const updatedVariations = productVariations.map(v =>
          v.id === action.payload.variationId
            ? {...v, stock_quantity: action.payload.newQuantity}
            : v,
        );

        // Verifica se existe uma variação selecionada para este produto
        const selectedVariation =
          state.selectedVariations[action.payload.productId];
        const updatedSelectedVariations = {...state.selectedVariations};

        // Se a variação selecionada for a mesma que está sendo atualizada, atualiza-a também
        if (
          selectedVariation &&
          selectedVariation.id === action.payload.variationId
        ) {
          updatedSelectedVariations[action.payload.productId] = {
            ...selectedVariation,
            stock_quantity: action.payload.newQuantity,
          };
        }

        return {
          ...state,
          productVariations: {
            ...state.productVariations,
            [action.payload.productId]: updatedVariations,
          },
          selectedVariations: updatedSelectedVariations,
          updatingProductId: null,
        };
      } else {
        // Atualização de produto simples
        return {
          ...state,
          products: state.products.map(p =>
            p.id === action.payload.productId
              ? {...p, stock_quantity: action.payload.newQuantity}
              : p,
          ),
          updatingProductId: null,
        };
      }

    case UPDATE_PRODUCT_STOCK_ERROR:
      return {
        ...state,
        updatingProductId: null,
      };

    case SELECT_VARIATION:
      return {
        ...state,
        selectedVariations: {
          ...state.selectedVariations,
          [action.payload.productId]: {...action.payload.variation}, // Cria uma nova cópia do objeto
        },
        openDropdowns: {
          ...state.openDropdowns,
          [action.payload.productId]: false,
        },
      };

    case SET_ACTIVE_IMAGE_INDEX:
      return {
        ...state,
        activeImageIndexes: {
          ...state.activeImageIndexes,
          [action.payload.productId]: action.payload.index,
        },
      };

    case TOGGLE_DROPDOWN:
      return {
        ...state,
        openDropdowns: {
          ...state.openDropdowns,
          [action.payload]: !state.openDropdowns[action.payload],
        },
      };

    case SET_DROPDOWN_LAYOUT:
      return {
        ...state,
        dropdownLayout: {
          ...state.dropdownLayout,
          [action.payload.productId]: {...action.payload.layout}, // Cria uma nova cópia do objeto
        },
      };

    default:
      return state;
  }
};

export default productReducer;
