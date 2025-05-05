import React, {useState, useEffect} from 'react';
import {TextInput} from 'react-native-paper';

const CepInput = props => {
  const [value, setValue] = useState(props.value || '');

  useEffect(() => {
    setValue(props.value || '');
  }, [props.value]);

  // Função para formatar CEP conforme digitação
  const formatCep = text => {
    // Remove todos os caracteres não numéricos
    const cleanText = text.replace(/\D/g, '');

    // Formata como CEP: XXXXX-XXX
    let formatted = cleanText;

    // Adiciona hífen após o 5º dígito
    if (cleanText.length > 5) {
      formatted = `${cleanText.substring(0, 5)}-${cleanText.substring(5)}`;
    }

    return formatted;
  };

  // Função para lidar com a mudança de texto
  const handleChange = text => {
    const formatted = formatCep(text);
    setValue(formatted);

    // Chama o onChangeText original se existir, passando tanto o valor formatado
    // quanto o valor limpo (apenas números)
    if (props.onChangeText) {
      const cleanValue = formatted.replace(/\D/g, '');
      props.onChangeText(formatted, cleanValue);
    }
  };

  // Função para lidar com o evento de perda de foco
  const handleBlur = () => {
    // Obtém apenas os números do valor atual
    const cleanValue = value.replace(/\D/g, '');

    // Verifica se o CEP está completo (8 dígitos)
    if (cleanValue.length === 8) {
      // Se o componente recebeu a prop onCompleteCep, chama essa função
      if (props.onCompleteCep) {
        props.onCompleteCep(value, cleanValue);
      }
    }

    // Chama o onBlur original se existir
    if (props.onBlur) {
      props.onBlur();
    }
  };

  // Extraímos as props que queremos tratar de forma especial
  const {
    onChangeText,
    value: propValue,
    style,
    onBlur,
    onCompleteCep, // Nova prop específica para CEP completo
    ...otherProps
  } = props;

  return (
    <TextInput
      label="CEP"
      value={value}
      onChangeText={handleChange}
      onBlur={handleBlur} // Adiciona o handler de onBlur
      keyboardType="numeric"
      style={[style]} // Mantém o estilo passado como prop
      mode="outlined"
      placeholder="XXXXX-XXX"
      maxLength={9} // Tamanho máximo para CEP formatado (5 dígitos + hífen + 3 dígitos)
      theme={{colors: {primary: '#000000'}}}
      {...otherProps} // Repassa todas as outras props
    />
  );
};

export default CepInput;
