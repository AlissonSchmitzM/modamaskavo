// FirebaseService.js
import {initializeApp} from '@react-native-firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from '@react-native-firebase/auth';
import {getDatabase} from '@react-native-firebase/database';
import {getStorage} from '@react-native-firebase/storage'; // Adicione esta importação
// Importe o AsyncStorage corretamente
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyCGOBwKV8sp48A6RpS7SlPygFCCPb3kFig',
  authDomain: 'modamaskavo-876a9.firebaseapp.com',
  projectId: 'modamaskavo-876a9',
  storageBucket: 'modamaskavo-876a9.appspot.com', // Verifique se este valor está correto
  messagingSenderId: '582893482320',
  appId: '1:582893482320:web:ec0f2d7cca51f9fc593c55',
  measurementId: 'G-R05B7QLVGJ',
  databaseURL: 'https://modamaskavo-876a9.firebaseio.com',
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Inicializar auth com persistência para React Native
let auth;
try {
  // Inicializar auth com AsyncStorage para persistência
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Se falhar, tente usar getAuth padrão
  const {getAuth} = require('@react-native-firebase/auth');
  auth = getAuth(app);
}

// Inicializar database
const database = getDatabase(app);

// Inicializar storage
const storage = getStorage(app); // Adicione esta linha

// Exportar as instâncias diretamente
export {app, auth, database, storage}; // Adicione storage aqui

// Função getFirebase para compatibilidade
export const getFirebase = () => {
  return {app, auth, database, storage}; // Adicione storage aqui também
};

export default {getFirebase};
