import {
  DATA_CONFIG,
  MODIFY_PHONE_CONFIG,
  SAVE_CONFIG_ERROR,
  SAVE_CONFIG_IN_PROGRESS,
  SAVE_CONFIG_SUCCESS,
} from '../actions/actionTypes';

const INITIAL_STATE = {
  saveConfigInProgress: false,
  phone_orders: '',
};

const configReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case DATA_CONFIG:
      return {...state, phone_orders: action.payload.phone_orders};
    case SAVE_CONFIG_IN_PROGRESS:
      return {...state, saveConfigInProgress: true};
    case SAVE_CONFIG_SUCCESS:
      return {...state, saveConfigInProgress: false};
    case SAVE_CONFIG_ERROR:
      return {...state, saveConfigInProgress: false};
    case MODIFY_PHONE_CONFIG:
      return {...state, phone_orders: action.payload};
    default:
      return state;
  }
};

export default configReducer;
