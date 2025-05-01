import Toast from 'react-native-toast-message';

// Tipos de Toast
export const INFO = 'info';
export const SUCCESS = 'success';
export const ERROR = 'error';

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
};

export default toastr;
