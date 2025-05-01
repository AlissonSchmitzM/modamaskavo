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

const searchCityCEP = async cep => {
  let city;
  await axios
    .get(`http://viacep.com.br/ws/${cep}/json/`)
    .then(res => {
      city = res.data.localidade;
    })
    .catch(err => {
      console.log(`Erro ao recuperar os dados ${err}`);
    });

  return city;
};

export default {searchCityName, searchCityCEP};
