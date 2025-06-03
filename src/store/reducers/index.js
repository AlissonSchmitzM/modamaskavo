import {combineReducers} from 'redux';
import userReducer from './userReducer';
import orderReducer from './orderReducer';
import configReducer from './configReducer';
import productReducer from './productReducer';

// Combina todos os reducers da aplicação
const rootReducer = combineReducers({
  userReducer,
  orderReducer,
  configReducer,
  productReducer,
});

export default rootReducer;
