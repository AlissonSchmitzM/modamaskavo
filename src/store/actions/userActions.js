// Definindo os tipos de ações
export const FETCH_ADDRESS_REQUEST = 'FETCH_ADDRESS_REQUEST';
export const FETCH_ADDRESS_SUCCESS = 'FETCH_ADDRESS_SUCCESS';
export const FETCH_ADDRESS_FAILURE = 'FETCH_ADDRESS_FAILURE';
export const MODIFY_ADDRESS = 'MODIFY_ADDRESS';
export const MODIFY_NEIGHBORHOOD = 'MODIFY_NEIGHBORHOOD';
export const MODIFY_CITY = 'MODIFY_CITY';
export const MODIFY_STATE = 'MODIFY_STATE';

// Action creators simples
export const fetchAddressRequest = () => ({
  type: FETCH_ADDRESS_REQUEST,
});

export const fetchAddressSuccess = address => ({
  type: FETCH_ADDRESS_SUCCESS,
  payload: address,
});

export const fetchAddressFailure = error => ({
  type: FETCH_ADDRESS_FAILURE,
  payload: error,
});

// Action creator thunk para buscar o endereço
export const fetchAddressByCep = cep => {
  return async dispatch => {
    dispatch(fetchAddressRequest());

    try {
      // Importando seu serviço ViaCEP
      const ViaCepService = require('../../services/ViaCepService').default;
      const address = await ViaCepService.searchAddressCompletedByCep(cep);

      if (address.estado !== undefined && address.localidade !== undefined) {
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

export const modifyNeighborhood = bairro => dispatch => {
  dispatch({type: MODIFY_NEIGHBORHOOD, payload: bairro});
};

export const modifyCity = localidade => dispatch => {
  dispatch({type: MODIFY_CITY, payload: localidade});
};

export const modifyState = estado => dispatch => {
  dispatch({type: MODIFY_STATE, payload: estado});
};
