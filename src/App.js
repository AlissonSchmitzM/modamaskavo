import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import store from './store';
import MainStackNavigator from './Navigator';
import {navigationRef} from './services/NavigatorService';

function App() {
  return (
    <>
      <StatusBar backgroundColor="#000000FF" />
      <Provider store={store}>
        <NavigationContainer ref={navigationRef}>
          <MainStackNavigator />
        </NavigationContainer>
      </Provider>
    </>
  );
}

export default App;
