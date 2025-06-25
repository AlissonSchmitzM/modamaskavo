import React, {Component} from 'react';
import {View, Image, StyleSheet, Text, Platform, NativeModules} from 'react-native';
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
    this.configureGoogleSignin();

    this.checkUserLogin();
  }

  async configureGoogleSignin() {
    const { RNConfig } = NativeModules;
    const webClientId = Platform.OS === 'android' ? RNConfig.server_client_id : '';
    
    try {
      await GoogleSignin.hasPlayServices();
      GoogleSignin.configure({
        webClientId: webClientId,
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
          const snapshot = await get(
            ref(getDatabase(), `/users/${emailB64}/saveProfile`),
          );

          const saveProfile = snapshot.val();

          this.setState(
            {
              saveProfile,
              checkCompleted: true,
            },
            () => {
              setTimeout(() => {
                this.navigateBasedOnLogin();
              }, 3000);
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
        <Text style={styles.splashText}>
          © {new Date().getFullYear()} Maskavo
        </Text>
        <Text style={styles.splashText}>v1.0.3</Text>
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
