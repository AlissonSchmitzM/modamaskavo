import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import MainStackNavigator from './src/navigator/Navigator';

function App() {
  return (
    <>
      <StatusBar backgroundColor="#000000FF" />
      <NavigationContainer>
        <MainStackNavigator />
      </NavigationContainer>
    </>
  );
}

export default App;
