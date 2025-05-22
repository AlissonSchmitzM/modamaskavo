import {combineReducers} from 'redux';
import userReducer from './userReducer';
import orderReducer from './orderReducer';
import configReducer from './configReducer';

// Combina todos os reducers da aplicação
const rootReducer = combineReducers({
  userReducer,
  orderReducer,
  configReducer,
});

export default rootReducer;
