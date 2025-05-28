import {
  DATA_CONFIG,
  MODIFY_ENVIRONMENT,
  MODIFY_KEY_API_PROD,
  MODIFY_KEY_API_SANDBOX,
  MODIFY_PHONE_CONFIG,
  SAVE_CONFIG_ERROR,
  SAVE_CONFIG_IN_PROGRESS,
  SAVE_CONFIG_SUCCESS,
} from '../actions/actionTypes';

const INITIAL_STATE = {
  saveConfigInProgress: false,
  phone_orders: '',
  environment: '',
  key_api_sandbox: '',
  key_api_prod: '',
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
    default:
      return state;
  }
};

export default configReducer;
