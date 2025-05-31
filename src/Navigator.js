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
  MyOrders,
  FormConfig,
  ManagerOrders,
  ManagerOrdersDetails,
} from './components';
import Icon from 'react-native-vector-icons/Ionicons';
import {StatusBar, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import PaymentScreen from './components/Main/Payment/PaymentScreen';
import FormForgotPassword from './components/Login/FormLogin/FormForgotPassword/FormForgotPassword';
const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

const CustomHeader = () => {
  return (
    <View
      style={{
        backgroundColor: '#000000',
        paddingTop: useSafeAreaInsets().top,
      }}>
      <StatusBar backgroundColor="#000000" />
    </View>
  );
};

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
        tabBarHideOnKeyboard: true,
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
        options={{header: () => <CustomHeader />}}
      />
      <Stack.Screen
        name="FormSignUp"
        component={FormSignUp}
        options={{
          title: 'Cadastro de Usuário',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            color: '#ffffff',
          },
        }}
      />
      <Stack.Screen
        name="FormForgotPassword"
        component={FormForgotPassword}
        options={{
          title: 'Redefinir Senha',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            color: '#ffffff',
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
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            color: '#ffffff',
          },
        }}
      />
      <Stack.Screen
        name="OrdersInProgress"
        component={OrdersInProgress}
        options={{title: 'Pedido Enviado', header: () => <CustomHeader />}}
      />
      <Stack.Screen
        name="MyOrders"
        component={MyOrders}
        options={{
          title: 'Meus Pedidos',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            color: '#ffffff',
          },
        }}
      />
      <Stack.Screen
        name="ManagerOrders"
        component={ManagerOrders}
        options={{
          title: 'Gerenciar Pedidos',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            color: '#ffffff',
          },
        }}
      />
      <Stack.Screen
        name="ManagerOrdersDetails"
        component={ManagerOrdersDetails}
        options={{
          title: 'Detalhes do Pedido',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            color: '#ffffff',
          },
        }}
      />
      <Stack.Screen
        name="FormConfig"
        component={FormConfig}
        options={{
          title: 'Configurações',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            color: '#ffffff',
          },
        }}
      />
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{header: () => <CustomHeader />}}
      />
      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={{
          title: 'Pagamento',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            color: '#ffffff',
          },
        }}
      />
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{header: () => <CustomHeader />}}
      />
    </Stack.Navigator>
  );
};
export default MainStackNavigator;
