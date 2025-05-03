import {
  FETCH_ADDRESS_REQUEST,
  FETCH_ADDRESS_SUCCESS,
  FETCH_ADDRESS_FAILURE,
  MODIFY_ADDRESS,
  MODIFY_NEIGHBORHOOD,
  MODIFY_CITY,
  MODIFY_STATE,
} from '../actions/userActions';

// Estado inicial
const INITIAL_STATE = {
  loading: false,
  address: {
    logradouro: '',
    bairro: '',
    localidade: '',
    estado: '',
  },
  error: null,
};

// Reducer para endereço
const userReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_ADDRESS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_ADDRESS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        address: action.payload,
      };

    case FETCH_ADDRESS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case MODIFY_ADDRESS:
      return {
        ...state,
        loading: false,
        address: {
          ...state.address,
          logradouro: action.payload,
        },
      };

    case MODIFY_NEIGHBORHOOD:
      return {
        ...state,
        loading: false,
        address: {
          ...state.address,
          bairro: action.payload,
        },
      };

    case MODIFY_CITY:
      return {
        ...state,
        loading: false,
        address: {
          ...state.address,
          localidade: action.payload,
        },
      };

    case MODIFY_STATE:
      return {
        ...state,
        loading: false,
        address: {
          ...state.address,
          estado: action.payload,
        },
      };

    default:
      return state;
  }
};

export default userReducer;
