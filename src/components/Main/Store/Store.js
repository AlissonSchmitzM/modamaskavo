import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import {store_comming} from '../../../assets';
import {SafeAreaView} from 'react-native-safe-area-context';

const Store = () => {
  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: '#f5f5f5'}}
      edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        <Text style={styles.title}>Loja em construção</Text>
        <LottieView
          source={store_comming}
          autoPlay
          loop
          style={{width: 500, height: 500, marginLeft: 100}}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Store;
