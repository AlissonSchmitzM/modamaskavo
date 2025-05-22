import toastr, {ERROR, SUCCESS} from '../../services/toastr';
import {getDatabase, ref, set} from '@react-native-firebase/database';
import {
  DATA_CONFIG,
  MODIFY_PHONE_CONFIG,
  SAVE_CONFIG_ERROR,
  SAVE_CONFIG_IN_PROGRESS,
  SAVE_CONFIG_SUCCESS,
} from './actionTypes';

export const saveConfig = dataConfig => dispatch => {
  dispatch({type: SAVE_CONFIG_IN_PROGRESS});
  const {phone_orders} = dataConfig;

  getDatabase()
    .ref(`/config`)
    .update({phone_orders})
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
    .once('value')
    .then(async snapshot => {
      dispatch({type: DATA_CONFIG, payload: await snapshot.val()});
    })
    .catch(() =>
      toastr.showToast('Problema ao carregar configurações.', ERROR),
    );
};

export const modifyPhoneConfig = phone => dispatch => {
  dispatch({type: MODIFY_PHONE_CONFIG, payload: phone});
};
