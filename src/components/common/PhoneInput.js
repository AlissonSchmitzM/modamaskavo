import React, {useState, useEffect} from 'react';
import {TextInput} from 'react-native-paper';

const PhoneInput = props => {
  const [value, setValue] = useState(props.value || '');

  useEffect(() => {
    setValue(props.value || '');
  }, [props.value]);

  // Função para formatar número de celular conforme digitação
  const formatPhoneNumber = text => {
    // Remove todos os caracteres não numéricos
    const cleanText = text.replace(/\D/g, '');

    // Formata como celular: (XX) XXXXX-XXXX
    let formatted = cleanText;

    // Adiciona parênteses para DDD
    if (cleanText.length > 0) {
      formatted = `(${cleanText.substring(0, 2)}`;

      // Fecha parênteses após DDD
      if (cleanText.length > 2) {
        formatted = `${formatted}) ${cleanText.substring(2)}`;
      }

      // Adiciona hífen após 7º dígito (considerando DDD)
      if (cleanText.length > 7) {
        formatted = `${formatted.substring(0, 10)}-${formatted.substring(10)}`;
      }
    }

    return formatted;
  };

  // Função para lidar com a mudança de texto
  const handleChange = text => {
    const formatted = formatPhoneNumber(text);
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
      label={props.label || 'Celular'}
      value={value}
      onChangeText={handleChange}
      keyboardType="numeric"
      mode="outlined"
      textColor="#000"
      placeholder={props.placeholder || '(XX) XXXXX-XXXX'}
      maxLength={15} // Tamanho máximo para número formatado
      theme={{
        colors: {primary: '#000000', onSurfaceVariant: '#999999'},
      }}
      {...otherProps} // Repassa todas as outras props
    />
  );
};

export default PhoneInput;
