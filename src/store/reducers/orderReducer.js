import {
  ORDER_REGISTRATION_IN_PROGRESS,
  ORDER_REGISTRATION_ERROR,
  ORDER_REGISTRATION_SUCCESS,
  MODIFY_SEGMENT,
  MODIFY_TAM,
  MODIFY_DESCRIPTION,
  MODIFY_TYPE,
  MODIFY_AMOUNT_PIECES,
  DATA_ORDERS,
  DATA_ORDERS_FULL,
  CANCEL_ORDER,
  CANCEL_ORDER_ERROR,
  SET_PRICE_ORDER,
  SET_PRICE_ORDER_ERROR,
  SET_ESTIMATED_FINISH_ORDER,
  SET_ESTIMATED_FINISH_ORDER_ERROR,
  SET_CODE_TRACK_ORDER,
  SET_CODE_TRACK_ORDER_ERROR,
  PAYMENT_SUCCESS_ORDER,
  PAYMENT_SUCCESS_ORDER_ERROR,
} from '../actions/actionTypes';

const INITIAL_STATE = {
  registerOrderInProgress: false,
  type: 'exclusive',
  segment: '',
  tam: '',
  description: '',
  amountPieces: '',
  logos: '',
  reason_cancellation: '',
  value_order: '',
  observation_admin: '',
  estimated_finish: '',
  code_track: '',
  orders: {},
  ordersFull: {},
};

const orderReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ORDER_REGISTRATION_IN_PROGRESS:
      return {...state, registerOrderInProgress: true};
    case ORDER_REGISTRATION_SUCCESS:
      return {
        ...state,
        segment: '',
        tam: '',
        description: '',
        amountPieces: '',
        logos: '',
        registerOrderInProgress: false,
      };
    case ORDER_REGISTRATION_ERROR:
      return {...state, registerOrderInProgress: false};
    case DATA_ORDERS:
      return {...state, orders: action.payload};
    case DATA_ORDERS_FULL:
      return {...state, ordersFull: action.payload};
    case CANCEL_ORDER:
      return {...state, reason_cancellation: action.payload};
    case CANCEL_ORDER_ERROR:
      return {...state, reason_cancellation: ''};
    case SET_PRICE_ORDER:
      return {...state, value_order: action.payload};
    case SET_PRICE_ORDER_ERROR:
      return {...state, value_order: ''};
    case PAYMENT_SUCCESS_ORDER:
      return {...state};
    case PAYMENT_SUCCESS_ORDER_ERROR:
      return {...state};
    case SET_CODE_TRACK_ORDER:
      return {...state, code_track: action.payload};
    case SET_CODE_TRACK_ORDER_ERROR:
      return {...state, code_track: ''};
    case SET_ESTIMATED_FINISH_ORDER:
      return {...state, estimated_finish: action.payload};
    case SET_ESTIMATED_FINISH_ORDER_ERROR:
      return {...state, estimated_finish: ''};
    case MODIFY_TYPE:
      return {...state, type: action.payload};
    case MODIFY_SEGMENT:
      return {...state, segment: action.payload};
    case MODIFY_AMOUNT_PIECES:
      return {...state, amountPieces: action.payload};
    case MODIFY_TAM:
      return {...state, tam: action.payload};
    case MODIFY_DESCRIPTION:
      return {...state, description: action.payload};
    default:
      return state;
  }
};

export default orderReducer;
