import {
  FETCH_ADDRESS_REQUEST,
  FETCH_ADDRESS_SUCCESS,
  FETCH_ADDRESS_FAILURE,
  MODIFY_ADDRESS,
  MODIFY_NEIGHBORHOOD,
  MODIFY_CITY,
  MODIFY_STATE,
  REGISTRATION_IN_PROGRESS,
  REGISTRATION_SUCCESS,
  REGISTRATION_ERROR,
  MODIFY_NAME,
  MODIFY_EMAIL,
  MODIFY_PASSWORD,
  MODIFY_CPFCNPJ,
  MODIFY_PHONE,
  MODIFY_CEP,
  MODIFY_NUMBER,
  MODIFY_COMPLEMENT,
  LOGIN_IN_PROGRESS,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  SAVE_PROFILE_IN_PROGRESS,
  SAVE_PROFILE_SUCCESS,
  SAVE_PROFILE_ERROR,
} from '../actions/actionTypes';

// Estado inicial
const INITIAL_STATE = {
  loading: false,
  registrationInProgress: false,
  loginInProgress: false,
  saveProfileInProgress: false,
  name: '',
  email: '',
  password: '',
  cpfcnpj: '',
  phone: '',
  cep: '',
  address: {
    logradouro: '',
    neighborhood: '',
    city: '',
    state: '',
  },
  complement: '',
  number: '',
  error: null,
};

// Reducer para endereço
const userReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_ADDRESS_REQUEST:
      return {...state, loading: true, error: null};
    case FETCH_ADDRESS_SUCCESS:
      return {...state, loading: false, error: null, address: action.payload};
    case FETCH_ADDRESS_FAILURE:
      return {...state, loading: false, error: action.payload};
    case MODIFY_ADDRESS:
      return {
        ...state,
        loading: false,
        address: {...state.address, logradouro: action.payload},
      };
    case MODIFY_NEIGHBORHOOD:
      return {
        ...state,
        loading: false,
        address: {...state.address, neighborhood: action.payload},
      };
    case MODIFY_CITY:
      return {
        ...state,
        loading: false,
        address: {...state.address, city: action.payload},
      };
    case MODIFY_NAME:
      return {...state, name: action.payload};
    case MODIFY_EMAIL:
      return {...state, email: action.payload};
    case MODIFY_PASSWORD:
      return {...state, password: action.payload};
    case MODIFY_CPFCNPJ:
      return {...state, cpfcnpj: action.payload};
    case MODIFY_PHONE:
      return {...state, phone: action.payload};
    case MODIFY_CEP:
      return {...state, cep: action.payload};
    case MODIFY_NUMBER:
      return {...state, number: action.payload};
    case MODIFY_COMPLEMENT:
      return {...state, complement: action.payload};
    case MODIFY_STATE:
      return {
        ...state,
        loading: false,
        address: {...state.address, state: action.payload},
      };
    case REGISTRATION_IN_PROGRESS:
      return {...state, registrationInProgress: true};
    case REGISTRATION_SUCCESS:
      return {...state, password: '', registrationInProgress: false};
    case REGISTRATION_ERROR:
      return {...state, registrationInProgress: false, error: action.payload};
    case LOGIN_IN_PROGRESS:
      return {...state, loginInProgress: true};
    case LOGIN_SUCCESS:
      return {...state, password: '', loginInProgress: false};
    case LOGIN_ERROR:
      return {...state, loginInProgress: false};
    case SAVE_PROFILE_IN_PROGRESS:
      return {...state, saveProfileInProgress: true};
    case SAVE_PROFILE_ERROR:
      return {...state, saveProfileInProgress: false};
    case SAVE_PROFILE_SUCCESS:
      return {...state, saveProfileInProgress: false};
    default:
      return state;
  }
};

export default userReducer;
