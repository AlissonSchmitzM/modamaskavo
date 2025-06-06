import toastr, {ERROR, SUCCESS} from '../../services/toastr';
import {getDatabase, ref, set} from '@react-native-firebase/database';
import {
  DATA_CONFIG,
  MODIFY_ENVIRONMENT,
  MODIFY_KEY_API_PROD,
  MODIFY_KEY_API_SANDBOX,
  MODIFY_PASSWORD_WOO,
  MODIFY_PHONE_CONFIG,
  MODIFY_TOKEN_SUPERFRETE,
  MODIFY_USER_WOO,
  SAVE_CONFIG_ERROR,
  SAVE_CONFIG_IN_PROGRESS,
  SAVE_CONFIG_SUCCESS,
} from './actionTypes';

export const saveConfig = dataConfig => dispatch => {
  dispatch({type: SAVE_CONFIG_IN_PROGRESS});
  const {
    phone_orders,
    environment,
    key_api_sandbox,
    key_api_prod,
    token_superfrete,
    user_woo,
    password_woo,
  } = dataConfig;

  getDatabase()
    .ref(`/config`)
    .update({
      phone_orders,
      environment,
      key_api_sandbox,
      key_api_prod,
      token_superfrete,
      user_woo,
      password_woo,
    })
    .then(() => {
      dispatch(
        {type: SAVE_CONFIG_SUCCESS},
        toastr.showToast('Configuração salva com sucesso!', SUCCESS),
      );
    })
    .catch(err => dispatch({type: SAVE_CONFIG_ERROR}, err, ERROR));
};

export const readDataConfig = () => async dispatch => {
  getDatabase()
    .ref(`/config`)
    .on('value', async snapshot => {
      dispatch({type: DATA_CONFIG, payload: await snapshot.val()});
    })
    .catch(() =>
      toastr.showToast('Problema ao carregar configurações.', ERROR),
    );
};

export const modifyPhoneConfig = phone => dispatch => {
  dispatch({type: MODIFY_PHONE_CONFIG, payload: phone});
};

export const modifyEnvironment = environment => dispatch => {
  dispatch({type: MODIFY_ENVIRONMENT, payload: environment});
};

export const modifyKeyApiSandbox = key => dispatch => {
  dispatch({type: MODIFY_KEY_API_SANDBOX, payload: key});
};

export const modifyKeyApiProd = key => dispatch => {
  dispatch({type: MODIFY_KEY_API_PROD, payload: key});
};

export const modifyTokenSuperfrete = token => dispatch => {
  dispatch({type: MODIFY_TOKEN_SUPERFRETE, payload: token});
};

export const modifyUserWoo = user => dispatch => {
  dispatch({type: MODIFY_USER_WOO, payload: user});
};

export const modifyPasswordWoo = password => dispatch => {
  dispatch({type: MODIFY_PASSWORD_WOO, payload: password});
};
