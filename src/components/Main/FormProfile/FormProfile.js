import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const data = [
  {id: '1', title: 'Informações Pessoais', icon: 'person-circle-outline'},
  {id: '2', title: 'Meus Pedidos', icon: 'cart-outline'},
  {id: '3', title: 'Finalizar Sessão', icon: 'log-out-outline'},
];

const Profile = ({navigation}) => {
  // Função para lidar com o clique em um item
  const handlePress = item => {
    //Alert.alert('Item Clicado', `Você clicou em: ${item.title}`);
    if (item.title === 'Meus Pedidos') {
      navigation.navigate('Orders');
    }
  };

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <TouchableOpacity style={styles.item} onPress={() => handlePress(item)}>
          <View style={styles.iconText}>
            <Icon name={item.icon} size={20} color="#000" style={styles.icon} />
            <Text style={styles.title}>{item.title}</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#000" />
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
  iconText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
  },
});

export default Profile;
