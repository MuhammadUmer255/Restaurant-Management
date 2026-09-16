import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070E20" />
      <Text style={styles.title}>GourmetOS POS</Text>
      <Text style={styles.subtitle}>Terminal Connected Successfully!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070E20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#ff7a1a',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 8,
  },
});

export default App;