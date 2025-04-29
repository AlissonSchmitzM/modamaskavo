import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const data = [
  {id: '1', title: 'Opção 1'},
  {id: '2', title: 'Opção 2'},
  {id: '3', title: 'Opção 3'},
  {id: '4', title: 'Opção 4'},
];

const OptionsList = () => {
  // Função para lidar com o clique em um item
  const handlePress = item => {
    Alert.alert('Item Clicado', `Você clicou em: ${item.title}`);
    // Aqui você pode adicionar a lógica que deseja executar ao clicar em um item
  };

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <TouchableOpacity style={styles.item} onPress={() => handlePress(item)}>
          <Text style={styles.title}>{item.title}</Text>
          <Icon name="chevron-right" size={20} color="#000" />
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
  },
});

export default OptionsList;
