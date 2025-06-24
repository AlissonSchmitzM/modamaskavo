import toastr, {SUCCESS, ERROR} from '../../services/toastr';
import b64 from 'base-64';
import {
  EmailAuthProvider,
  getAuth,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithRedirect,
} from '@react-native-firebase/auth';
import {getDatabase, ref, set} from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import navigationService from '../../services/NavigatorService';
import store from '../../services/AsyncStorage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

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
  MODIFY_PHOTO,
  LOGIN_IN_PROGRESS,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  SAVE_PROFILE_IN_PROGRESS,
  SAVE_PROFILE_SUCCESS,
  SAVE_PROFILE_ERROR,
  DATA_USER,
  SIGN_OUT,
  LOGIN_GOOGLE_IN_PROGRESS,
  LOGIN_GOOGLE_ERROR,
  LOGIN_GOOGLE_SUCCESS,
  DATA_USERS_FULL,
  FORGOT_PASSWORD_IN_PROGRESS,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_ERROR,
  MODIFY_UF,
  DELETE_ACCOUNT_IN_PROGRESS,
  DELETE_ACCOUNT_SUCCESS,
  DELETE_ACCOUNT_ERROR,
} from './actionTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const signOut = () => dispatch => {
  const {currentUser} = getAuth();

  getAuth()
    .signOut()
    .then(() => {
      store.save('userLogged', false);
      store.save('emailUserLogged', null);

      const isLoggedGoogle = currentUser.providerData.some(
        provider => provider.providerId === 'google.com',
      );

      if (isLoggedGoogle) {
        GoogleSignin.signOut();
      }

      //Remove o cliente do asaas pagamentos
      AsyncStorage.removeItem('asaas_cliente_id');

      navigationService.reset('FormLogin');
      dispatch({type: SIGN_OUT});
    })
    .catch(() => toastr.showToast('Problema ao sair da conta.', ERROR));
};

export const fetchAddressRequest = () => dispatch => {
  dispatch({type: FETCH_ADDRESS_REQUEST});
};

export const fetchAddressSuccess = address => dispatch => {
  dispatch({type: FETCH_ADDRESS_SUCCESS, payload: address});
};

export const fetchAddressFailure = error => dispatch => {
  dispatch({type: FETCH_ADDRESS_FAILURE, payload: error});
};

export const fetchAddressByCep = cep => {
  return async dispatch => {
    dispatch(fetchAddressRequest());

    try {
      const ViaCepService = require('../../services/ViaCepService').default;
      const address = await ViaCepService.searchAddressCompletedByCep(cep);

      if (!address.uf !== undefined && address.localidade !== undefined) {
        dispatch(fetchAddressSuccess(address));
      } else {
        dispatch(fetchAddressFailure('CEP não encontrado'));
      }
    } catch (error) {
      dispatch(fetchAddressFailure(error.message || 'Erro ao buscar endereço'));
    }
  };
};

export const createUser =
  ({name, email, password}) =>
  dispatch => {
    dispatch({type: REGISTRATION_IN_PROGRESS});

    getAuth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        const emailB64 = b64.encode(email);

        set(ref(getDatabase(), `/users/${emailB64}`), {
          name,
          email,
          fileImgPath: null,
          saveProfile: false,
          createdAt: new Date().toISOString(),
        }).then(() => registrationSuccess(dispatch));
      })
      .catch(error => {
        registrationError(error, dispatch);
      });
  };

export const authUserEmail =
  ({email, password}) =>
  dispatch => {
    dispatch({type: LOGIN_IN_PROGRESS});

    getAuth()
      .signInWithEmailAndPassword(email, password)
      .then(() => loginUserSuccess(dispatch))
      .catch(err => loginUserEmailError(err, dispatch));
  };

const loginUserSuccess = dispatch => {
  store.save('userLogged', true);
  const deleteAccount =
    navigationService.getPreviousRouteName() === 'FormProfile';
  if (deleteAccount === true) {
    store.save('deleteAccount', true);
  }

  const {currentUser} = getAuth();
  const userEmailB64 = b64.encode(currentUser.email);

  getDatabase()
    .ref(`/users/${userEmailB64}/saveProfile`)
    .once('value')
    .then(async snapshot => {
      const saveProfile = await snapshot.val();

      if (deleteAccount === true) {
        dispatch({type: LOGIN_SUCCESS}, navigationService.reset('FormProfile'));
      } else {
        dispatch(
          {type: LOGIN_SUCCESS},
          navigationService.reset(saveProfile ? 'Main' : 'FormProfile'),
        );
      }
    })
    .catch(() =>
      toastr.showToast('Problema ao carregar informação do usuário.', ERROR),
    );
};

const loginUserEmailError = (err, dispatch) => {
  let message;
  switch (err.code) {
    case 'auth/invalid-email':
      message = 'Email inválido!';
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
    case 'auth/invalid-credential':
      message = 'Email/Senha inválida!';
      break;
    default:
      message = err.code;
  }

  dispatch({type: LOGIN_ERROR}, toastr.showToast(message, ERROR));
};

export const authUserGoogle = () => async dispatch => {
  dispatch({type: LOGIN_GOOGLE_IN_PROGRESS});

  GoogleSignin.signIn()
    .then(async res => {
      const data = await GoogleSignin.getTokens();

      const googleCredential = GoogleAuthProvider.credential(
        data.idToken,
        data.accessToken,
      );

      const userCredential = await getAuth().signInWithCredential(
        googleCredential,
      );

      const {name, email, photo} = res.data.user;
      const emailB64 = b64.encode(email);

      const userSnapshot = await getDatabase()
        .ref(`/users/${emailB64}`)
        .once('value');

      let photoURL = photo;

      if (!userSnapshot.exists()) {
        if (photo) {
          try {
            const response = await fetch(photo);
            const blob = await response.blob();

            const fileName = `${emailB64}.jpg`;
            const storagePath = `photos_profile/${fileName}`;

            const storageRef = await storage().ref(storagePath).put(blob);

            //photoURL = await storageRef.getDownloadURL();
            //console.log('photoURL', photoURL);
          } catch (error) {
            console.error('Erro ao salvar a foto:', error);
          }
        }

        getDatabase().ref(`/users/${emailB64}`).set({
          name,
          email,
          fileImgPath: null,
          saveProfile: false,
          createdAt: new Date().toISOString(),
        });
      }

      await getDatabase().ref(`/users/${emailB64}`).update({
        email,
        fileImgPath: photoURL,
        fileImgType: 'image/jpg',
      });

      loginUserSuccess(dispatch);
    })
    .catch(err => {
      loginUserGoogleError(err, dispatch);
    });
};

const loginUserGoogleError = (err, dispatch) => {
  let message;
  switch (err.code) {
    case '7':
      message = 'Sem conexão com a internet.';
      break;
    case 'getTokens':
      message = 'Login cancelado.';
      break;
    case '10':
      message = 'Ocorreu um erro ao fazer login.';
      break;
    default:
      message = err.code;
  }

  dispatch(
    {type: LOGIN_GOOGLE_ERROR},
    err.code === '12501'
      ? toastr.showToast(message)
      : toastr.showToast(message, ERROR),
  );
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
    fileImgPath,
    fileImgType,
    photoModify,
    cpfcnpj,
    phone,
    cep,
    number,
    complement,
    address,
  } = dataUser;

  const emailB64 = b64.encode(email);

  const userData = {
    name,
    email,
    cpfcnpj,
    phone,
    cep,
    number,
    complement,
    logradouro: address?.logradouro || '',
    neighborhood: address?.neighborhood || '',
    city: address?.city || '',
    uf: address?.uf || '',
    saveProfile: true,
  };

  const currentUser = getAuth().currentUser;
  if (!currentUser) {
    console.error('Usuário não autenticado');
    saveProfileUserError(new Error('Usuário não autenticado'), dispatch);
    return;
  }

  if (!photoModify) {
    getDatabase()
      .ref(`/users/${emailB64}`)
      .update(userData)
      .then(() => {
        saveProfileUserSuccess(dispatch);

        if (
          navigationService.getPreviousRouteName() === 'FormLogin' ||
          !navigationService.getPreviousRouteName()
        ) {
          navigationService.reset('Main');
        }
      })
      .catch(err => saveProfileUserError(err, dispatch));
  } else {
    const fileExtension = fileImgType.split('/')[1] || 'jpg';
    const fileName = `${emailB64}.${fileExtension}`;

    const storagePath = `photos_profile/${fileName}`;

    const reference = storage().ref(storagePath);

    const uploadPath = fileImgPath;

    reference
      .putFile(uploadPath)
      .then(snapshot => {
        console.log('Upload concluído:', snapshot);
        return reference.getDownloadURL();
      })
      .then(downloadURL => {
        userData.fileImgPath = downloadURL;
        userData.fileImgType = fileImgType;

        return getDatabase().ref(`/users/${emailB64}`).update(userData);
      })
      .then(() => {
        saveProfileUserSuccess(dispatch);

        if (
          navigationService.getPreviousRouteName() === 'FormLogin' ||
          !navigationService.getPreviousRouteName()
        ) {
          navigationService.reset('Main');
        }
      })
      .catch(error => {
        console.error('Erro durante o processo:', error.code, error.message);

        // Tratamento específico para erros de permissão
        if (error.code === 'storage/unauthorized') {
          console.error(
            'Erro de permissão no Storage. Verifique as regras de segurança e se o usuário está autenticado.',
          );
        }

        saveProfileUserError(error, dispatch);
      });
  }
};

const saveProfileUserSuccess = dispatch => {
  dispatch(
    {type: SAVE_PROFILE_SUCCESS},
    toastr.showToast('Perfil salvo com sucesso!', SUCCESS),
    store.delete('deleteAccount'),
  );
};

const saveProfileUserError = (err, dispatch) => {
  dispatch({type: SAVE_PROFILE_ERROR}, err, ERROR);
};

export const deleteAccount = () => async (dispatch, getState) => {
  dispatch({type: DELETE_ACCOUNT_IN_PROGRESS});

  const auth = getAuth();
  const user = auth.currentUser;
  const emailB64 = b64.encode(getState().userReducer.email);

  try {
    await Promise.all([
      getDatabase().ref(`/users/${emailB64}`).remove(),
      deleteFilesByPrefix('orders_logos', emailB64),
      getDatabase().ref(`/orders/${emailB64}`).remove(),
      deleteFilesByPrefix('photos_profile', emailB64),
    ]);

    try {
      await user.delete();
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        await reauthenticateWithRedirect(user, EmailAuthProvider.PROVIDER_ID);
        await user.delete();
      }
    }

    await Promise.all([
      store.delete(['userLogged', 'emailUserLogged', 'asaas_cliente_id']),
    ]);

    dispatch({type: DELETE_ACCOUNT_SUCCESS});
    toastr.showToast('Conta excluída com sucesso!', SUCCESS);
    navigationService.reset('FormLogin');
  } catch (err) {
    dispatch({type: DELETE_ACCOUNT_ERROR});
    toastr.showToast(err.message, ERROR);
    console.error('Erro na exclusão:', err);
  }
};

const deleteFilesByPrefix = async (folder, exactPrefix) => {
  try {
    const storageRef = storage().ref(folder);
    const {items} = await storageRef.listAll();

    const filesToDelete = items.filter(item => {
      const fileName = item.name;
      return fileName.startsWith(exactPrefix);
    });

    if (filesToDelete.length === 0) {
      console.log(
        `Nenhum arquivo encontrado com prefixo "${exactPrefix}" em ${folder}`,
      );
      return true;
    }

    await Promise.all(filesToDelete.map(fileRef => fileRef.delete()));

    console.log(
      `🗑️ ${filesToDelete.length} arquivos deletados (prefixo: "${exactPrefix}")`,
    );
    return true;
  } catch (error) {
    console.error(`❌ Erro ao deletar arquivos em ${folder}:`, {
      code: error.code,
      message: error.message,
    });
    throw error;
  }
};

export const readDataUser = () => async dispatch => {
  const {currentUser} = getAuth();
  const emailUserLogged = await store.get('emailUserLogged');

  if (emailUserLogged === null) {
    store.save('emailUserLogged', currentUser.email);
  }

  let userEmail;
  if (emailUserLogged !== null) {
    userEmail = emailUserLogged;
  } else if (currentUser !== null) {
    userEmail = currentUser.email;
  }

  const userEmailB64 = b64.encode(userEmail);

  getDatabase()
    .ref(`/users/${userEmailB64}`)
    .once('value')
    .then(async snapshot => {
      dispatch({type: DATA_USER, payload: await snapshot.val()});
    })
    .catch(() =>
      toastr.showToast('Problema ao carregar dados do usuário.', ERROR),
    );
};

export const readDataUsersFull = () => async dispatch => {
  getDatabase()
    .ref(`/users`)
    .once('value')
    .then(async snapshot => {
      dispatch({type: DATA_USERS_FULL, payload: await snapshot.val()});
    })
    .catch(() =>
      toastr.showToast('Problema ao carregar todos os usuários.', ERROR),
    );
};

export const forgotPassword = email => dispatch => {
  dispatch({type: FORGOT_PASSWORD_IN_PROGRESS});

  getAuth()
    .sendPasswordResetEmail(email)
    .then(() => {
      dispatch(
        {type: FORGOT_PASSWORD_SUCCESS},
        toastr.showToast(
          'Instruções de redefinição enviadas para o e-mail.',
          SUCCESS,
        ),
      );

      setTimeout(() => {
        navigationService.reset('FormLogin');
      }, 1250);
    })
    .catch(err => {
      dispatch(
        {type: FORGOT_PASSWORD_ERROR},
        toastr.showToast(
          'Problema ao enviar instruções de redefinição.',
          ERROR,
        ),
      );
    });
};

export const modifyPhoto = (fileImgPath, fileImgType) => dispatch => {
  dispatch({type: MODIFY_PHOTO, payload: {fileImgPath, fileImgType}});
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

export const modifyUf = uf => dispatch => {
  dispatch({type: MODIFY_UF, payload: uf});
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
