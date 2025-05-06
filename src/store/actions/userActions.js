import toastr, {SUCCESS, ERROR} from '../../services/toastr';
import b64 from 'base-64';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import navigationService from '../../services/NavigatorService';

import {
  FETCH_ADDRESS_REQUEST,
  FETCH_ADDRESS_SUCCESS,
  FETCH_ADDRESS_FAILURE,
  MODIFY_ADDRESS,
  MODIFY_NEIGHBORHOOD,
  MODIFY_CITY,
  MODIFY_STATE,
  REGISTRATION_IN_PROGRESS,
  REGISTRATION_SUCCESS,
  REGISTRATION_ERROR,
  MODIFY_NAME,
  MODIFY_EMAIL,
  MODIFY_PASSWORD,
  MODIFY_CPFCNPJ,
  MODIFY_PHONE,
  MODIFY_CEP,
  MODIFY_NUMBER,
  MODIFY_COMPLEMENT,
  LOGIN_IN_PROGRESS,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  SAVE_PROFILE_IN_PROGRESS,
  SAVE_PROFILE_SUCCESS,
  SAVE_PROFILE_ERROR,
} from './actionTypes';

// Action creators simples
export const fetchAddressRequest = () => dispatch => {
  dispatch({type: FETCH_ADDRESS_REQUEST});
};

export const fetchAddressSuccess = address => dispatch => {
  dispatch({type: FETCH_ADDRESS_SUCCESS, payload: address});
};

export const fetchAddressFailure = error => dispatch => {
  dispatch({type: FETCH_ADDRESS_FAILURE, payload: error});
};

// Action creator thunk para buscar o endereço
export const fetchAddressByCep = cep => {
  return async dispatch => {
    dispatch(fetchAddressRequest());

    try {
      const ViaCepService = require('../../services/ViaCepService').default;
      const address = await ViaCepService.searchAddressCompletedByCep(cep);
      console.log('address', address);
      if (!address.estado !== undefined && address.localidade !== undefined) {
        dispatch(fetchAddressSuccess(address));
      } else {
        dispatch(fetchAddressFailure('CEP não encontrado'));
      }
    } catch (error) {
      console.log(error);
      dispatch(fetchAddressFailure(error.message || 'Erro ao buscar endereço'));
    }
  };
};

export const modifyAddress = logradouro => dispatch => {
  dispatch({type: MODIFY_ADDRESS, payload: logradouro});
};

export const modifyNeighborhood = neighborhood => dispatch => {
  dispatch({type: MODIFY_NEIGHBORHOOD, payload: neighborhood});
};

export const modifyCity = city => dispatch => {
  dispatch({type: MODIFY_CITY, payload: city});
};

export const modifyState = state => dispatch => {
  dispatch({type: MODIFY_STATE, payload: state});
};

export const modifyName = name => dispatch => {
  dispatch({type: MODIFY_NAME, payload: name});
};

export const modifyEmail = email => dispatch => {
  dispatch({type: MODIFY_EMAIL, payload: email});
};

export const modifyPassword = password => dispatch => {
  dispatch({type: MODIFY_PASSWORD, payload: password});
};

export const modifyCpfCnpj = cpfcnpj => dispatch => {
  dispatch({type: MODIFY_CPFCNPJ, payload: cpfcnpj});
};

export const modifyPhone = phone => dispatch => {
  dispatch({type: MODIFY_PHONE, payload: phone});
};

export const modifyCep = cep => dispatch => {
  dispatch({type: MODIFY_CEP, payload: cep});
};

export const modifyNumber = number => dispatch => {
  dispatch({type: MODIFY_NUMBER, payload: number});
};

export const modifyComplement = complement => dispatch => {
  dispatch({type: MODIFY_COMPLEMENT, payload: complement});
};

export const createUser =
  ({name, email, password}) =>
  async dispatch => {
    dispatch({type: REGISTRATION_IN_PROGRESS});

    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        const emailB64 = b64.encode(email);

        database()
          .ref(`/users/${emailB64}`)
          .set({
            name,
            email,
            fileImgPath: null,
            saveProfile: false,
            createdAt: new Date().toISOString(),
          })
          .then(() => registrationSuccess(dispatch));
      })
      .catch(error => {
        registrationError(error, dispatch);
      });
  };

export const authUserEmail =
  ({email, password}) =>
  dispatch => {
    dispatch({type: LOGIN_IN_PROGRESS});

    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => loginUserSuccess(dispatch))
      .catch(err => loginUserEmailError(err, dispatch));
  };

const loginUserSuccess = dispatch => {
  //store.save('userLogged', true);

  const {currentUser} = auth();
  const userEmailB64 = b64.encode(currentUser.email);

  database()
    .ref(`/users/${userEmailB64}/saveProfile`)
    .once('value')
    .then(async snapshot => {
      const saveProfile = await snapshot.val();

      dispatch(
        {type: LOGIN_SUCCESS},
        navigationService.navigate(saveProfile ? 'Main' : 'FormProfile'),
      );
    })
    .catch(() =>
      toastr.showToast('Problema ao carregar informação do usuário.', ERROR),
    );
};

const loginUserEmailError = (err, dispatch) => {
  let message;
  switch (err.code) {
    case 'auth/invalid-email':
      message = 'E-mail inválido!';
      break;
    case 'auth/wrong-password':
      message = 'Senha inválida!';
      break;
    case 'auth/user-not-found':
      message = 'Usuário não cadastrado.';
      break;
    case 'auth/network-request-failed':
      message = 'Sem conexão com a internet.';
      break;
    default:
      message = err.code;
  }

  dispatch({type: LOGIN_ERROR}, toastr.showToast(message, ERROR));
};

const registrationError = (err, dispatch) => {
  let message;
  switch (err.code) {
    case 'auth/invalid-email':
      message = 'E-mail inválido!';
      break;
    case 'auth/email-already-in-use':
      message = 'O e-mail informado já está cadastrado.';
      break;
    case 'auth/weak-password':
      message = 'A senha deve possuir mais de 6 caracteres.';
      break;
    case 'auth/network-request-failed':
      message = 'Sem conexão com a internet.';
      break;
    default:
      message = err.code;
  }
  dispatch({type: REGISTRATION_ERROR}, toastr.showToast(message, ERROR));
};

export const registrationSuccess = dispatch => {
  dispatch(
    {type: REGISTRATION_SUCCESS},
    toastr.showToast('Usuário cadastrado com sucesso!', SUCCESS),
    navigationService.navigate('FormLogin'),
  );
};

export const saveProfileUser = dataUser => dispatch => {
  dispatch({type: SAVE_PROFILE_IN_PROGRESS});
  const {
    name,
    email,
    /*fileImgPath, fileImgType*/ cpfcnpj,
    phone,
    cep,
    number,
    complement,
    address,
  } = dataUser;

  const emailB64 = b64.encode(email);

  // if (!photoModify) {
  database()
    .ref(`/users/${emailB64}`)
    .update({
      name,
      email,
      cpfcnpj,
      phone,
      cep,
      number,
      complement,
      logradouro: address?.logradouro || '',
      neighborhood: address?.bairro || '',
      city: address?.localidade || '',
      state: address?.estado || '',
      saveProfile: true,
    })
    .then(() => {
      saveProfileUserSuccess(dispatch);
      navigationService.navigate('Main');
    })
    .catch(err => saveProfileUserError(err, dispatch));
  /* } else {
    const Blob = RNFetchBlob.polyfill.Blob;
    const fs = RNFetchBlob.fs;
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
    window.Blob = Blob;
    let uploadBlob = null;

    const imgRef = FirebaseService.getFirebase()
      .storage()
      .ref('photos_profile')
      .child(`${emailB64}.${fileImgType.split('/')[1]}`);
    const mime = 'image/jpg';
    fs.readFile(fileImgPath, 'base64')
      .then(data => Blob.build(data, {type: `${mime};BASE64`}))
      .then(blob => {
        uploadBlob = blob;
        return imgRef.put(blob, {contentType: mime});
      })
      .then(() => {
        uploadBlob.close();
        return imgRef.getDownloadURL();
      })
      .then(url => {
        FirebaseService.getFirebase()
          .database()
          .ref(`/users/${emailB64}`)
          .set({
            name,
            email,
            course,
            phone,
            fileImgPath: url,
            fileImgType,
            saveProfile: true,
          })
          .then(() => {
            FirebaseService.getFirebase()
              .database()
              .ref(`/rides_users/${emailB64}`)
              .set({name, fileImgPath: url})
              .then(() => saveProfileUserSuccess(dispatch));
          })
          .catch(err => saveProfileUserError(err, dispatch));
      })
      .catch(err => saveProfileUserError(err, dispatch));
  }*/
};

const saveProfileUserSuccess = dispatch => {
  dispatch(
    {type: SAVE_PROFILE_SUCCESS},
    toastr.showToast('Perfil salvo com sucesso!', SUCCESS),
  );
};

const saveProfileUserError = (err, dispatch) => {
  dispatch({type: SAVE_PROFILE_ERROR}, err, ERROR);
};

/*database()
          .ref(`/users/${emailB64}`)
          .set({
            name,
            email,
            cpfcnpj,
            phone,
            cep,
            number,
            complement,
            logradouro: address?.logradouro || '',
            neighborhood: address?.bairro || '',
            city: address?.localidade || '',
            state: address?.estado || '',
            createdAt: new Date().toISOString(),
          })
          .then(() => registrationSuccess(dispatch));*/
