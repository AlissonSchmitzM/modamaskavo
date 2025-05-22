import React, {Component} from 'react';
import {View, ScrollView, SafeAreaView} from 'react-native';
import {Card, Text, Divider} from 'react-native-paper';
import {connect} from 'react-redux';
import {
  getColorByDescription,
  getLottieByDescription,
  getLottieHeightByDescription,
} from '../../Orders/Situacoes';
import LottieView from 'lottie-react-native';

class MyOrders extends Component {
  constructor(props) {
    super(props);
  }

  // Função para verificar se um valor é um objeto complexo
  isComplexObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  // Função para renderizar valores de forma segura
  renderSafeValue(value) {
    // Se for null ou undefined
    if (value === null || value === undefined) {
      return '-';
    }

    // Se for um array
    if (Array.isArray(value)) {
      return `${value.length} item(s)`;
    }

    // Se for um objeto complexo
    if (this.isComplexObject(value)) {
      // Não tente renderizar objetos complexos diretamente
      if (value.url && value.type && value.fileName) {
        return value.fileName || 'Arquivo';
      }
      return '[Objeto]'; // Representação segura para objetos genéricos
    }

    // Para valores simples, converta para string
    return String(value);
  }

  renderItem(item) {
    try {
      const orderId = item[1];
      const userEmail = item[0];

      // Verificação de segurança para evitar acesso a propriedades indefinidas
      if (
        !this.props.orders[userEmail] ||
        !this.props.orders[userEmail][orderId]
      ) {
        return (
          <Card style={{margin: 8}} key={`${userEmail}-${orderId}`}>
            <Card.Content>
              <Text variant="bodyMedium" style={{color: 'red'}}>
                Dados do pedido não encontrados
              </Text>
            </Card.Content>
          </Card>
        );
      }

      const currentItem = this.props.orders[userEmail];

      // Formatar a data para exibição
      let formattedDate = '-';
      if (currentItem.createdAt) {
        try {
          const createdDate = new Date(currentItem.createdAt);
          formattedDate = `${String(createdDate.getDate()).padStart(
            2,
            '0',
          )}/${String(createdDate.getMonth() + 1).padStart(
            2,
            '0',
          )}/${createdDate.getFullYear()} ${String(
            createdDate.getHours(),
          ).padStart(2, '0')}:${String(createdDate.getMinutes()).padStart(
            2,
            '0',
          )}`;
        } catch (e) {
          formattedDate = String(currentItem.createdAt);
        }
      }

      return (
        <Card
          style={{
            margin: 8,
            borderColor: '#000',
            backgroundColor: '#F0EDEDFF',
            //backgroundColor: getColorByDescription(currentItem.situation),
          }}
          key={`${userEmail}-${orderId}`}>
          <Card.Content>
            <Text
              variant="titleMedium"
              style={{
                fontWeight: 'bold',
                marginBottom: 8,
                color:
                  currentItem.type === 'uniform' ? '#01411EFF' : '#D46103FF',
              }}>
              {currentItem.type === 'uniform' ? 'Uniforme' : 'Peça Exclusiva'}
            </Text>

            <Divider style={{marginBottom: 8}} />

            <View
              style={{
                marginBottom: 4,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{flex: 1}}>
                <Text variant="bodyMedium">
                  <Text style={{fontWeight: 'bold'}}>Situação: </Text>
                  {this.renderSafeValue(currentItem.situation)}
                </Text>
              </View>

              <View style={{width: '10%'}}>
                <LottieView
                  source={getLottieByDescription(currentItem.situation)}
                  autoPlay
                  loop
                  style={{
                    width: '100%',
                    height: getLottieHeightByDescription(currentItem.situation),
                    transform: [{scale: 2.5}],
                  }}
                />
              </View>
            </View>

            <View style={{marginBottom: 4}}>
              <Text variant="bodyMedium">
                <Text style={{fontWeight: 'bold'}}>Segmento: </Text>
                {this.renderSafeValue(currentItem.segment)}
              </Text>
            </View>

            {currentItem.type === 'exclusive' && (
              <View style={{marginBottom: 4}}>
                <Text variant="bodyMedium">
                  <Text style={{fontWeight: 'bold'}}>Tamanho: </Text>
                  {this.renderSafeValue(currentItem.tam)}
                </Text>
              </View>
            )}

            {currentItem.type === 'uniform' && (
              <View style={{marginBottom: 4}}>
                <Text variant="bodyMedium">
                  <Text style={{fontWeight: 'bold'}}>
                    Quantidade de Peças:{' '}
                  </Text>
                  {this.renderSafeValue(currentItem.amountPieces)}
                </Text>
              </View>
            )}

            {/* Tratamento especial para logos */}
            {currentItem.logos && (
              <View style={{marginBottom: 4}}>
                <Text variant="bodyMedium">
                  <Text style={{fontWeight: 'bold'}}>Logo(s): </Text>
                  {Array.isArray(currentItem.logos)
                    ? `${currentItem.logos.length} logo(s)`
                    : '0 logo(s)'}
                </Text>
              </View>
            )}

            <View style={{marginBottom: 4}}>
              <Text variant="bodyMedium">
                <Text style={{fontWeight: 'bold'}}>Descrição: </Text>
                {this.renderSafeValue(currentItem.description)}
              </Text>
            </View>

            <View style={{marginTop: 8}}>
              <Text variant="bodySmall" style={{color: 'gray'}}>
                Data: {formattedDate}
              </Text>
            </View>
          </Card.Content>
        </Card>
      );
    } catch (error) {
      console.error('Erro ao renderizar item:', error);
      return (
        <Card style={{margin: 8}} key={`error-${item[0]}-${item[1]}`}>
          <Card.Content>
            <Text variant="bodyMedium" style={{color: 'red'}}>
              Erro ao carregar este pedido: {String(error.message)}
            </Text>
          </Card.Content>
        </Card>
      );
    }
  }

  render() {
    if (!this.props.orders) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Nenhum pedido encontrado</Text>
        </View>
      );
    }

    const rows = [];
    try {
      const userIds = Object.keys(this.props.orders);

      // Para cada ID de usuário
      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        const orderIds = Object.keys(this.props.orders[userId]);
        const orderData = this.props.orders[userId];

        // Pegamos apenas o primeiro pedido para cada usuário
        if (orderIds.length > 0) {
          rows.push([
            userId,
            orderIds[0],
            orderData.createdAt ? new Date(orderData.createdAt).getTime() : 0,
          ]);
        }

        //Ordena por data
        rows.sort((a, b) => b[2] - a[2]);
      }
    } catch (error) {
      console.error('Erro ao processar pedidos:', error);
    }

    if (rows.length === 0) {
      return (
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
          <Text>Você ainda não tem pedidos</Text>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={{flex: 1, marginBottom: '20%'}}>
        <ScrollView>{rows.map(item => this.renderItem(item))}</ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  orders: state.orderReducer.orders,
});

export default connect(mapStateToProps, null)(MyOrders);
