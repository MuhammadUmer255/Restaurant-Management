import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0B101D" />
      <AppNavigator />
    </>
  );
};

export default App;