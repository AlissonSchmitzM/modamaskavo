import { NavigationActions } from 'react-navigation';

let navigator;

function setTopLevelNavigator(navigatorRef) {
    navigator = navigatorRef;
}

function navigate(routeName) {
    navigator.dispatch(
        NavigationActions.navigate({
            routeName
        })
    );
}

function navigateWithParams(routeName, params) {
    navigator.dispatch(
        NavigationActions.navigate({
            routeName,
            params
        })
    );
}

export default { navigate, navigateWithParams, setTopLevelNavigator };
