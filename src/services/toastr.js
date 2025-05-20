import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';

// Tipos de Toast
export const INFO = 'info';
export const SUCCESS = 'success';
export const ERROR = 'error';
export const CUSTOM = 'meuTipoCustomizado';

// Componente de toast personalizado
const CustomToast = ({text1, text2}) => (
  <View style={styles.customToast}>
    <Text style={styles.text1}>{text1}</Text>
    {text2 && <Text style={styles.text2}>{text2}</Text>}
  </View>
);

// Configuração do toast
export const toastConfig = {
  // Personalizando tipos existentes
  success: props => (
    <BaseToast
      {...props}
      style={{borderLeftColor: '#2ecc71' /*, backgroundColor: '#f0fff0'*/}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{fontSize: 14, fontWeight: 'bold', flexWrap: 'wrap'}}
      text2Style={{fontSize: 14}}
      text1NumberOfLines={3}
      text2NumberOfLines={3}
    />
  ),

  error: props => (
    <ErrorToast
      {...props}
      style={{borderLeftColor: '#e74c3c'}}
      text1Style={{fontSize: 14, fontWeight: 'bold', flexWrap: 'wrap'}}
      text2Style={{fontSize: 14}}
      text1NumberOfLines={3}
      text2NumberOfLines={3}
    />
  ),

  info: props => (
    <BaseToast
      {...props}
      style={{borderLeftColor: '#3498db'}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{fontSize: 14, fontWeight: 'bold', flexWrap: 'wrap'}}
      text2Style={{fontSize: 14}}
      text1NumberOfLines={3}
      text2NumberOfLines={3}
    />
  ),

  // Tipo personalizado
  meuTipoCustomizado: props => <CustomToast {...props} />,
};

const toastr = {
  showToast: (text1, type = INFO, duration = 2500) => {
    Toast.show({
      type,
      text1,
      position: 'top',
      visibilityTime: duration,
    });
  },
  showToastTitle: (text1, text2 = '', type = INFO, duration = 2500) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: duration,
    });
  },
  // Método adicional para usar o toast personalizado
  showCustomToast: (text1, text2 = '', duration = 2500) => {
    Toast.show({
      type: CUSTOM,
      text1,
      text2,
      position: 'top',
      visibilityTime: duration,
    });
  },
};

const styles = StyleSheet.create({
  customToast: {
    height: 60,
    width: '90%',
    backgroundColor: '#000000FF',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  text1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  text2: {
    fontSize: 14,
    color: '#f1f1f1',
    marginTop: 5,
  },
});

export default toastr;
