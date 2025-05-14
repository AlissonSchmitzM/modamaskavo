import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

const Home = ({navigation}) => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <Text style={styles.title}>Home</Text>
      <Button
        title="Ir para produtos"
        onPress={() => navigation.navigate('WooCommerceProducts')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
export default Home;
