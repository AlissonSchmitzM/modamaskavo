// FirebaseService.js
import {initializeApp} from 'firebase/app';
import {initializeAuth, getReactNativePersistence} from 'firebase/auth';
import {getDatabase} from 'firebase/database';
// Importe o AsyncStorage corretamente
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyCGOBwKV8sp48A6RpS7SlPygFCCPb3kFig',
  authDomain: 'modamaskavo-876a9.firebaseapp.com',
  projectId: 'modamaskavo-876a9',
  storageBucket: 'modamaskavo-876a9.firebasestorage.app',
  messagingSenderId: '582893482320',
  appId: '1:582893482320:web:ec0f2d7cca51f9fc593c55',
  measurementId: 'G-R05B7QLVGJ',
  databaseURL: 'https://modamaskavo-876a9.firebaseio.com',
};

// Inicializar o Firebase
console.log('Inicializando Firebase app...');
const app = initializeApp(firebaseConfig);
console.log('Firebase app inicializado com sucesso!');

// Verificar se AsyncStorage está disponível
console.log('AsyncStorage disponível:', !!AsyncStorage);

// Inicializar auth com persistência para React Native
let auth;
try {
  console.log('Tentando inicializar Auth com persistência...');
  // Inicializar auth com AsyncStorage para persistência
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('Auth inicializado com persistência React Native');
} catch (error) {
  console.error('Erro ao inicializar Auth com persistência:', error);
  // Se falhar, tente usar getAuth padrão
  const {getAuth} = require('firebase/auth');
  auth = getAuth(app);
  console.log('Auth inicializado com método padrão (sem persistência)');
}

// Inicializar database
console.log('Inicializando Database...');
const database = getDatabase(app);
console.log('Database inicializado com sucesso!');

// Verificar inicialização
console.log('Firebase app name:', app.name);
console.log('Auth inicializado:', !!auth);
console.log('Database inicializado:', !!database);

// Exportar as instâncias diretamente
export {app, auth, database};

// Função getFirebase para compatibilidade
export const getFirebase = () => {
  return {app, auth, database};
};

export default {getFirebase};
