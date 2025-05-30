import React, {Component} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {signOut} from '../../../store/actions/userActions';
import {connect} from 'react-redux';
import navigation from '../../../services/NavigatorService';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Avatar, Card} from 'react-native-paper';
import {colors} from '../../../styles';
import styles from './Styles';

const data = [
  {id: 1, title: 'Informações Pessoais', icon: 'person-circle-outline'},
  {id: 2, title: 'Meus Pedidos', icon: 'cart-outline'},
  {id: 3, title: 'Gerenciar Pedidos', icon: 'reader-outline'},
  {id: 4, title: 'Configurações', icon: 'build-outline'},
  {id: 5, title: 'Finalizar Sessão', icon: 'log-out-outline'},
];

class Profile extends Component {
  constructor(props) {
    super(props);
  }

  handlePress = item => {
    if (item.title === 'Informações Pessoais') {
      navigation.navigate('FormProfile');
    } else if (item.title === 'Meus Pedidos') {
      navigation.navigate('MyOrders');
    } else if (item.title === 'Gerenciar Pedidos') {
      navigation.navigate('ManagerOrders');
    } else if (item.title === 'Configurações') {
      navigation.navigate('FormConfig');
    } else if (item.title === 'Finalizar Sessão') {
      this.props.onSignout();
    }
  };

  getFiltrarDados = () => {
    if (!this.props.admin) {
      return data.filter(item => item.id !== 3 && item.id !== 4);
    }
    return data;
  };

  render() {
    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: '#f5f5f5'}}
        edges={['bottom', 'left', 'right']}>
        <Card
          style={{
            backgroundColor: '#E9E9E9FF',
            borderBottomWidth: 1,
            borderColor: '#ccc',
            borderRadius: 0,
          }}>
          <Card.Content>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  borderColor: '#7E7D7DFF',
                  borderRadius: 50,
                  borderWidth: 1,
                }}>
                {this.props.fileImgPath ? (
                  <Avatar.Image
                    size={100}
                    source={{uri: this.props.fileImgPath}}
                  />
                ) : (
                  <Avatar.Text
                    color="#FFF"
                    backgroundColor={colors.SECONDARY}
                    size={100}
                    label={this.props.name.charAt(0)}
                  />
                )}
              </View>
              <View style={{marginLeft: 20, flex: 1, justifyContent: 'center'}}>
                <Text style={{fontWeight: 600, fontSize: 20}}>
                  {this.props.name}
                </Text>
                <Text>{this.props.email}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <FlatList
          data={this.getFiltrarDados()}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => this.handlePress(item)}>
              <View style={styles.iconText}>
                <Icon
                  name={item.icon}
                  size={20}
                  color="#000"
                  style={styles.icon}
                />
                <Text style={styles.title}>{item.title}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#000" />
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onSignout: () => dispatch(signOut()),
});

const mapStateToProps = state => ({
  admin: state.userReducer.admin,
  fileImgPath: state.userReducer.fileImgPath,
  name: state.userReducer.name,
  email: state.userReducer.email,
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
