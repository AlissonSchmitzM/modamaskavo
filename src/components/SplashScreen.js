import React, {Component} from 'react';
import {View, Image, StyleSheet, Text} from 'react-native';
import navigationService from '../services/NavigatorService';
import store from '../services/AsyncStorage';
import {getDatabase, ref, get} from '@react-native-firebase/database';
import b64 from 'base-64';
import toastr, {ERROR} from '../services/toastr';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

export default class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUserLogged: false,
      checkCompleted: false,
      saveProfile: false,
    };
  }

  componentDidMount() {
    // Configurar Google Sign-In
    this.configureGoogleSignin();

    // Remova o timer fixo e apenas chame a verificação de login
    this.checkUserLogin();
  }

  async configureGoogleSignin() {
    try {
      await GoogleSignin.hasPlayServices();
      GoogleSignin.configure({
        webClientId:
          '582893482320-l3ch1sjuirvr57qm5boll0lsfjs1nmrd.apps.googleusercontent.com',
        offlineAccess: true,
      });
    } catch (error) {
      toastr.showToast(`Erro na configuração Google Sign-In: ${error}`, ERROR);
    }
  }

  async checkUserLogin() {
    try {
      const isUserLoggedd = await store.get('userLogged');
      this.setState({
        isUserLogged: isUserLoggedd !== null && isUserLoggedd === true,
      });

      const emailUserLogged = await store.get('emailUserLogged');
      if (emailUserLogged) {
        const emailB64 = b64.encode(emailUserLogged);

        try {
          // Usando a API modular do Firebase
          const db = getDatabase();
          const profileRef = ref(db, `/users/${emailB64}/saveProfile`);
          const snapshot = await get(profileRef);

          const saveProfile = snapshot.val();

          // Agora que temos todos os dados, atualizamos o estado e navegamos
          this.setState(
            {
              saveProfile,
              checkCompleted: true,
            },
            () => {
              // Usando um pequeno delay apenas para garantir que a splash screen seja exibida
              setTimeout(() => {
                this.navigateBasedOnLogin();
              }, 3000); // Mantém os 2 segundos mínimos de exibição da splash
            },
          );
        } catch (error) {
          toastr.showToast(`Erro ao buscar perfil: ${error}`, ERROR);
          this.setState({checkCompleted: true}, () =>
            this.navigateBasedOnLogin(),
          );
        }
      } else {
        this.setState({checkCompleted: true}, () => {
          setTimeout(() => {
            this.navigateBasedOnLogin();
          }, 3000);
        });
      }
    } catch (error) {
      toastr.showToast(`Erro ao verificar login: ${error}`, ERROR);
      this.setState({checkCompleted: true}, () => {
        setTimeout(() => {
          this.navigateBasedOnLogin();
        }, 3000);
      });
    }
  }

  navigateBasedOnLogin() {
    // Se a verificação foi concluída, navega com base no resultado
    if (this.state.checkCompleted) {
      if (this.state.isUserLogged) {
        if (this.state.saveProfile) {
          navigationService.reset('Main');
        } else {
          navigationService.reset('FormProfile');
        }
      } else {
        navigationService.reset('FormLogin');
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
        <Text style={styles.splashText}>© 2025 Maskavo</Text>
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
