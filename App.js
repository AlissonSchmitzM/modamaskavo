import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  StatusBar,
} from 'react-native';
import MainStackNavigator from './src/navigator/Navigator';

function App() {
  return (
    <> 
      <StatusBar barStyle={'light-content'} />
      <NavigationContainer>
        <MainStackNavigator />
      </NavigationContainer>
    </>
  );
}

export default App;