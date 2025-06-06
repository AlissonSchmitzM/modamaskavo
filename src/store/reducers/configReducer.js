import {
  DATA_CONFIG,
  MODIFY_ENVIRONMENT,
  MODIFY_KEY_API_PROD,
  MODIFY_KEY_API_SANDBOX,
  MODIFY_PHONE_CONFIG,
  SAVE_CONFIG_ERROR,
  SAVE_CONFIG_IN_PROGRESS,
  SAVE_CONFIG_SUCCESS,
  MODIFY_TOKEN_SUPERFRETE,
  MODIFY_USER_WOO,
  MODIFY_PASSWORD_WOO,
} from '../actions/actionTypes';

const INITIAL_STATE = {
  saveConfigInProgress: false,
  phone_orders: '',
  environment: '',
  key_api_sandbox: '',
  key_api_prod: '',
  token_superfrete: '',
  user_woo: '',
  password_woo: '',
};

const configReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case DATA_CONFIG:
      return {
        ...state,
        phone_orders: action.payload.phone_orders,
        environment: action.payload.environment,
        key_api_sandbox: action.payload.key_api_sandbox,
        key_api_prod: action.payload.key_api_prod,
        token_superfrete: action.payload.token_superfrete,
        user_woo: action.payload.user_woo,
        password_woo: action.payload.password_woo,
      };
    case SAVE_CONFIG_IN_PROGRESS:
      return {...state, saveConfigInProgress: true};
    case SAVE_CONFIG_SUCCESS:
      return {...state, saveConfigInProgress: false};
    case SAVE_CONFIG_ERROR:
      return {...state, saveConfigInProgress: false};
    case MODIFY_PHONE_CONFIG:
      return {...state, phone_orders: action.payload};
    case MODIFY_ENVIRONMENT:
      return {...state, environment: action.payload};
    case MODIFY_KEY_API_SANDBOX:
      return {...state, key_api_sandbox: action.payload};
    case MODIFY_KEY_API_PROD:
      return {...state, key_api_prod: action.payload};
    case MODIFY_TOKEN_SUPERFRETE:
      return {...state, token_superfrete: action.payload};
    case MODIFY_USER_WOO:
      return {...state, user_woo: action.payload};
    case MODIFY_PASSWORD_WOO:
      return {...state, password_woo: action.payload};
    default:
      return state;
  }
};

export default configReducer;
