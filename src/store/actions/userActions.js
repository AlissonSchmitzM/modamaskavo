import toastr, {SUCCESS, ERROR} from '../../services/toastr';
import b64 from 'base-64';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
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
} from './actionTypes';

export const signOut = () => dispatch => {
  const {currentUser} = auth();

  auth()
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

      navigationService.reset('FormLogin');
      dispatch({type: SIGN_OUT});
    })
    .catch(() => toastr.showToast('Problema ao sair da conta.', ERROR));
};

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

      if (!address.estado !== undefined && address.localidade !== undefined) {
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
  store.save('userLogged', true);

  const {currentUser} = auth();
  const userEmailB64 = b64.encode(currentUser.email);

  database()
    .ref(`/users/${userEmailB64}/saveProfile`)
    .once('value')
    .then(async snapshot => {
      const saveProfile = await snapshot.val();

      dispatch(
        {type: LOGIN_SUCCESS},
        navigationService.reset(saveProfile ? 'Main' : 'FormProfile'),
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
      // Obter tokens explicitamente
      const data = await GoogleSignin.getTokens();

      // Criar credencial para o Firebase
      const googleCredential = auth.GoogleAuthProvider.credential(
        data.idToken,
        data.accessToken,
      );

      // Login no Firebase
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      // Extrair informações do usuário Google
      const {name, email, photo} = res.data.user;
      const emailB64 = b64.encode(email);

      // Verificar se é a primeira vez do usuário no Realtime Database
      const userSnapshot = await database()
        .ref(`/users/${emailB64}`)
        .once('value');

      // Variável para armazenar a URL da foto no storage
      let photoURL = photo;

      if (!userSnapshot.exists()) {
        console.log('Novo usuário! Salvando informações...');

        // Se houver foto, baixar e salvar no storage
        if (photo) {
          try {
            // Baixar a imagem
            const response = await fetch(photo);
            const blob = await response.blob();

            const fileName = `${emailB64}.jpg`;
            // Caminho do arquivo no Firebase Storage
            const storagePath = `photos_profile/${fileName}`;

            // Referência para o storage
            const storageRef = storage().ref(storagePath).put(blob);

            // Obter a URL da imagem salva
            photoURL = await storageRef.getDownloadURL();
            console.log('Foto salva com sucesso:', photoURL);
          } catch (error) {
            console.error('Erro ao salvar a foto:', error);
            // Se falhar, mantém a URL original
          }
        }

        database().ref(`/users/${emailB64}`).set({
          name,
          email,
          fileImgPath: null,
          saveProfile: false,
          createdAt: new Date().toISOString(),
        });
      }

      // Manter a atualização no Realtime Database conforme seu código original
      await database().ref(`/users/${emailB64}`).update({
        email,
        fileImgPath: photoURL,
        fileImgType: 'image/jpg',
      });

      console.log('Usuário atualizado no Realtime Database');

      // Chamar função de sucesso
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
  // TODO: create welcome window
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

  // Dados do usuário para salvar no banco
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
    state: address?.state || '',
    saveProfile: true,
  };

  // Verificar se o usuário está autenticado
  const currentUser = auth().currentUser;
  if (!currentUser) {
    // Se não estiver autenticado, tentar autenticar anonimamente ou redirecionar para login
    console.error('Usuário não autenticado');
    saveProfileUserError(new Error('Usuário não autenticado'), dispatch);
    return;
  }

  // Se não houver modificação na foto, apenas atualize os dados
  if (!photoModify) {
    database()
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
    // Determinar a extensão do arquivo
    const fileExtension = fileImgType.split('/')[1] || 'jpg';
    const fileName = `${emailB64}.${fileExtension}`;

    // Caminho do arquivo no Firebase Storage
    const storagePath = `photos_profile/${fileName}`;

    // Referência para o arquivo no Firebase Storage
    const reference = storage().ref(storagePath);

    // Caminho do arquivo local
    const uploadPath = fileImgPath;

    // Upload do arquivo para o Firebase Storage com tratamento de erros melhorado
    reference
      .putFile(uploadPath)
      .then(snapshot => {
        console.log('Upload concluído:', snapshot);
        // Obter a URL de download após o upload
        return reference.getDownloadURL();
      })
      .then(downloadURL => {
        // Adicionar a URL da imagem aos dados do usuário
        userData.fileImgPath = downloadURL;
        userData.fileImgType = fileImgType;

        console.log('Salvando dados do usuário no banco...');
        // Salvar todos os dados do usuário no banco
        return database().ref(`/users/${emailB64}`).set(userData);
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
  );
};

const saveProfileUserError = (err, dispatch) => {
  dispatch({type: SAVE_PROFILE_ERROR}, err, ERROR);
};

export const readDataUser = () => async dispatch => {
  const {currentUser} = auth();
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

  database()
    .ref(`/users/${userEmailB64}`)
    .once('value')
    .then(async snapshot => {
      dispatch({type: DATA_USER, payload: await snapshot.val()});
    })
    .catch(() =>
      toastr.showToast('Problema ao carregar dados do usuário.', ERROR),
    );
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
