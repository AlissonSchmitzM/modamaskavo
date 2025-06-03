import React, {useRef, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar, BackHandler, Platform, ToastAndroid} from 'react-native';
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
  const backPressedOnce = useRef(false);

  useEffect(() => {
    const isAtRootScreen = () => {
      if (navigationRef.current) {
        const state = navigationRef.current.getRootState();
        return (
          state &&
          state.routes &&
          state.routes.length === 1 &&
          state.index === 0
        );
      }
      return true;
    };

    const handleBackPress = () => {
      if (isAtRootScreen()) {
        if (backPressedOnce.current) {
          return false;
        } else {
          backPressedOnce.current = true;

          if (Platform.OS === 'android') {
            ToastAndroid.show(
              'Pressione novamente para sair',
              ToastAndroid.SHORT,
            );
          } else {
            Toast.show({
              type: 'info',
              text1: 'Pressione novamente para sair',
              position: 'bottom',
            });
          }

          setTimeout(() => {
            backPressedOnce.current = false;
          }, 2000);

          return true;
        }
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <>
      <SafeAreaProvider>
        <StatusBar backgroundColor="#000000FF" />
        <Provider store={store}>
          <NavigationContainer ref={navigationRef}>
            <MainStackNavigator />
          </NavigationContainer>
          <Toast config={toastConfig} />
        </Provider>
      </SafeAreaProvider>
    </>
  );
}
