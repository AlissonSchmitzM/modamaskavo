import axios from 'axios';

const searchCityName = async (state, name) => {
  const citys = [];
  await axios
    .get(`http://viacep.com.br/ws/${state}/${name}/rua/json/`)
    .then(res => {
      res.data.map(x =>
        citys.indexOf(x.localidade) < 0 ? citys.push(x.localidade) : '',
      );
    })
    .catch(err => {
      console.log(`Erro ao recuperar os dados ${err}`);
    });

  return citys;
};

const searchAddressCompletedByCep = async cep => {
  let addressCompleted;
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    // Criando um objeto com os dados do endereço
    addressCompleted = {
      logradouro: response.data.logradouro,
      bairro: response.data.bairro,
      localidade: response.data.localidade,
      uf: response.data.uf,
    };
  } catch (err) {
    return null;
  }

  return addressCompleted;
};

export default {searchCityName, searchAddressCompletedByCep};
