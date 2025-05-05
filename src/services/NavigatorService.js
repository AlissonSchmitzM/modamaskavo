import {
  createNavigationContainerRef,
  CommonActions,
} from '@react-navigation/native';

// Cria uma referência para o navegador
export const navigationRef = createNavigationContainerRef();

// Navega para uma rota específica
function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

// Navega para uma rota com parâmetros (mantido para compatibilidade com seu código)
function navigateWithParams(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

// Método para resetar a navegação para uma rota específica
function reset(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{name, params}],
    });
  }
}

// Método para voltar
function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export default {
  navigate,
  navigateWithParams,
  reset,
  goBack,
  navigationRef,
};
