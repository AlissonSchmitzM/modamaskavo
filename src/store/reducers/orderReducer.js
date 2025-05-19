import {
  ORDER_REGISTRATION_IN_PROGRESS,
  ORDER_REGISTRATION_ERROR,
  ORDER_REGISTRATION_SUCCESS,
  MODIFY_SEGMENT,
  MODIFY_TAM,
  MODIFY_DESCRIPTION,
  MODIFY_TYPE,
  MODIFY_AMOUNT_PIECES,
} from '../actions/actionTypes';

const INITIAL_STATE = {
  registerOrderInProgress: false,
  type: 'exclusive',
  segment: '',
  tam: '',
  description: '',
  amountPieces: '',
  logos: '',
};

const orderReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ORDER_REGISTRATION_IN_PROGRESS:
      return {...state, registerOrderInProgress: true};
    case ORDER_REGISTRATION_SUCCESS:
      return {...state, registerOrderInProgress: false};
    case ORDER_REGISTRATION_ERROR:
      return {...state, registerOrderInProgress: false};
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
