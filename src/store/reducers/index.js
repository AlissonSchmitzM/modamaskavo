import {combineReducers} from 'redux';
import userReducer from './userReducer';
import orderReducer from './orderReducer';

// Combina todos os reducers da aplicação
const rootReducer = combineReducers({
  userReducer,
  orderReducer,
});

export default rootReducer;
