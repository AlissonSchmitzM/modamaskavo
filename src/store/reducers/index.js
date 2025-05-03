import {combineReducers} from 'redux';
import userReducer from './userReducer';

// Combina todos os reducers da aplicação
const rootReducer = combineReducers({
  userReducer,
});

export default rootReducer;
