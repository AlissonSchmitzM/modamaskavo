import React from 'react';
import {
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {logo_techmitz, logo} from '../../../../imgs';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card} from 'react-native-paper';

const AboutApp = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f5f5f5'}}>
      <ScrollView>
        <Image
          source={logo}
          style={{
            width: '100%',
            height: 150,
            resizeMode: 'contain',
          }}
        />

        <Card style={{margin: 8, backgroundColor: '#FFF', elevation: 2}}>
          <Card.Content>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 12,
                color: '#000',
              }}>
              Sobre o Aplicativo
            </Text>
            <Text style={{fontSize: 14, lineHeight: 20, color: '#333'}}>
              O aplicativo da Moda Maskavo foi desenvolvido para facilitar a
              experiência de compra de peças exclusivas e uniformes. Através
              desta plataforma, você pode realizar pedidos, explorar nossa loja
              virtual e ter acesso a produtos exclusivos da Moda Maskavo.
            </Text>
          </Card.Content>
        </Card>

        <Image
          source={logo_techmitz}
          style={{
            width: '100%',
            height: 120,
            resizeMode: 'contain',
            marginVertical: 20,
          }}
        />

        <Card style={{backgroundColor: '#FFF', margin: 8, elevation: 2}}>
          <Card.Content>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 12,
                color: '#000',
              }}>
              Desenvolvimento
            </Text>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                color: '#333',
                marginBottom: 8,
              }}>
              Este aplicativo foi desenvolvido pela Techmitz, uma empresa
              especializada em desenvolvimento de aplicativos móveis.
            </Text>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                color: '#333',
                marginBottom: 8,
              }}>
              <Text style={{fontWeight: 'bold'}}>Desenvolvedor:</Text> Alisson
              Schmitz de Medeiros
            </Text>
            <Text style={{fontSize: 14, lineHeight: 20, color: '#333'}}>
              <Text style={{fontWeight: 'bold'}}>Contato:</Text>{' '}
              alissonschmitz2@hotmail.com
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutApp;
