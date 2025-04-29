import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  LoginScreen,
  SignUp,
  Home,
  Orders,
  Store,
  Profile,
  WooCommerceProducts,
} from '../screens';
import Icon from 'react-native-vector-icons/Ionicons';
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
    <Stack.Navigator initialRouteName="LoginScreen">
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{title: 'Cadastro de Usuário'}}
      />
      <Stack.Screen
        name="WooCommerceProducts"
        component={WooCommerceProducts}
        options={{title: 'Produtos'}}
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
