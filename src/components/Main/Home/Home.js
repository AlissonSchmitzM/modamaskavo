import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';

const Home = ({navigation}) => {
  return (
    <View>
      <Text style={styles.title}>Home</Text>
      <Button
        title="Ir para produtos"
        onPress={() => navigation.navigate('WooCommerceProducts')}
      />
    </View>
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
