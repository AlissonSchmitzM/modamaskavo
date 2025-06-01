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
  Linking,
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
import {launchImageLibrary} from 'react-native-image-picker'; // Biblioteca que você já tem
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
      selectedLogos: [], // Array para armazenar os arquivos de logo selecionados
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
  }

  renderBtnRegister() {
    if (this.props.registerOrderInProgress) {
      return <ActivityIndicator size="large" color={colors.PRIMARY} />;
    }
    return (
      <Button
        ref={this.btnRegisterRef}
        mode="contained"
        style={styles.button}
        onPress={this.handleSubmit}>
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
      toastr.showToast('Descrição é obrigatório!', ERROR);
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
      toastr.showToast('Descrição é obrigatório!', ERROR);
      return false;
    }

    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.showDropdown && !prevState.showDropdown) {
      this.measureInput();
    }
  }

  // Medir a posição e tamanho do input quando necessário
  measureInput = () => {
    if (this.inputRef.current) {
      this.inputRef.current.measureInWindow((x, y, width, height) => {
        this.setState({
          inputLayout: {x, y, width, height},
        });
      });
    }
  };

  setSelectedOption = value => {
    this.setState({selectedOption: value});

    this.props.onModifySegment('');
    this.props.onModifyDescription('');
    this.props.onModifyType(value);
  };

  setSelectedTamanho = value => {
    this.setState({selectedTamanho: value});

    this.props.onModifyTam(value);
  };

  setShowDropdown = value => {
    this.setState({showDropdown: value});
  };

  handleSubmit = () => {
    if (this.state.selectedOption === 'uniform') {
      if (this.validateFieldsUniform()) {
        this.props.onCreateOrder({
          ...this.props,
          selectedLogos: this.state.selectedLogos, // Passa os arquivos selecionados
        });
      }
    } else {
      if (this.validateFieldsExclusive()) {
        this.props.onCreateOrder(this.props);
      }
    }
  };

  // Função para selecionar arquivos de logo
  pickLogoFiles = () => {
    const options = {
      mediaType: 'mixed', // permite imagens e vídeos
      selectionLimit: 0, // 0 significa sem limite
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('Usuário cancelou a seleção de imagens');
      } else if (response.errorCode) {
        console.log('Erro ao selecionar imagem: ', response.errorMessage);
        alert('Erro ao selecionar arquivo. Tente novamente.');
      } else {
        // Adicionar novos arquivos ao array existente
        if (response.assets && response.assets.length > 0) {
          this.setState(prevState => ({
            selectedLogos: [...prevState.selectedLogos, ...response.assets],
          }));
        }
      }
    });
  };

  // Função para remover um arquivo dos arquivos selecionados
  removeFile = fileToRemove => {
    this.setState(prevState => ({
      selectedLogos: prevState.selectedLogos.filter(
        file => file.uri !== fileToRemove.uri,
      ),
    }));
  };

  // Função para renderizar a pré-visualização do arquivo
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

  // Exemplo de itens para o dropdown
  tamanhos = ['P', 'M', 'G', 'GG', 'T-Nobres'];

  render() {
    const {
      selectedOption,
      selectedTamanho,
      showDropdown,
      inputLayout,
      selectedLogos,
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
                      {/* ComboBox somente seleção (não permite digitação) */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => this.setShowDropdown(true)}>
                        <TextInput
                          label="Tamanho"
                          ref={this.tamRef}
                          style={styles.input}
                          mode="outlined"
                          theme={{colors: {primary: '#000000'}}}
                          value={this.props.tam}
                          editable={false} // Impede a digitação
                          pointerEvents="none" // Impede interação direta com o input
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

                    {/* Seletor de arquivos para logo */}
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

                      {/* Exibir arquivos selecionados */}
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
                  style={styles.input}
                  mode="outlined"
                  value={this.props.description}
                  onChangeText={text => this.props.onModifyDescription(text)}
                  theme={{colors: {primary: '#000000'}}}
                  multiline={true}
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
              {this.renderBtnRegister()}
            </View>
          </ScrollView>

          {/* Modal para exibir as opções do dropdown */}
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
                      }}>
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.dropdownList}
                />
              </Surface>
            </TouchableOpacity>
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
});

export default connect(mapStateToProps, mapDispatchToProps)(Orders);
