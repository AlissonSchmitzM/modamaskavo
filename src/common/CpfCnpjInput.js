import React, {useState, useEffect} from 'react';
import {TextInput} from 'react-native-paper';

const CpfCnpjInput = props => {
  const [value, setValue] = useState(props.value || '');

  useEffect(() => {
    setValue(props.value || '');
  }, [props.value]);

  // Função para formatar CPF ou CNPJ conforme digitação
  const formatCpfCnpj = text => {
    // Remove todos os caracteres não numéricos
    const cleanText = text.replace(/\D/g, '');

    // Verifica se é CPF ou CNPJ baseado no comprimento
    if (cleanText.length <= 11) {
      // Formata como CPF: 000.000.000-00
      let formatted = cleanText;
      if (cleanText.length > 3) {
        formatted = `${cleanText.substring(0, 3)}.${cleanText.substring(3)}`;
      }
      if (cleanText.length > 6) {
        formatted = `${formatted.substring(0, 7)}.${formatted.substring(7)}`;
      }
      if (cleanText.length > 9) {
        formatted = `${formatted.substring(0, 11)}-${formatted.substring(11)}`;
      }
      return formatted;
    } else {
      // Formata como CNPJ: 00.000.000/0000-00
      let formatted = cleanText;
      if (cleanText.length > 2) {
        formatted = `${cleanText.substring(0, 2)}.${cleanText.substring(2)}`;
      }
      if (cleanText.length > 5) {
        formatted = `${formatted.substring(0, 6)}.${formatted.substring(6)}`;
      }
      if (cleanText.length > 8) {
        formatted = `${formatted.substring(0, 10)}/${formatted.substring(10)}`;
      }
      if (cleanText.length > 12) {
        formatted = `${formatted.substring(0, 15)}-${formatted.substring(15)}`;
      }
      return formatted;
    }
  };

  // Função para lidar com a mudança de texto
  const handleChange = text => {
    const formatted = formatCpfCnpj(text);
    setValue(formatted);

    // Chama o onChangeText original se existir, passando tanto o valor formatado
    // quanto o valor limpo (apenas números)
    if (props.onChangeText) {
      const cleanValue = formatted.replace(/\D/g, '');
      props.onChangeText(formatted, cleanValue);
    }
  };

  // Extraímos as props que queremos tratar de forma especial
  const {onChangeText, value: propValue, ...otherProps} = props;

  return (
    <TextInput
      label={props.label || 'CPF/CNPJ'}
      value={value}
      onChangeText={handleChange}
      keyboardType="numeric"
      mode="outlined"
      maxLength={18} // Tamanho máximo para CNPJ formatado
      theme={{colors: {primary: '#000000'}}}
      {...otherProps} // Repassa todas as outras props
    />
  );
};

export default CpfCnpjInput;
