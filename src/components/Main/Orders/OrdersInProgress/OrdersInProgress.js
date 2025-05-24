import React, {Component} from 'react';
import {
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {toastConfig} from '../../../../services/toastr';
import {order_in_progress} from '../../../../assets';
import LottieView from 'lottie-react-native';
import {Button, Text} from 'react-native-paper';
import styles from './Styles';
import NavigatorService from '../../../../services/NavigatorService';

export default class OrdersInProgress extends Component {
  render() {
    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: '#f5f5f5'}}
        edges={['bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          extraScrollHeight={100}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 40}
          style={{flex: 1}}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}>
            <LottieView
              source={order_in_progress}
              autoPlay
              loop
              style={{
                width: '100%',
                height: 350,
                marginTop: '-5%',
              }}
            />

            <Text style={styles.title}>Pedido enviado com sucesso!</Text>
            <View
              style={{
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 50,
              }}>
              <Button
                mode="contained"
                style={styles.button}
                textColor="#FFF"
                onPress={() => NavigatorService.goBack()}>
                Voltar
              </Button>
              <Button
                mode="contained"
                style={styles.button}
                textColor="#FFF"
                onPress={() => {
                  NavigatorService.navigate('MyOrders');
                  NavigatorService.resetPreviousRoute();
                }}>
                Acompanhar Pedidos
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Toast config={toastConfig} />
      </SafeAreaView>
    );
  }
}
