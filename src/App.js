import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import store from './store';
import MainStackNavigator from './Navigator';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {navigationRef} from './services/NavigatorService';
import {en, registerTranslation} from 'react-native-paper-dates';
import Toast from 'react-native-toast-message';
import {toastConfig} from './services/toastr';

registerTranslation('en', en);

export default function App() {
  return (
    <>
      <SafeAreaProvider>
        <StatusBar backgroundColor="#000000FF" />
        <Provider store={store}>
          <NavigationContainer ref={navigationRef}>
            <MainStackNavigator />
          </NavigationContainer>
        </Provider>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </>
  );
}
