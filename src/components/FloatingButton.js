import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FloatingButton = ({onPress}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.fab} onPress={onPress}>
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 16,
    marginRight: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000FF',
    elevation: 4,
  },
});

export default FloatingButton;
