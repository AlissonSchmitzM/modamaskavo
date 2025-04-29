import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const Profile = () => {
  return (
    <View>
      <Text style={styles.title}>Perfil</Text>
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
export default Profile;
