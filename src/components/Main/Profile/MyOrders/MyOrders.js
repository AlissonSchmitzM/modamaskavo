import React, {Component} from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {Card, Text, Divider, Button} from 'react-native-paper';
import {connect} from 'react-redux';
import {
  getLottieByDescription,
  getLottieHeightByDescription,
} from '../../Orders/Situacoes';
import LottieView from 'lottie-react-native';
import {without_orders} from '../../../../assets';

const ITEMS_PER_PAGE = 10;
const PAGINATION_CONTAINER_HEIGHT = 60; // Altura do container de paginação

// Componente wrapper funcional para usar o hook useSafeAreaInsets
const MyOrdersWithSafeArea = props => {
  const insets = useSafeAreaInsets();
  return <MyOrders {...props} safeAreaInsets={insets} />;
};

class MyOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      loading: false,
      allRows: [],
    };
  }

  componentDidMount() {
    this.processOrderData();
  }

  componentDidUpdate(prevProps) {
    // Atualiza os dados se os pedidos mudarem
    if (prevProps.orders !== this.props.orders) {
      this.processOrderData();
    }
  }

  // Processa todos os dados de pedidos e armazena no estado
  processOrderData = () => {
    const rows = [];
    try {
      if (!this.props.orders) return;

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
      }

      // Ordena por data (mais recente primeiro)
      rows.sort((a, b) => b[2] - a[2]);

      this.setState({allRows: rows, currentPage: 1});
    } catch (error) {
      console.error('Erro ao processar pedidos:', error);
      this.setState({allRows: []});
    }
  };

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

  // Carrega mais itens (próxima página)
  loadMoreItems = () => {
    this.setState(prevState => ({
      currentPage: prevState.currentPage + 1,
      loading: false,
    }));
  };

  // Volta para a página anterior
  loadPreviousItems = () => {
    if (this.state.currentPage > 1) {
      this.setState(prevState => ({
        currentPage: prevState.currentPage - 1,
      }));
    }
  };

  render() {
    const {allRows, currentPage, loading} = this.state;
    const {safeAreaInsets} = this.props;

    // Se não há pedidos
    if (!this.props.orders || allRows.length === 0) {
      return (
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 100,
          }}>
          <LottieView
            source={without_orders}
            autoPlay
            loop
            style={{width: '100%', height: 150, marginBottom: 10}}
          />
          <Text style={{fontSize: 20, fontWeight: 'bold'}}>
            Você ainda não tem pedidos
          </Text>
        </SafeAreaView>
      );
    }

    // Calcula os índices de início e fim para a página atual
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    // Obtém apenas os itens para a página atual
    const currentItems = allRows.slice(startIndex, endIndex);

    // Verifica se há mais páginas
    const hasMorePages = endIndex < allRows.length;
    const hasPreviousPages = currentPage > 1;

    // Calcular a posição final dos botões de paginação
    const paginationBottomPosition = safeAreaInsets?.bottom || 0;

    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom:
              PAGINATION_CONTAINER_HEIGHT + paginationBottomPosition + 20,
          }}
          showsVerticalScrollIndicator={true}>
          {/* Exibe os itens da página atual */}
          {currentItems.map(item => this.renderItem(item))}

          {/* Indicador de carregamento */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9F041B" />
            </View>
          )}

          {/* Espaço para garantir que o conteúdo não fique atrás dos botões de paginação */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Controles de paginação */}
        <View
          style={[
            styles.paginationContainer,
            {bottom: paginationBottomPosition},
          ]}>
          {/* Botão para página anterior */}
          <Button
            mode="outlined"
            onPress={this.loadPreviousItems}
            disabled={!hasPreviousPages}
            textColor="#000"
            style={[
              styles.paginationButton,
              !hasPreviousPages && styles.disabledButton,
            ]}>
            Anterior
          </Button>

          {/* Indicador de página atual */}
          <Text style={styles.pageIndicator}>
            Página {currentPage} de {Math.ceil(allRows.length / ITEMS_PER_PAGE)}
          </Text>

          {/* Botão para próxima página */}
          <Button
            mode="outlined"
            onPress={this.loadMoreItems}
            disabled={!hasMorePages}
            textColor="#000"
            style={[
              styles.paginationButton,
              !hasMorePages && styles.disabledButton,
            ]}>
            Próxima
          </Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  bottomPadding: {
    height: '2%', // Espaço extra no final da lista
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    left: 0,
    right: 0,
    height: PAGINATION_CONTAINER_HEIGHT,
    elevation: 5, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 1000, // Garante que fique acima de outros elementos
  },
  paginationButton: {
    minWidth: 100,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageIndicator: {
    fontWeight: 'bold',
  },
});

const mapStateToProps = state => ({
  orders: state.orderReducer.orders,
});

// Conecta o componente wrapper ao Redux e envolve com SafeAreaProvider
const ConnectedMyOrdersWithSafeArea = connect(
  mapStateToProps,
  null,
)(MyOrdersWithSafeArea);

// Exporta o componente wrapper envolvido com SafeAreaProvider
export default function (props) {
  return (
    <SafeAreaProvider>
      <ConnectedMyOrdersWithSafeArea {...props} />
    </SafeAreaProvider>
  );
}
