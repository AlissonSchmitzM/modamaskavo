import {Linking} from 'react-native';
import toastr, {ERROR, SUCCESS} from '../../services/toastr';
import {getDatabase, ref, set} from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import b64 from 'base-64';
import {
  ORDER_REGISTRATION_IN_PROGRESS,
  ORDER_REGISTRATION_ERROR,
  ORDER_REGISTRATION_SUCCESS,
  MODIFY_SEGMENT,
  MODIFY_TAM,
  MODIFY_DESCRIPTION,
  MODIFY_TYPE,
  MODIFY_AMOUNT_PIECES,
  DATA_ORDERS,
} from './actionTypes';
import {PENDENTE} from '../../components/Main/Orders/Situacoes';
import NavigatorService from '../../services/NavigatorService';
import store from '../../services/AsyncStorage';
import {getAuth} from '@react-native-firebase/auth';

export const createOrder = data => (dispatch, getState) => {
  dispatch({type: ORDER_REGISTRATION_IN_PROGRESS});

  const {email, name, cpfcnpj, phone, cep, number, complement, address} =
    getState().userReducer;

  const userEmailB64 = b64.encode(email);
  const {type} = data;

  let message = `🪡 *DADOS DO CLIENTE* 🪡

  📋 Nome: ${name}
  ✉️ Email: ${email}
  📝 CPF/CNPJ: ${cpfcnpj}
  📱 Celular: ${phone}
  📮 CEP: ${cep}
  🏠 Endereço: ${address?.logradouro}
  🔢 Número: ${number}
  🔍 Complemento: ${complement ? complement : ''}
  🏙️ Bairro: ${address?.neighborhood}
  🌆 Cidade/Estado: ${address?.city}/${address?.state}
  
  `;

  getDatabase()
    .ref(`/config/phone_orders`)
    .once('value')
    .then(async snapshot => {
      const phone_orders = await snapshot.val();

      // Em comum
      const {segment, description} = data;

      const message_2 = `👕 *PEDIDO* ${
        type === 'exclusive' ? '*PEÇA EXCLUSIVA*' : '*UNIFORME*'
      } 👕
  
  🏢 Segmento: ${segment}
  `;
      const message_3 = `
  🗒️ Descrição: ${description}`;
      if (type === 'exclusive') {
        const {tam} = data;

        message += message_2 + `📏 Tamanho: ${tam}` + message_3;

        getDatabase()
          .ref(`/orders/${userEmailB64}`)
          .push({
            type,
            segment,
            tam,
            description,
            situation: PENDENTE.description,
            createdAt: new Date().toISOString(),
          })
          .then(() => {
            orderSaveSuccess(dispatch);

            Linking.openURL(
              `whatsapp://send?phone=${phone_orders}&text=${encodeURIComponent(
                message,
              )}`,
            );
          })
          .catch(err => orderSaveError(err, dispatch));
      } else if (type === 'uniform') {
        const {amountPieces, selectedLogos} = data;

        message +=
          message_2 + `📏 Quantidade de Peças: ${amountPieces}` + message_3;

        // Array para armazenar as promessas de upload
        const uploadPromises = [];

        // Array para armazenar os URLs dos arquivos
        const logoURLs = [];

        selectedLogos.forEach((logo, index) => {
          // Extrair a extensão do arquivo
          const fileType = logo.type || 'image/jpeg';
          const fileExtension = fileType.split('/')[1] || 'jpg';

          const orderID = Date.now().toString();
          // Criar um nome único para o arquivo
          const fileName = `${userEmailB64}_order_${orderID}_logo_${index}.${fileExtension}`;

          // Caminho no Storage
          const storagePath = `orders_logos/${fileName}`;

          // Criar referência para o Storage
          const reference = storage().ref(storagePath);

          // Adicionar a promessa de upload ao array
          const uploadPromise = reference
            .putFile(logo.uri)
            .then(snapshot => {
              console.log(`Upload do logo ${index} concluído:`, snapshot);
              return reference.getDownloadURL();
            })
            .then(downloadURL => {
              // Armazenar a URL do arquivo
              logoURLs.push({
                url: downloadURL,
                type: fileType,
                fileName: logo.fileName || `Logo ${index + 1}`,
              });
            });

          uploadPromises.push(uploadPromise);
        });

        // Aguardar todos os uploads serem concluídos
        Promise.all(uploadPromises)
          .then(() => {
            // Agora salvar o pedido com os links dos logos
            return getDatabase().ref(`/orders/${userEmailB64}`).push({
              type,
              segment,
              amountPieces,
              description,
              logos: logoURLs, // Salvar os URLs dos logos
              situation: PENDENTE.description,
              createdAt: new Date().toISOString(),
            });
          })
          .then(() => {
            orderSaveSuccess(dispatch);

            // Adicionar informação sobre os logos na mensagem
            message += `\n\n📎 *${logoURLs.length} arquivo(s) de logo foram enviados e estão disponíveis no aplicativo.*`;

            // Adicionar cada logo com seu nome e link
            logoURLs.forEach((logo, index) => {
              message += `\n📌 Logo ${index + 1} - ${logo.fileName}: ${
                logo.url
              }`;
            });

            Linking.openURL(
              `whatsapp://send?phone=${phone_orders}&text=${encodeURIComponent(
                message,
              )}`,
            );
          })
          .catch(error => {
            console.error(
              'Erro durante o upload de logos:',
              error.code,
              error.message,
            );
            orderSaveError(error, dispatch);
          });
      }
    });
};

export const readDataOrders = () => async dispatch => {
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
    .ref(`/orders/${userEmailB64}`)
    .on('value', async snapshot => {
      const orders = await snapshot.val();
      dispatch({type: DATA_ORDERS, payload: orders});
    });
};

export const orderSaveSuccess = dispatch => {
  dispatch(
    {type: ORDER_REGISTRATION_SUCCESS},
    toastr.showToast('Pedido enviado com sucesso!', SUCCESS),
    NavigatorService.navigate('OrdersInProgress'),
  );
};

const orderSaveError = (err, dispatch) => {
  dispatch({type: ORDER_REGISTRATION_ERROR}, toastr.showToast(err, ERROR));
};

export const modifyType = type => dispatch => {
  dispatch({type: MODIFY_TYPE, payload: type});
};

export const modifySegment = segment => dispatch => {
  dispatch({type: MODIFY_SEGMENT, payload: segment});
};

export const modifyAmountPieces = amountPieces => dispatch => {
  dispatch({type: MODIFY_AMOUNT_PIECES, payload: amountPieces});
};

export const modifyTam = tam => dispatch => {
  dispatch({type: MODIFY_TAM, payload: tam});
};

export const modifyDescription = description => dispatch => {
  dispatch({type: MODIFY_DESCRIPTION, payload: description});
};
