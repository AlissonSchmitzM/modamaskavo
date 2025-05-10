import React, {Component} from 'react';
import {View, Image, StyleSheet, Text} from 'react-native';
import navigationService from '../services/NavigatorService';
import store from '../services/AsyncStorage';
import database from '@react-native-firebase/database';
import b64 from 'base-64';

export default class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUserLogged: false,
      checkCompleted: false,
    };
  }

  componentDidMount() {
    // Inicia a verificação de login
    this.checkUserLogin();

    // Define o timer para a splash screen
    this.timer = setTimeout(() => {
      this.navigateBasedOnLogin();
    }, 3000);
  }

  componentWillUnmount() {
    // Limpa o timer quando o componente é desmontado
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  async checkUserLogin() {
    try {
      const isUserLoggedd = await store.get('userLogged');
      this.setState({
        isUserLogged: isUserLoggedd !== null && isUserLoggedd === true,
        checkCompleted: true,
      });

      const emailUserLogged = await store.get('emailUserLogged');
      if (emailUserLogged) {
        const emailB64 = b64.encode(emailUserLogged);
        database()
          .ref(`/users/${emailB64}/saveProfile`)
          .once('value')
          .then(async snapshot => {
            const saveProfile = await snapshot.val();

            this.setState({
              isUserLogged: saveProfile,
              checkCompleted: true,
            });
          })
          .catch(() =>
            toastr.showToast(
              'Problema ao carregar informação do usuário.',
              ERROR,
            ),
          );
      }
    } catch (error) {
      console.error('Erro ao verificar login:', error);
      this.setState({checkCompleted: true});
    }
  }

  navigateBasedOnLogin() {
    // Se a verificação foi concluída, navega com base no resultado
    if (this.state.checkCompleted) {
      if (this.state.isUserLogged) {
        navigationService.navigate('Main');
      } else {
        navigationService.navigate('FormLogin');
      }
    } else {
      // Se a verificação ainda não foi concluída, tenta novamente em 100ms
      setTimeout(() => this.navigateBasedOnLogin(), 100);
    }
  }

  render() {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('../imgs/logo.png')}
          style={styles.splashImage}
        />
        <Text style={styles.splashText}> 2025 Maskavo</Text>
        <Text style={styles.splashText}>v1.0.0</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  splashImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  splashText: {
    fontSize: 16,
    color: '#000000',
  },
});
