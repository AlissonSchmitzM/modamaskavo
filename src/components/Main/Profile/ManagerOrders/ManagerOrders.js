import React, {Component} from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import b64 from 'base-64';
import {
  Card,
  Text,
  Divider,
  Button,
  Menu,
  Provider,
  DefaultTheme,
} from 'react-native-paper';
import {connect} from 'react-redux';
import {
  getLottieByDescription,
  getLottieHeightByDescription,
} from '../../Orders/Situacoes';
import LottieView from 'lottie-react-native';
import {without_orders} from '../../../../assets';
import NavigatorService from '../../../../services/NavigatorService';
import {styles} from './styles';

// Definindo um tema personalizado para garantir cores consistentes
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#000000',
    onSurfaceVariant: '#999999',
    // Outras cores que você pode querer definir:
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
  },
};

const ITEMS_PER_PAGE = 10;
const PAGINATION_CONTAINER_HEIGHT = 60; // Altura do container de paginação

// Componente wrapper funcional para usar o hook useSafeAreaInsets
const ManagerOrdersWithSafeArea = props => {
  const insets = useSafeAreaInsets();
  return <ManagerOrders {...props} safeAreaInsets={insets} />;
};

class ManagerOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      loading: false,
      allRows: [],
      filteredRows: [],
      selectedSituation: 'Todas',
      situationsList: ['Todas'],
      selectedUser: 'Todos',
      usersList: ['Todos'],
      situationMenuVisible: false,
      userMenuVisible: false,
    };
  }

  componentDidMount() {
    this.processOrderData();
  }

  componentDidUpdate(prevProps) {
    // Atualiza os dados se os pedidos mudarem
    if (prevProps.ordersFull !== this.props.ordersFull) {
      this.processOrderData();
    }
  }

  // Processa todos os dados de pedidos e armazena no estado
  processOrderData = () => {
    const rows = [];
    const situations = new Set(['Todas']); // Começa com "Todas" como opção padrão
    const users = new Set(['Todos']); // Começa com "Todos" como opção padrão

    try {
      if (!this.props.ordersFull) return;

      const userIds = Object.keys(this.props.ordersFull);

      // Para cada ID de usuário
      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];

        // Adiciona o usuário decodificado à lista de usuários
        try {
          const decodedEmail = b64.decode(userId);
          users.add(decodedEmail);
        } catch (e) {
          users.add(userId); // Usa o ID codificado se não conseguir decodificar
        }

        const orderIds = Object.keys(this.props.ordersFull[userId]);

        for (let j = 0; j < orderIds.length; j++) {
          const orderId = orderIds[j];
          const orderData = this.props.ordersFull[userId][orderId];

          if (orderData) {
            // Adiciona a situação à lista de situações (se não for undefined)
            if (orderData.situation) {
              situations.add(orderData.situation);
            }

            // Tenta decodificar o email do usuário
            let decodedEmail;
            try {
              decodedEmail = b64.decode(userId);
            } catch (e) {
              decodedEmail = userId;
            }

            rows.push([
              userId,
              orderId,
              orderData.createdAt ? new Date(orderData.createdAt).getTime() : 0,
              orderData.situation || 'Não definida', // Adiciona a situação como quarto elemento
              decodedEmail, // Adiciona o email decodificado como quinto elemento
            ]);
          }
        }
      }

      // Ordena por data (mais recente primeiro)
      rows.sort((a, b) => b[2] - a[2]);

      this.setState({
        allRows: rows,
        filteredRows: rows,
        currentPage: 1,
        situationsList: Array.from(situations),
        usersList: Array.from(users),
      });
    } catch (error) {
      console.error('Erro ao processar pedidos:', error);
      this.setState({allRows: [], filteredRows: []});
    }
  };

  // Aplica todos os filtros selecionados
  applyFilters = () => {
    const {allRows, selectedSituation, selectedUser} = this.state;

    let filtered = [...allRows];

    // Filtrar por situação se não for "Todas"
    if (selectedSituation !== 'Todas') {
      filtered = filtered.filter(row => row[3] === selectedSituation);
    }

    // Filtrar por usuário se não for "Todos"
    if (selectedUser !== 'Todos') {
      filtered = filtered.filter(row => row[4] === selectedUser);
    }

    this.setState({
      filteredRows: filtered,
      currentPage: 1,
    });
  };

  formatCurrency(value) {
    if (typeof value === 'number') {
      return `R$ ${value.toFixed(2).replace('.', ',')}`;
    } else if (typeof value === 'string') {
      // Tenta converter string para número
      const numValue = parseFloat(value.replace(',', '.'));
      if (!isNaN(numValue)) {
        return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
      }
      return value;
    }
    return 'R$ 0,00';
  }

  // Filtra os pedidos com base na situação selecionada
  selectSituation = situation => {
    this.setState(
      {
        selectedSituation: situation,
        situationMenuVisible: false,
      },
      this.applyFilters,
    );
  };

  // Filtra os pedidos com base no usuário selecionado
  selectUser = user => {
    this.setState(
      {
        selectedUser: user,
        userMenuVisible: false,
      },
      this.applyFilters,
    );
  };

  // Limpa todos os filtros
  clearFilters = () => {
    this.setState({
      selectedSituation: 'Todas',
      selectedUser: 'Todos',
      filteredRows: this.state.allRows,
      currentPage: 1,
    });
  };

  // Controla visibilidade do menu de situações
  toggleSituationMenu = () => {
    this.setState(prevState => ({
      situationMenuVisible: !prevState.situationMenuVisible,
      userMenuVisible: false, // Fecha o outro menu se estiver aberto
    }));
  };

  // Controla visibilidade do menu de usuários
  toggleUserMenu = () => {
    this.setState(prevState => ({
      userMenuVisible: !prevState.userMenuVisible,
      situationMenuVisible: false, // Fecha o outro menu se estiver aberto
    }));
  };

  // Função para verificar se um valor é um objeto complexo
  isComplexObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  handleTrackOrder = code_track => {
    // URL dos correios ou outra empresa de logística
    const trackingUrl = `https://www.linkcorreios.com.br/?id=${code_track}`;
    Linking.openURL(trackingUrl).catch(err =>
      console.error('Erro ao abrir link de rastreamento:', err),
    );
  };

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

  handleOrderPress = (user, currentItem, orderId) => {
    NavigatorService.navigate('ManagerOrdersDetails', {
      user,
      currentItem,
      orderId,
    });
  };

  renderItem(item) {
    try {
      const orderId = item[1];
      const userEmail = item[0];

      // Verificação de segurança para evitar acesso a propriedades indefinidas
      if (
        !this.props.ordersFull[userEmail] ||
        !this.props.ordersFull[userEmail][orderId]
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

      const currentItem = this.props.ordersFull[userEmail][orderId];

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
            backgroundColor: '#FFFFFFFF',
          }}
          key={`${userEmail}-${orderId}`}
          onPress={() =>
            this.handleOrderPress(
              this.props.usersFull[userEmail],
              currentItem,
              orderId,
            )
          }>
          <Card.Content>
            <Text
              variant="titleMedium"
              style={{
                fontWeight: 'bold',
                marginBottom: 8,
                color:
                  currentItem.type === 'uniform'
                    ? '#01411EFF'
                    : currentItem.type === 'exclusive'
                    ? '#D46103FF'
                    : currentItem.type === 'store'
                    ? '#0066CCFF'
                    : '#000000',
              }}>
              {currentItem.type === 'uniform'
                ? 'Uniforme'
                : currentItem.type === 'exclusive'
                ? 'Peça Exclusiva'
                : currentItem.type === 'store'
                ? 'Compra Peça Exclusiva'
                : '-'}
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

            {currentItem.type === 'store' && (
              <View style={{marginBottom: 4}}>
                <Text variant="bodyMedium">
                  <Text style={{fontWeight: 'bold'}}>Produto: </Text>
                  {this.renderSafeValue(currentItem.product.name)}
                </Text>
              </View>
            )}

            <View style={{marginBottom: 4}}>
              <Text variant="bodyMedium">
                <Text style={{fontWeight: 'bold'}}>Nome: </Text>
                {this.props.usersFull[userEmail].name}
              </Text>
            </View>

            <View style={{marginBottom: 4}}>
              <Text variant="bodyMedium">
                <Text style={{fontWeight: 'bold'}}>Email: </Text>
                {b64.decode(userEmail)}
              </Text>
            </View>

            {(currentItem.type === 'uniform' ||
              currentItem.type === 'exclusive') && (
              <View style={{marginBottom: 4}}>
                <Text variant="bodyMedium">
                  <Text style={{fontWeight: 'bold'}}>Segmento: </Text>
                  {this.renderSafeValue(currentItem.segment)}
                </Text>
              </View>
            )}

            {(currentItem.type === 'store' ||
              currentItem.type === 'exclusive') && (
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

            {(currentItem.type === 'uniform' ||
              currentItem.type === 'exclusive') && (
              <View style={{marginBottom: 4}}>
                <Text variant="bodyMedium">
                  <Text style={{fontWeight: 'bold'}}>Descrição: </Text>
                  {this.renderSafeValue(currentItem.description)}
                </Text>
              </View>
            )}

            {currentItem.value_order && (
              <View
                style={{
                  marginBottom: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View style={{flex: 1}}>
                  <Text variant="bodyMedium">
                    <Text style={{fontWeight: 'bold'}}>Valor do pedido: </Text>
                    {`R$ ${currentItem.value_order}`}
                  </Text>
                </View>
              </View>
            )}

            {currentItem.shipping && (
              <View style={{marginBottom: 4}}>
                <Text variant="bodyMedium">
                  <Text style={{fontWeight: 'bold'}}>Envio: </Text>
                  {currentItem.shipping.name} - R$ {currentItem.shipping.price}{' '}
                  - Prazo: {currentItem.shipping.delivery_time} dias
                </Text>
              </View>
            )}

            {currentItem.value_order && currentItem.shipping && (
              <View style={{marginBottom: 4}}>
                <Text variant="bodyMedium">
                  <Text style={{fontWeight: 'bold'}}>Total: </Text>
                  <Text>R$ </Text>
                  {(
                    parseFloat(
                      currentItem.value_order
                        .replace(/\./g, '')
                        .replace(',', '.'),
                    ) +
                    parseFloat(
                      currentItem.shipping.price
                        .replace(/\./g, '')
                        .replace(',', '.'),
                    )
                  ).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            )}

            {/* Motivo de cancelamento (se existir) */}
            {currentItem.reason_cancellation && (
              <View style={{marginBottom: 4}}>
                <Text variant="bodyMedium">
                  <Text style={{fontWeight: 'bold', color: '#D32F2F'}}>
                    Motivo do cancelamento:{' '}
                  </Text>
                  {this.renderSafeValue(currentItem.reason_cancellation)}
                </Text>
              </View>
            )}

            {/* Observações do administrador (se existir) */}
            {currentItem.observation_admin && (
              <View style={{marginBottom: 4}}>
                <Text variant="bodyMedium">
                  <Text style={{fontWeight: 'bold'}}>Observações: </Text>
                  {this.renderSafeValue(currentItem.observation_admin)}
                </Text>
              </View>
            )}

            {/* Data estimada para finalização (se existir) */}
            {currentItem.estimated_finish && (
              <View style={{marginBottom: 4}}>
                <Text variant="bodyMedium">
                  <Text style={{fontWeight: 'bold'}}>
                    Data estimada para finalizar produção:{' '}
                  </Text>
                  {currentItem.estimated_finish}
                </Text>
              </View>
            )}

            {/* Código de rastreio (se existir) */}
            {currentItem.code_track && (
              <View
                style={{
                  marginBottom: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View style={{flex: 1}}>
                  <Text variant="bodyMedium">
                    <Text style={{fontWeight: 'bold'}}>
                      Código de rastreio:{' '}
                    </Text>
                    {this.renderSafeValue(currentItem.code_track.toUpperCase())}
                  </Text>
                </View>
                <Button
                  mode="contained"
                  onPress={() => this.handleTrackOrder(currentItem.code_track)}
                  style={{backgroundColor: '#0066CC'}}>
                  Rastrear
                </Button>
              </View>
            )}

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
    const {
      filteredRows,
      currentPage,
      loading,
      selectedSituation,
      selectedUser,
      situationsList,
      usersList,
      situationMenuVisible,
      userMenuVisible,
    } = this.state;
    const {safeAreaInsets} = this.props;

    // Verificar se há filtros ativos
    const hasActiveFilters =
      selectedSituation !== 'Todas' || selectedUser !== 'Todos';

    // Se não há pedidos
    if (!this.props.ordersFull || filteredRows.length === 0) {
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
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              paddingHorizontal: 20,
            }}>
            {this.props.ordersFull && this.state.allRows.length > 0
              ? 'Nenhum pedido encontrado com os filtros atuais'
              : 'Você ainda não tem pedidos'}
          </Text>

          {/* Mostrar botão para limpar filtros se estiver filtrando */}
          {hasActiveFilters &&
            this.props.ordersFull &&
            this.state.allRows.length > 0 && (
              <Button
                mode="contained"
                onPress={this.clearFilters}
                style={{marginTop: 20}}>
                Limpar Filtros
              </Button>
            )}
        </SafeAreaView>
      );
    }

    // Calcula os índices de início e fim para a página atual
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    // Obtém apenas os itens para a página atual
    const currentItems = filteredRows.slice(startIndex, endIndex);

    // Verifica se há mais páginas
    const hasMorePages = endIndex < filteredRows.length;
    const hasPreviousPages = currentPage > 1;

    // Calcular a posição final dos botões de paginação
    const paginationBottomPosition = safeAreaInsets?.bottom || 0;

    return (
      <View style={styles.container}>
        {/* Área de filtros */}
        <View style={styles.filtersRow}>
          {/* Filtro por situação */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Situação:</Text>

            <Menu
              visible={situationMenuVisible}
              onDismiss={this.toggleSituationMenu}
              contentStyle={{backgroundColor: '#F5F5F5'}}
              anchor={
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={this.toggleSituationMenu}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.dropdownButtonText}>
                    {selectedSituation}
                  </Text>
                </TouchableOpacity>
              }>
              {situationsList.map(situation => (
                <Menu.Item
                  key={situation}
                  onPress={() => this.selectSituation(situation)}
                  title={situation}
                  titleStyle={{color: '#000000'}}
                />
              ))}
            </Menu>
          </View>

          {/* Filtro por usuário */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Usuário:</Text>

            <Menu
              visible={userMenuVisible}
              onDismiss={this.toggleUserMenu}
              contentStyle={{backgroundColor: '#F5F5F5'}}
              anchor={
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={this.toggleUserMenu}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.dropdownButtonText}>
                    {selectedUser}
                  </Text>
                </TouchableOpacity>
              }>
              {usersList.map(user => (
                <Menu.Item
                  key={user}
                  onPress={() => this.selectUser(user)}
                  title={user}
                  titleStyle={{color: '#000000'}}
                />
              ))}
            </Menu>
          </View>
        </View>

        {/* Botão para limpar filtros (visível apenas se houver filtros ativos) */}
        {hasActiveFilters && (
          <View style={styles.clearFilterContainer}>
            <Button mode="text" onPress={this.clearFilters} textColor="#9F041B">
              Limpar Filtros
            </Button>
          </View>
        )}

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
            Página {currentPage} de{' '}
            {Math.ceil(filteredRows.length / ITEMS_PER_PAGE)}
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

const mapStateToProps = state => ({
  ordersFull: state.orderReducer.ordersFull,
  usersFull: state.userReducer.usersFull,
});

// Conecta o componente wrapper ao Redux e envolve com SafeAreaProvider
const ConnectedManagerOrdersWithSafeArea = connect(
  mapStateToProps,
  null,
)(ManagerOrdersWithSafeArea);

// Exporta o componente wrapper envolvido com SafeAreaProvider
export default function (props) {
  return (
    <SafeAreaProvider>
      <Provider theme={theme}>
        <ConnectedManagerOrdersWithSafeArea {...props} />
      </Provider>
    </SafeAreaProvider>
  );
}
