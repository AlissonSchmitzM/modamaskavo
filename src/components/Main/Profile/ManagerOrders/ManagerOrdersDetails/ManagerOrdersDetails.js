import React, {Component} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Linking,
} from 'react-native';
import {
  Text,
  Card,
  Divider,
  Avatar,
  Title,
  Subheading,
  Button,
  IconButton,
  TextInput,
  PaperProvider,
} from 'react-native-paper';
import LottieView from 'lottie-react-native';
import {
  getLottieByDescription,
  getLottieHeightByDescription,
} from '../../../Orders/Situacoes';
import {SafeAreaView} from 'react-native-safe-area-context';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import toastr, {
  ERROR,
  SUCCESS,
  toastConfig,
} from '../../../../../services/toastr';
import {connect} from 'react-redux';
import b64 from 'base-64';
import {
  cancelOrder,
  setCodeTrack,
  setEstimatedFinish,
  setPrice,
} from '../../../../../store/actions/orderActions';
import {colors} from '../../../../../styles';
import styles from './Styles';
import Toast from 'react-native-toast-message';
import {DatePickerModal} from 'react-native-paper-dates';
import {SuperFreteService} from '../../../../../services/SuperFreteService';

class ManagerOrdersDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      currentImageUrl: '',
      currentImageName: '',
      imageLoading: true,
      // Dialog states
      cancelDialogVisible: false,
      priceDialogVisible: false,
      productionDialogVisible: false,
      completeDialogVisible: false,
      // Form fields
      cancelReason: '',
      value_order: '',
      observation_admin: '',
      estimated_finish: '',
      code_track: '',

      datePickerVisible: false,
      estimatedCompletionDate: '',
      selectedDate: undefined,
      loadingGenerateLabel: false,
      imageLoading: true,
    };
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

  showDatePicker = () => {
    this.setState({datePickerVisible: true});
  };

  hideDatePicker = () => {
    this.setState({datePickerVisible: false});
  };

  confirmDate = params => {
    const {date} = params;
    // Formata a data para o formato brasileiro (DD/MM/AAAA)
    const formattedDate = date.toLocaleDateString('pt-BR');

    this.setState({
      datePickerVisible: false,
      selectedDate: date,
      estimated_finish: formattedDate,
    });
  };

  // Função para formatar valor monetário
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

  // Função para formatar data
  formatDate(dateString) {
    try {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}/${date.getFullYear()}`;
    } catch (e) {
      return String(dateString);
    }
  }

  // Função para abrir a modal com a imagem
  openImageModal = (url, name) => {
    this.setState({
      modalVisible: true,
      currentImageUrl: url,
      currentImageName: name,
      imageLoading: true,
    });
  };

  // Função para fechar a modal
  closeImageModal = () => {
    this.setState({
      modalVisible: false,
      currentImageUrl: '',
      currentImageName: '',
    });
  };

  renderImagesProduct = images => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return <Text>Nenhuma imagem disponível</Text>;
    }

    return (
      <View style={styles.logosContainer}>
        {images.map((image, index) => {
          // Verificar se o logo tem as propriedades necessárias
          if (!image || !image.src) {
            return (
              <Text key={`invalid-logo-${index}`} style={styles.invalidLogo}>
                Imagem inválida
              </Text>
            );
          }

          const fileName = image.name || `Imagem ${index + 1}`;

          return (
            <TouchableOpacity
              key={`logo-${index}`}
              style={styles.logoLink}
              onPress={() => this.openImageModal(image.src, fileName)}>
              <View style={styles.logoItem}>
                <Text
                  style={styles.logoText}
                  numberOfLines={1}
                  ellipsizeMode="middle">
                  {fileName}
                </Text>
                <IconButton
                  icon="eye"
                  size={20}
                  iconColor="#000"
                  style={styles.viewIcon}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Função para renderizar as logos como links clicáveis
  renderLogos = logos => {
    if (!logos || !Array.isArray(logos) || logos.length === 0) {
      return <Text>Nenhuma logo disponível</Text>;
    }

    return (
      <View style={styles.logosContainer}>
        {logos.map((logo, index) => {
          // Verificar se o logo tem as propriedades necessárias
          if (!logo || !logo.url) {
            return (
              <Text key={`invalid-logo-${index}`} style={styles.invalidLogo}>
                Logo inválida
              </Text>
            );
          }

          const fileName = logo.fileName || `Logo ${index + 1}`;

          return (
            <TouchableOpacity
              key={`logo-${index}`}
              style={styles.logoLink}
              onPress={() => this.openImageModal(logo.url, fileName)}>
              <View style={styles.logoItem}>
                <Text
                  style={styles.logoText}
                  numberOfLines={1}
                  ellipsizeMode="middle">
                  {fileName}
                </Text>
                <IconButton
                  icon="eye"
                  size={20}
                  iconColor="#000"
                  style={styles.viewIcon}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  handleCancelOrder = () => {
    this.setState({cancelDialogVisible: true});
  };

  handleConfirmCancel = (user, orderiD, reason_cancellation) => {
    const {cancelReason} = this.state;
    if (!cancelReason.trim()) {
      toastr.showToast('Por favor, informe o motivo do cancelamento!', ERROR);
      return;
    }

    this.props.onCancelOrder(user, orderiD, reason_cancellation);

    this.setState({
      cancelDialogVisible: false,
      cancelReason: '',
    });
  };

  handleSetPrice = () => {
    this.setState({priceDialogVisible: true});
  };

  handleConfirmPrice = (user, orderId) => {
    const {value_order, observation_admin} = this.state;
    if (!value_order || isNaN(parseFloat(value_order))) {
      toastr.showToast('Por favor, informe um valor válido!', ERROR);
      return;
    }

    this.props.onSetPrice(user, orderId, value_order, observation_admin);

    this.setState({
      priceDialogVisible: false,
      value_order: '',
      observation_admin: '',
    });
  };

  handleStartProduction = () => {
    this.setState({productionDialogVisible: true});
  };

  handleConfirmProduction = (user, orderId) => {
    const {estimated_finish} = this.state;
    if (!estimated_finish) {
      toastr.showToast(
        'Por favor, informe a data estimada de conclusão!',
        ERROR,
      );
      return;
    }

    this.props.OnSetEstimatedFinish(user, orderId, estimated_finish);

    this.setState({
      productionDialogVisible: false,
      estimated_finish: '',
    });
  };

  handleCompleteOrder = () => {
    this.setState({completeDialogVisible: true});
  };

  handleGenerateLabel = async (userData, orderId) => {
    this.setState({loadingGenerateLabel: true});
    const item = this.props.ordersFull[b64.encode(userData.email)][orderId];
    const details = {
      to: {
        name: userData.name,
        postal_code: userData.cep.replace('-', ''),
        address: userData.logradouro,
        number: userData.number,
        district: userData.neighborhood,
        city: userData.city,
        country: 'Brasil',
        complement: userData.complement,
        phone: userData.phone,
        email: userData.email,
        state_abbr: userData.uf,
      }, // Completar dados destinatário
      service: item.shipping.id,
      products: [
        {
          name:
            item.type === 'uniform'
              ? 'Uniforme Maskavo'
              : item.type === 'exclusive'
              ? 'Peça Exclusiva'
              : item.type === 'store'
              ? 'Compra Peça Exclusiva'
              : '-',
          quantity: 1,
          unitary_value: parseFloat(item.value_order.replace(',', '.')),
        },
        {
          name: 'Frete',
          quantity: 1,
          unitary_value: parseFloat(item.shipping.price.replace(',', '.')),
        },
      ],
      options: {receipt: false, own_hand: false},
    };
    try {
      const labelResult = await SuperFreteService.generateLabel(details);
      await new Promise(resolve => setTimeout(resolve, 2000));
      toastr.showToast(
        'Etiqueta gerada com sucesso! Acesse o App do Superfrete para realizar o pagamento.',
        SUCCESS,
        5000,
      );
    } catch (err) {
      toastr.showToast('Erro ao gerar etiqueta: ' + err, ERROR);
    }
    this.setState({loadingGenerateLabel: false});
  };

  handleConfirmComplete = (user, orderId) => {
    const {code_track} = this.state;
    if (!code_track.trim()) {
      toastr.showToast('Por favor, informe o código de rastreio!', ERROR);
      return;
    }

    this.props.OnSetCodeTrack(user, orderId, code_track);

    this.setState({
      completeDialogVisible: false,
      code_track: '',
    });
  };

  // Função para abrir link de pagamento
  handlePaymentLink = paymentLink => {
    if (paymentLink) {
      Linking.openURL(paymentLink).catch(err =>
        console.error('Erro ao abrir link de pagamento:', err),
      );
    } else {
      alert('Link de pagamento não disponível');
    }
  };

  handleTrackOrder = code_track => {
    const trackingUrl = `https://www.linkcorreios.com.br/?id=${code_track}`;
    Linking.openURL(trackingUrl).catch(err =>
      console.error('Erro ao abrir link de rastreamento:', err),
    );
  };

  // Render action buttons based on order status
  renderActionButtons = (userData, orderId) => {
    const {situation} =
      this.props.ordersFull[b64.encode(userData.email)][orderId];

    const actionButtonStyle = {marginTop: 10, marginBottom: 5};

    if (situation === 'Concluído' || situation === 'Cancelado') {
      return null;
    }

    return (
      <View style={styles.actionButtonsContainer}>
        <Divider style={[styles.divider, {marginTop: 15}]} />
        <Text style={styles.actionTitle}>Ações disponíveis:</Text>

        <Button
          mode="outlined"
          icon="close-circle"
          onPress={this.handleCancelOrder}
          style={[actionButtonStyle, {borderColor: '#D32F2F'}]}
          labelStyle={{color: '#D32F2F'}}>
          Cancelar Pedido
        </Button>

        {situation === 'Pendente' && (
          <Button
            mode="contained"
            icon="cash-register"
            onPress={this.handleSetPrice}
            style={[actionButtonStyle, {backgroundColor: '#1976D2'}]}>
            Informar Valor
          </Button>
        )}

        {situation === 'Pagamento Concluído' && (
          <Button
            mode="contained"
            icon="factory"
            onPress={this.handleStartProduction}
            style={[actionButtonStyle, {backgroundColor: '#FF9800'}]}>
            Iniciar Produção
          </Button>
        )}

        {situation === 'Em Produção' ||
          (situation === 'Aguardando Envio' && (
            <View>
              <Button
                mode="contained"
                icon="truck-outline"
                disabled={this.state.loadingGenerateLabel}
                onPress={() => this.handleGenerateLabel(userData, orderId)}
                labelStyle={this.state.loadingGenerateLabel && {color: '#fff'}}
                style={[
                  actionButtonStyle,
                  {backgroundColor: '#0fae79'},
                  this.state.loadingGenerateLabel && {opacity: 0.8},
                ]}>
                {this.state.loadingGenerateLabel
                  ? 'Gerando Etiqueta...'
                  : 'Gerar Etiqueta SuperFrete'}
              </Button>
              <Button
                mode="contained"
                icon="check-circle"
                onPress={this.handleCompleteOrder}
                style={[actionButtonStyle, {backgroundColor: '#4CAF50'}]}>
                Finalizar Pedido
              </Button>
            </View>
          ))}
      </View>
    );
  };

  render() {
    // Extrair os parâmetros da navegação
    const {route} = this.props;
    const userData = route.params?.user || {};
    const orderId = route.params?.orderId || {};

    const currentItem =
      this.props.ordersFull[b64.encode(userData.email)][orderId];

    const {modalVisible, currentImageUrl, currentImageName} = this.state;

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
      <SafeAreaView
        style={styles.container}
        edges={['bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Card 1: Detalhes do Pedido */}
          <Card style={styles.card}>
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

              <Divider style={styles.divider} />

              <View style={styles.situationContainer}>
                <View style={{flex: 1}}>
                  <Text variant="bodyMedium">
                    <Text style={styles.boldText}>Situação: </Text>
                    {this.renderSafeValue(currentItem.situation)}
                  </Text>
                </View>

                <View style={styles.lottieContainer}>
                  <LottieView
                    source={getLottieByDescription(currentItem.situation)}
                    autoPlay
                    loop
                    style={{
                      width: '100%',
                      height: getLottieHeightByDescription(
                        currentItem.situation,
                      ),
                      transform: [{scale: 2.5}],
                    }}
                  />
                </View>
              </View>

              {currentItem.type === 'store' && (
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium">
                    <Text style={styles.boldText}>Produto: </Text>
                    {this.renderSafeValue(currentItem.product.name)}
                  </Text>
                </View>
              )}

              {(currentItem.type === 'uniform' ||
                currentItem.type === 'exclusive') && (
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium">
                    <Text style={styles.boldText}>Segmento: </Text>
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
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium">
                    <Text style={styles.boldText}>Quantidade de Peças: </Text>
                    {this.renderSafeValue(currentItem.amountPieces)}
                  </Text>
                </View>
              )}

              {/* Exibição das logos como links clicáveis */}
              {currentItem.logos && (
                <View style={styles.infoRow}>
                  <Text style={styles.boldText}>Logo(s):</Text>
                  {this.renderLogos(currentItem.logos)}
                </View>
              )}

              {currentItem.type === 'store' && currentItem.product.images && (
                <View style={styles.infoRow}>
                  <Text style={styles.boldText}>Imagem(s):</Text>
                  {this.renderImagesProduct(currentItem.product.images)}
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
                      <Text style={{fontWeight: 'bold'}}>
                        Valor do pedido:{' '}
                      </Text>
                      {`R$ ${currentItem.value_order}`}
                    </Text>
                  </View>
                </View>
              )}

              {currentItem.shipping && (
                <View style={{marginBottom: 4}}>
                  <Text variant="bodyMedium">
                    <Text style={{fontWeight: 'bold'}}>Envio: </Text>
                    {currentItem.shipping.name} - R${' '}
                    {currentItem.shipping.price} - Prazo:{' '}
                    {currentItem.shipping.delivery_time} dias
                  </Text>
                </View>
              )}

              {currentItem.value_order && currentItem.shipping && (
                <View style={{marginBottom: 4}}>
                  <Text variant="bodyMedium">
                    <Text style={{fontWeight: 'bold'}}>Total: </Text>
                    <Text>R$ </Text>
                    {(
                      parseFloat(currentItem.value_order.replace(',', '.')) +
                      parseFloat(currentItem.shipping.price.replace(',', '.'))
                    )
                      .toFixed(2)
                      .replace('.', ',')}
                  </Text>
                </View>
              )}

              {/* Motivo de cancelamento (se existir) */}
              {currentItem.reason_cancellation && (
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium">
                    <Text style={[styles.boldText, {color: '#D32F2F'}]}>
                      Motivo do cancelamento:{' '}
                    </Text>
                    {this.renderSafeValue(currentItem.reason_cancellation)}
                  </Text>
                </View>
              )}

              {/* Observações do administrador (se existir) */}
              {currentItem.observation_admin && (
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium">
                    <Text style={styles.boldText}>Observações: </Text>
                    {this.renderSafeValue(currentItem.observation_admin)}
                  </Text>
                </View>
              )}

              {/* Data estimada para finalização (se existir) */}
              {currentItem.estimated_finish && (
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium">
                    <Text style={styles.boldText}>
                      Data estimada para finalizar produção:{' '}
                    </Text>
                    {currentItem.estimated_finish}
                  </Text>
                </View>
              )}

              {/* Código de rastreio (se existir) */}
              {currentItem.code_track && (
                <View
                  style={[
                    styles.infoRow,
                    {flexDirection: 'row', alignItems: 'center'},
                  ]}>
                  <View style={{flex: 1}}>
                    <Text variant="bodyMedium">
                      <Text style={styles.boldText}>Código de rastreio: </Text>
                      {this.renderSafeValue(
                        currentItem.code_track.toUpperCase(),
                      )}
                    </Text>
                  </View>
                  <Button
                    mode="contained"
                    onPress={() =>
                      this.handleTrackOrder(currentItem.code_track)
                    }
                    style={{backgroundColor: '#0066CC'}}>
                    Rastrear
                  </Button>
                </View>
              )}

              <View style={styles.dateContainer}>
                <Text variant="bodySmall" style={styles.dateText}>
                  Data: {formattedDate}
                </Text>
              </View>

              {/* Add the action buttons here */}
              {this.renderActionButtons(userData, orderId)}
            </Card.Content>
          </Card>

          {/* Card 2: Dados do Cliente */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.userHeaderContainer}>
                <View style={styles.avatarContainer}>
                  {userData.fileImgPath ? (
                    <ShimmerPlaceholder
                      LinearGradient={LinearGradient}
                      visible={!this.state.imageLoading}
                      height={80}
                      width={80}
                      style={{
                        borderRadius: 50,
                      }}>
                      <Avatar.Image
                        size={80}
                        source={{uri: userData.fileImgPath}}
                        onLoadStart={() => this.setState({imageLoading: true})}
                        onLoadEnd={() => this.setState({imageLoading: false})}
                      />
                    </ShimmerPlaceholder>
                  ) : (
                    <Avatar.Text
                      size={80}
                      label={
                        userData.name
                          ? userData.name.charAt(0).toUpperCase()
                          : '?'
                      }
                      color="#FFF"
                      backgroundColor={colors.SECONDARY}
                    />
                  )}
                </View>
                <View style={styles.userHeaderInfo}>
                  <Title style={styles.userName}>{userData.name || '-'}</Title>
                  <Subheading style={styles.userEmail}>
                    {userData.email || '-'}
                  </Subheading>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.infoRow}>
                <Text variant="bodyMedium">
                  <Text style={styles.boldText}>CPF/CNPJ: </Text>
                  {userData.cpfcnpj || '-'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodyMedium">
                  <Text style={styles.boldText}>Telefone: </Text>
                  {userData.phone || '-'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodyMedium">
                  <Text style={styles.boldText}>CEP: </Text>
                  {userData.cep || '-'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodyMedium">
                  <Text style={styles.boldText}>Endereço: </Text>
                  {userData.logradouro
                    ? `${userData.logradouro}, ${userData.number || '-'}`
                    : '-'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodyMedium">
                  <Text style={styles.boldText}>Complemento: </Text>
                  {userData.complement ? userData.complement : '-'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodyMedium">
                  <Text style={styles.boldText}>Bairro: </Text>
                  {userData.neighborhood ? userData.neighborhood : '-'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodyMedium">
                  <Text style={styles.boldText}>Cidade/UF: </Text>
                  {userData.city ? `${userData.city}/${userData.state}` : '-'}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Modal para exibir a imagem */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={this.closeImageModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{currentImageName}</Text>

              <View style={styles.imageContainer}>
                <ShimmerPlaceholder
                  LinearGradient={LinearGradient}
                  visible={!this.state.imageLoading}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 5,
                  }}>
                  <Image
                    source={{uri: currentImageUrl}}
                    style={styles.modalImage}
                    resizeMode="contain"
                    onLoadStart={() => this.setState({imageLoading: true})}
                    onLoadEnd={() => this.setState({imageLoading: false})}
                  />
                </ShimmerPlaceholder>
              </View>

              <Button
                mode="contained"
                onPress={this.closeImageModal}
                style={styles.closeButton}
                labelStyle={styles.closeButtonLabel}>
                Fechar
              </Button>
            </View>
          </View>
        </Modal>

        {/* Cancel Order Dialog */}
        <Modal
          visible={this.state.cancelDialogVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.setState({cancelDialogVisible: false})}>
          <View style={styles.dialogContainer}>
            <View style={styles.dialogContent}>
              <Title style={styles.dialogTitle}>Cancelar Pedido</Title>
              <Text style={styles.dialogText}>
                Tem certeza que deseja cancelar este pedido? Esta ação não pode
                ser desfeita.
              </Text>

              <TextInput
                label="Motivo do cancelamento"
                value={this.state.cancelReason}
                onChangeText={text => this.setState({cancelReason: text})}
                style={styles.dialogInput}
                mode="outlined"
                multiline
                numberOfLines={3}
                theme={{
                  colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                }}
              />

              <View style={styles.dialogActions}>
                <Button
                  onPress={() => this.setState({cancelDialogVisible: false})}
                  style={{marginRight: 10}}
                  labelStyle={{color: '#000'}}>
                  Voltar
                </Button>
                <Button
                  mode="contained"
                  onPress={() =>
                    this.handleConfirmCancel(
                      userData,
                      orderId,
                      this.state.cancelReason,
                    )
                  }
                  buttonColor="#D32F2F">
                  Confirmar
                </Button>
              </View>
            </View>
          </View>
          <Toast config={toastConfig} />
        </Modal>

        {/* Set Price Dialog */}
        <Modal
          visible={this.state.priceDialogVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.setState({priceDialogVisible: false})}>
          <View style={styles.dialogContainer}>
            <View style={styles.dialogContent}>
              <Title style={styles.dialogTitle}>Informar Valor</Title>

              <TextInput
                label="Valor do pedido (R$)"
                value={this.state.value_order}
                onChangeText={text => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  const floatValue = parseFloat(numericValue) / 100;
                  const formattedValue = floatValue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 2,
                  });

                  const finalValue = formattedValue.replace('R$', '').trim();

                  this.setState({value_order: finalValue});
                }}
                style={styles.dialogInput}
                mode="outlined"
                keyboardType="numeric"
                theme={{
                  colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                }}
              />

              <TextInput
                label="Observações (opcional)"
                value={this.state.observation_admin}
                onChangeText={text => this.setState({observation_admin: text})}
                style={styles.dialogInput}
                mode="outlined"
                multiline
                numberOfLines={3}
                theme={{
                  colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                }}
              />

              <View style={styles.dialogActions}>
                <Button
                  onPress={() => this.setState({priceDialogVisible: false})}
                  style={{marginRight: 10}}
                  labelStyle={{color: '#000'}}>
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={() => this.handleConfirmPrice(userData, orderId)}
                  buttonColor="#1976D2">
                  Confirmar
                </Button>
              </View>
            </View>
          </View>
          <Toast config={toastConfig} />
        </Modal>

        {/* Start Production Dialog */}
        <Modal
          visible={this.state.productionDialogVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() =>
            this.setState({productionDialogVisible: false})
          }>
          <View style={styles.dialogContainer}>
            <View style={styles.dialogContent}>
              <Title style={styles.dialogTitle}>Iniciar Produção</Title>
              <Text style={styles.dialogText}>
                Informe a data estimada para conclusão do pedido:
              </Text>

              <View>
                <TextInput
                  label="Data estimada"
                  value={this.state.estimated_finish}
                  editable={false} // Torna o campo não digitável
                  style={styles.dialogInput}
                  mode="outlined"
                  right={
                    <TextInput.Icon
                      icon="calendar"
                      onPress={this.showDatePicker}
                    />
                  }
                  theme={{
                    colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                  }}
                />

                <PaperProvider
                  theme={{
                    colors: {
                      primary: '#000000',
                      onPrimary: '#FFFFFF',
                      primaryContainer: '#000000',
                      onPrimaryContainer: '#FFFFFF',
                      secondary: '#000000',
                      background: '#FFFFFF',
                      surface: '#FFFFFF',
                      onSurface: '#000000',
                    },
                    // Forçar o tema v3 (MD3) para remover o ícone de lápis
                    version: 3,
                  }}>
                  <DatePickerModal
                    locale="pt-BR"
                    mode="single"
                    visible={this.state.datePickerVisible}
                    onDismiss={this.hideDatePicker}
                    date={this.state.selectedDate}
                    onConfirm={params => {
                      const {date} = params;
                      if (date) {
                        // Formata a data para o formato brasileiro (DD/MM/AAAA)
                        const day = date.getDate().toString().padStart(2, '0');
                        const month = (date.getMonth() + 1)
                          .toString()
                          .padStart(2, '0');
                        const year = date.getFullYear();
                        const formattedDate = `${day}/${month}/${year}`;

                        this.setState({
                          selectedDate: date,
                          estimated_finish: formattedDate,
                          datePickerVisible: false,
                        });
                      }
                    }}
                    saveLabel="Confirmar"
                    label="Selecione a data"
                    animationType="fade"
                    presentationStyle="overFullScreen"
                    validRange={{
                      startDate: new Date(),
                    }}
                  />
                </PaperProvider>
              </View>

              <View style={styles.dialogActions}>
                <Button
                  onPress={() =>
                    this.setState({productionDialogVisible: false})
                  }
                  style={{marginRight: 10}}
                  labelStyle={{color: '#000'}}>
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={() =>
                    this.handleConfirmProduction(userData, orderId)
                  }
                  buttonColor="#FF9800">
                  Confirmar
                </Button>
              </View>
            </View>
          </View>
          <Toast config={toastConfig} />
        </Modal>

        {/* Complete Order Dialog */}
        <Modal
          visible={this.state.completeDialogVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.setState({completeDialogVisible: false})}>
          <View style={styles.dialogContainer}>
            <View style={styles.dialogContent}>
              <Title style={styles.dialogTitle}>Finalizar Pedido</Title>
              <Text style={styles.dialogText}>
                Informe o código de rastreio para concluir o pedido:
              </Text>

              <TextInput
                label="Código de rastreio"
                mode="outlined"
                value={this.state.code_track}
                onChangeText={text => this.setState({code_track: text})}
                style={styles.dialogInput}
                theme={{
                  colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                }}
              />

              <View style={styles.dialogActions}>
                <Button
                  onPress={() => this.setState({completeDialogVisible: false})}
                  style={{marginRight: 10}}
                  labelStyle={{color: '#000'}}>
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={() => this.handleConfirmComplete(userData, orderId)}
                  buttonColor="#4CAF50">
                  Finalizar
                </Button>
              </View>
            </View>
          </View>
        </Modal>
        <Toast config={toastConfig} />
      </SafeAreaView>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onCancelOrder: (user, orderiD, reason_cancellation) =>
    dispatch(cancelOrder(user, orderiD, reason_cancellation)),
  onSetPrice: (user, orderiD, value_order, observation_admin) =>
    dispatch(setPrice(user, orderiD, value_order, observation_admin)),
  OnSetEstimatedFinish: (user, orderiD, estimated_finish) =>
    dispatch(setEstimatedFinish(user, orderiD, estimated_finish)),
  OnSetCodeTrack: (user, orderiD, code_track) =>
    dispatch(setCodeTrack(user, orderiD, code_track)),
});

const mapStateToProps = state => ({
  ordersFull: state.orderReducer.ordersFull,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ManagerOrdersDetails);
