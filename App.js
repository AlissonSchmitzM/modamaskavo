import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import store from './src/store';
import MainStackNavigator from './src/navigator/Navigator';

function App() {
  return (
    <>
      <StatusBar backgroundColor="#000000FF" />
      <Provider store={store}>
        <NavigationContainer>
          <MainStackNavigator />
        </NavigationContainer>
      </Provider>
    </>
  );
}

export default App;
