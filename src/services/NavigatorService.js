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

// Função para obter a rota anterior
function getPreviousRoute() {
  if (navigationRef.isReady()) {
    const state = navigationRef.getState();
    if (state.routes.length > 1) {
      const currentRouteIndex = state.index;
      if (currentRouteIndex > 0) {
        return state.routes[currentRouteIndex - 1];
      }
    }
    return null; // Retorna null se não houver rota anterior
  }
  return null;
}

function resetPreviousRoute() {
  if (navigationRef.isReady()) {
    const state = navigationRef.getState();
    if (state.routes.length > 1) {
      const currentRouteIndex = state.index;

      if (currentRouteIndex > 0) {
        // Cria um novo array de rotas excluindo a rota anterior
        const newRoutes = [...state.routes];
        newRoutes.splice(currentRouteIndex - 1, 1);

        // Ajusta o índice atual (será decrementado em 1 porque removemos a rota anterior)
        const newIndex = currentRouteIndex - 1;

        // Aplica a ação de reset com as novas rotas
        navigationRef.dispatch(
          CommonActions.reset({
            index: newIndex,
            routes: newRoutes,
          }),
        );
      }
    }
  }
}

// Função para obter o nome da rota anterior
function getPreviousRouteName() {
  const previousRoute = getPreviousRoute();
  return previousRoute ? previousRoute.name : null;
}

export default {
  navigate,
  navigateWithParams,
  reset,
  goBack,
  navigationRef,
  getPreviousRouteName,
  resetPreviousRoute,
};
