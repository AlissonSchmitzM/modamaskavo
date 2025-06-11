import React, {Component} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
} from 'react-native';
import {
  Text,
  RadioButton,
  TextInput,
  Button,
  Surface,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import {order} from '../../../assets';
import LottieView from 'lottie-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import styles from './Styles';
import {colors} from '../../../styles/Styles';
import {launchImageLibrary} from 'react-native-image-picker';
import {connect} from 'react-redux';
import {
  createOrder,
  modifyDescription,
  modifySegment,
  modifyTam,
  modifyAmountPieces,
  modifyType,
} from '../../../store/actions/orderActions';
import {readDataUser} from '../../../store/actions/userActions';
import toastr, {ERROR, toastConfig} from '../../../services/toastr';
import {SuperFreteService} from '../../../services/SuperFreteService';
import modalStyles from './ModalStyles';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

class Orders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: 'exclusive',
      selectedTamanho: '',
      showDropdown: false,
      inputLayout: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      selectedLogos: [],
      showShippingModal: false,
      shippingLoading: false,
      shippingOptions: [],
      selectedShippingOption: null,
      shippingError: null,
    };

    this.inputRef = React.createRef();
    this.segmentRef = React.createRef();
    this.tamRef = React.createRef();
    this.descriptionRef = React.createRef();
    this.amountPiecesRef = React.createRef();
    this.btnRegisterRef = React.createRef();
  }

  componentDidMount() {
    this.props.onReadDataUser();
    if (!this.props.type) {
      this.props.onModifyType(this.state.selectedOption);
    }
  }

  renderBtnRegister() {
    if (this.props.registerOrderInProgress) {
      return (
        <ActivityIndicator
          size="large"
          style={{marginBottom: 20}}
          color={colors.PRIMARY}
        />
      );
    }
    return (
      <Button
        ref={this.btnRegisterRef}
        mode="contained"
        style={styles.button}
        onPress={this.handleOpenShippingModal}>
        Enviar
      </Button>
    );
  }

  validateFieldsExclusive() {
    if (!this.props.segment) {
      toastr.showToast('Segmento é obrigatório!', ERROR);
      return false;
    } else if (!this.props.tam) {
      toastr.showToast('Tamanho é obrigatório!', ERROR);
      return false;
    } else if (!this.props.description) {
      toastr.showToast('Descrição é obrigatória!', ERROR);
      return false;
    }
    return true;
  }

  validateFieldsUniform() {
    if (!this.props.segment) {
      toastr.showToast('Segmento é obrigatório!', ERROR);
      return false;
    } else if (!this.props.amountPieces) {
      toastr.showToast('Quantidade de peças é obrigatória!', ERROR);
      return false;
    } else if (this.state.selectedLogos.length === 0) {
      toastr.showToast(
        'É necessário selecionar ao menos 1 arquivo para logo!',
        ERROR,
      );
      return false;
    } else if (!this.props.description) {
      toastr.showToast('Descrição é obrigatória!', ERROR);
      return false;
    }

    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.showDropdown && !prevState.showDropdown) {
      this.measureInput();
    }
    if (this.state.showShippingModal && !prevState.showShippingModal) {
      this.handleCalculateShipping();
    }
  }

  measureInput = () => {
    if (this.inputRef.current) {
      this.inputRef.current.measureInWindow((x, y, width, height) => {
        this.setState({inputLayout: {x, y, width, height}});
      });
    }
  };

  setSelectedOption = value => {
    this.setState({selectedOption: value});
    this.props.onModifySegment('');
    this.props.onModifyDescription('');
    this.props.onModifyType(value); // Atualiza o tipo no Redux
    if (value === 'exclusive') {
      this.props.onModifyAmountPieces('');
      this.setState({selectedLogos: []});
    } else {
      this.props.onModifyTam('');
    }
  };

  setSelectedTamanho = value => {
    this.props.onModifyTam(value);
  };

  setShowDropdown = value => {
    this.setState({showDropdown: value});
  };

  handleOpenShippingModal = () => {
    let isValid = false;
    if (this.state.selectedOption === 'uniform') {
      isValid = this.validateFieldsUniform();
    } else {
      isValid = this.validateFieldsExclusive();
    }

    if (isValid) {
      if (!this.props.userCep) {
        toastr.showToast(
          'CEP do usuário não encontrado. Verifique o cadastro.',
          ERROR,
        );
        return;
      }

      this.setState({
        showShippingModal: true,
        shippingOptions: [],
        selectedShippingOption: null,
        shippingError: null,
        shippingLoading: false,
      });
    }
  };

  handleCloseShippingModal = () => {
    this.setState({showShippingModal: false});
  };

  handleCalculateShipping = async () => {
    this.setState({
      shippingLoading: true,
      shippingError: null,
      shippingOptions: [],
    });
    try {
      const options = await SuperFreteService.calculateShipping(
        this.props.userCep,
      );
      if (Array.isArray(options) && options.length > 0) {
        this.setState({shippingOptions: options, shippingLoading: false});
      } else {
        console.warn('Nenhuma opção de frete retornada pela API.', options);
        this.setState({
          shippingError: 'Nenhuma opção de frete encontrada para este CEP.',
          shippingLoading: false,
        });
      }
    } catch (err) {
      console.error('Erro ao calcular frete na modal:', err);
      this.setState({
        shippingError: err.message || 'Erro ao calcular frete.',
        shippingLoading: false,
      });
    }
  };

  handleSelectShippingOption = option => {
    this.setState({selectedShippingOption: option}, () => {
      this.handleCloseShippingModal();
      this.proceedWithOrderCreation();
    });
  };

  proceedWithOrderCreation = () => {
    const {selectedShippingOption, selectedLogos} = this.state;

    const orderData = {
      ...this.props,
      selectedLogos:
        this.state.selectedOption === 'uniform' ? selectedLogos : [],
      selectedShipping: {
        id: selectedShippingOption.id,
        name: selectedShippingOption.name,
        price: selectedShippingOption.price.toFixed(2).replace('.', ','),
        delivery_time: selectedShippingOption.delivery_time,
        company: selectedShippingOption.company?.name,
      },
    };

    this.props.onCreateOrder(orderData);
  };

  // Função para solicitar permissão de galeria/armazenamento
  requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // Para Android 13+ (API 33+)
        if (parseInt(Platform.Version, 10) >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Permissão de Acesso às Fotos',
              message:
                'Este aplicativo precisa de acesso às suas fotos para selecionar imagens de perfil.',
              buttonNeutral: 'Pergunte-me depois',
              buttonNegative: 'Cancelar',
              buttonPositive: 'OK',
            },
          );

          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        // Para Android 12 e anteriores
        else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Permissão de Acesso às Fotos',
              message:
                'Este aplicativo precisa de acesso às suas fotos para selecionar imagens de perfil.',
              buttonNeutral: 'Pergunte-me depois',
              buttonNegative: 'Cancelar',
              buttonPositive: 'OK',
            },
          );

          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else if (Platform.OS === 'ios') {
      try {
        // No iOS, usamos PHOTO_LIBRARY ou MEDIA_LIBRARY dependendo da necessidade
        const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        return result === RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }

    return true; // Para outras plataformas (web, etc.)
  };

  pickLogoFiles = async () => {
    // Primeiro, solicita permissão
    const hasStoragePermission = await this.requestStoragePermission();

    if (!hasStoragePermission) {
      toastr.showToast(
        'Permissão de acesso às fotos necessária para esta funcionalidade',
        ERROR,
      );
      return;
    }

    const options = {
      mediaType: 'mixed',
      selectionLimit: 0,
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('Usuário cancelou a seleção de imagens');
      } else if (response.errorCode) {
        console.log('Erro ao selecionar imagem: ', response.errorMessage);
        toastr.showToast('Erro ao selecionar arquivo. Tente novamente.', ERROR);
      } else {
        if (response.assets && response.assets.length > 0) {
          this.setState(prevState => ({
            selectedLogos: [...prevState.selectedLogos, ...response.assets],
          }));
        }
      }
    });
  };

  removeFile = fileToRemove => {
    this.setState(prevState => ({
      selectedLogos: prevState.selectedLogos.filter(
        file => file.uri !== fileToRemove.uri,
      ),
    }));
  };

  renderFilePreview = file => {
    return (
      <View style={styles.filePreviewContainer} key={file.uri}>
        <Chip
          icon="file-image"
          onClose={() => this.removeFile(file)}
          style={styles.fileChip}
          textStyle={styles.fileChipText}
          theme={{colors: {surface: '#FFFFFF', primary: '#000000'}}}
          iconColor="#000000"
          closeIconColor="#000000">
          {file.fileName && file.fileName.length > 15
            ? `${file.fileName.substring(0, 15)}...`
            : file.fileName || 'Arquivo'}
        </Chip>
        <Image
          source={{uri: file.uri}}
          style={styles.filePreviewImage}
          resizeMode="cover"
        />
      </View>
    );
  };

  tamanhos = ['P', 'M', 'G', 'GG', 'T-Nobres'];

  render() {
    const {
      selectedOption,
      showDropdown,
      inputLayout,
      selectedLogos,
      showShippingModal,
      shippingLoading,
      shippingOptions,
      shippingError,
    } = this.state;

    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: '#f5f5f5', marginTop: 30}}
        edges={['left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 40}
          style={{flex: 1}}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Pedidos</Text>
              <LottieView source={order} autoPlay loop style={styles.lottie} />
            </View>
            <View style={styles.content}>
              <RadioButton.Group
                onValueChange={value => this.setSelectedOption(value)}
                value={selectedOption}>
                <View style={styles.radioGroup}>
                  <RadioButton.Item
                    color="#000"
                    label="Peças Exclusivas"
                    value="exclusive"
                  />
                  <RadioButton.Item
                    color="#000"
                    label="Uniformes"
                    value="uniform"
                  />
                </View>
              </RadioButton.Group>

              <View style={styles.inputsContainer}>
                <TextInput
                  label="Segmento"
                  ref={this.segmentRef}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    if (selectedOption === 'exclusive') {
                      this.setShowDropdown(true);
                    } else {
                      this.amountPiecesRef.current?.focus();
                    }
                  }}
                  style={styles.input}
                  mode="outlined"
                  value={this.props.segment}
                  onChangeText={text => this.props.onModifySegment(text)}
                  theme={{colors: {primary: '#000000'}}}
                />

                {selectedOption === 'exclusive' && (
                  <>
                    <View
                      style={styles.inputWrapper}
                      ref={this.inputRef}
                      onLayout={this.measureInput}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => this.setShowDropdown(true)}>
                        <TextInput
                          label="Tamanho"
                          ref={this.tamRef} // Mantido para referência se necessário, mas valor vem de props
                          style={styles.input}
                          mode="outlined"
                          theme={{colors: {primary: '#000000'}}}
                          value={this.props.tam} // Usar valor do Redux
                          editable={false}
                          pointerEvents="none"
                          right={
                            <TextInput.Icon
                              icon="chevron-down"
                              onPress={() => this.setShowDropdown(true)}
                              color="#000000"
                            />
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {selectedOption === 'uniform' && (
                  <>
                    <TextInput
                      label="Quantidade de Peças"
                      ref={this.amountPiecesRef}
                      returnKeyType="next"
                      onSubmitEditing={this.pickLogoFiles}
                      style={styles.input}
                      mode="outlined"
                      onChangeText={text =>
                        this.props.onModifyAmountPieces(text)
                      }
                      value={this.props.amountPieces}
                      theme={{colors: {primary: '#000000'}}}
                      keyboardType="numeric"
                    />
                    <View style={styles.fileUploadContainer}>
                      <Text style={styles.fileUploadLabel}>Logo</Text>
                      <View style={styles.fileUploadControls}>
                        <Button
                          mode="outlined"
                          icon="file-upload"
                          onPress={this.pickLogoFiles}
                          style={styles.fileUploadButton}
                          theme={{colors: {primary: '#000000'}}}
                          labelStyle={{color: '#000000'}}
                          iconColor="#000000">
                          {selectedLogos.length > 0
                            ? 'Adicionar mais arquivos'
                            : 'Selecionar arquivos'}
                        </Button>
                      </View>
                      {selectedLogos.length > 0 && (
                        <View style={styles.selectedFilesContainer}>
                          <Text style={styles.selectedFilesTitle}>
                            Arquivos selecionados ({selectedLogos.length}):
                          </Text>
                          <View style={styles.filePreviewsWrapper}>
                            {selectedLogos.map(file =>
                              this.renderFilePreview(file),
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  </>
                )}

                <TextInput
                  label="Breve descrição"
                  ref={this.descriptionRef} // Adicionado ref
                  style={styles.input}
                  mode="outlined"
                  value={this.props.description}
                  onChangeText={text => this.props.onModifyDescription(text)}
                  theme={{colors: {primary: '#000000'}}}
                  multiline={true}
                  numberOfLines={5}
                  textAlignVertical="top"
                  returnKeyType="done"
                  onSubmitEditing={this.handleOpenShippingModal}
                />
              </View>
              {this.renderBtnRegister()}
            </View>
          </ScrollView>

          {/* Modal Dropdown Tamanho */}
          <Modal
            visible={showDropdown}
            transparent={true}
            animationType="none"
            onRequestClose={() => this.setShowDropdown(false)}
            onShow={this.measureInput}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => this.setShowDropdown(false)}>
              <Surface
                style={[
                  styles.dropdownContainer,
                  {
                    position: 'absolute',
                    top: inputLayout.y + inputLayout.height,
                    left: inputLayout.x,
                    width: inputLayout.width,
                  },
                ]}>
                <FlatList
                  data={this.tamanhos}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        this.setSelectedTamanho(item);
                        this.setShowDropdown(false);
                        this.descriptionRef.current?.focus();
                      }}>
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.dropdownList}
                />
              </Surface>
            </TouchableOpacity>
          </Modal>

          {/* Modal Cálculo de Frete */}
          <Modal
            visible={showShippingModal}
            transparent={true}
            animationType="slide"
            onRequestClose={this.handleCloseShippingModal}>
            <View style={modalStyles.modalContainer}>
              <Surface style={modalStyles.modalContent}>
                <Text style={modalStyles.modalTitle}>Selecionar Frete</Text>
                <Text style={modalStyles.modalCepInfo}>
                  Calculando para o CEP: {this.props.userCep || 'N/A'}
                </Text>
                <Text style={[modalStyles.modalCepInfo, {fontWeight: 'bold'}]}>
                  Obs: O prazo é calculado a partir do fim da produção, ou seja,
                  quando o pedido for concluido. O código de rastreio será
                  enviado após o envio da mercadoria.
                </Text>

                {shippingLoading && (
                  <View style={modalStyles.centeredView}>
                    <ActivityIndicator size="large" color={colors.PRIMARY} />
                    <Text style={modalStyles.loadingText}>
                      Calculando opções...
                    </Text>
                  </View>
                )}

                {shippingError && (
                  <View style={modalStyles.centeredView}>
                    <Text style={modalStyles.errorText}>
                      Erro: {shippingError}
                    </Text>
                    <Button onPress={this.handleCalculateShipping}>
                      Tentar Novamente
                    </Button>
                  </View>
                )}

                {!shippingLoading &&
                  !shippingError &&
                  shippingOptions.length > 0 && (
                    <FlatList
                      data={shippingOptions}
                      keyExtractor={item => item.id.toString()} // Usa o ID do serviço como chave
                      renderItem={({item}) => (
                        <TouchableOpacity
                          style={modalStyles.optionItem}
                          onPress={() => this.handleSelectShippingOption(item)}>
                          <View style={modalStyles.optionDetails}>
                            <Text style={modalStyles.optionName}>
                              {item.name} ({item.company?.name || 'N/A'})
                            </Text>
                            <Text style={modalStyles.optionPrice}>
                              R${' '}
                              {item.price?.toFixed(2).replace('.', ',') ||
                                'N/A'}
                            </Text>
                          </View>
                          <Text style={modalStyles.optionDelivery}>
                            Prazo: {item.delivery_time || 'N/A'} dias
                          </Text>
                        </TouchableOpacity>
                      )}
                      style={modalStyles.optionsList}
                    />
                  )}

                {!shippingLoading &&
                  !shippingError &&
                  shippingOptions.length === 0 && (
                    <View style={modalStyles.centeredView}>
                      <Text>Nenhuma opção de frete encontrada.</Text>
                    </View>
                  )}

                <Button
                  mode="outlined"
                  onPress={this.handleCloseShippingModal}
                  style={modalStyles.closeButton}
                  disabled={shippingLoading}
                  theme={{colors: {primary: '#000000'}}}>
                  Cancelar
                </Button>
              </Surface>
            </View>
          </Modal>
        </KeyboardAvoidingView>
        <Toast config={toastConfig} />
      </SafeAreaView>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onReadDataUser: () => dispatch(readDataUser()),
  onCreateOrder: order => dispatch(createOrder(order)),
  onModifyType: type => dispatch(modifyType(type)),
  onModifySegment: segment => dispatch(modifySegment(segment)),
  onModifyAmountPieces: amountPieces =>
    dispatch(modifyAmountPieces(amountPieces)),
  onModifyTam: tam => dispatch(modifyTam(tam)),
  onModifyDescription: description => dispatch(modifyDescription(description)),
});

const mapStateToProps = state => ({
  registerOrderInProgress: state.orderReducer.registerOrderInProgress,
  type: state.orderReducer.type,
  segment: state.orderReducer.segment,
  tam: state.orderReducer.tam,
  amountPieces: state.orderReducer.amountPieces,
  description: state.orderReducer.description,
  userCep: state.userReducer.cep,
});

export default connect(mapStateToProps, mapDispatchToProps)(Orders);
