import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  FormLogin,
  FormSignUp,
  FormProfile,
  Home,
  Orders,
  OrdersInProgress,
  Store,
  Profile,
  WooCommerceProducts,
  SplashScreen,
} from './components';
import Icon from 'react-native-vector-icons/Ionicons';
import {View} from 'react-native';
const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home-sharp' : 'home-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'shirt' : 'shirt-outline';
          } else if (route.name === 'Store') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
        },
      })}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{title: 'Início', headerShown: false}}
      />
      <Tab.Screen
        name="Orders"
        component={Orders}
        options={{title: 'Pedidos', headerShown: false}}
      />
      <Tab.Screen
        name="Store"
        component={Store}
        options={{title: 'Loja', headerShown: false}}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{title: 'Perfil', headerShown: false}}
      />
    </Tab.Navigator>
  );
};

const MainStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="SplashScreen">
      <Stack.Screen
        name="FormLogin"
        component={FormLogin}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="FormSignUp"
        component={FormSignUp}
        options={{
          title: 'Cadastro de Usuário',
          headerStyle: {
            backgroundColor: '#000000', // Fundo preto
          },
          headerTintColor: '#ffffff', // Texto e botões em branco
          headerTitleStyle: {
            color: '#ffffff', // Garantindo que o título também seja branco
          },
        }}
      />
      <Stack.Screen
        name="WooCommerceProducts"
        component={WooCommerceProducts}
        options={{title: 'Produtos'}}
      />
      <Stack.Screen
        name="FormProfile"
        component={FormProfile}
        options={{
          title: 'Perfil',
          headerStyle: {
            backgroundColor: '#000000', // Fundo preto
          },
          headerTintColor: '#ffffff', // Texto e botões em branco
          headerTitleStyle: {
            color: '#ffffff', // Garantindo que o título também seja branco
          },
        }}
      />
      <Stack.Screen
        name="OrdersInProgress"
        component={OrdersInProgress}
        options={{title: 'Pedido Enviado', headerShown: false}}
      />
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};
export default MainStackNavigator;
