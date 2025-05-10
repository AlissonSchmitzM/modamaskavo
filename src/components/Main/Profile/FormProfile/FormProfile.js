import React, {useState, Component} from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  Text,
  Modal,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  ActivityIndicator,
  Avatar,
  IconButton,
  Menu,
  Divider,
  PaperProvider,
  Portal,
  Surface,
} from 'react-native-paper';
import {
  CpfCnpjInput,
  PhoneInput,
  CepInput,
  LoadingOverlay,
} from '../../../../common';
import {connect} from 'react-redux';
import {
  fetchAddressByCep,
  modifyAddress,
  modifyNeighborhood,
  modifyCity,
  modifyState,
  modifyName,
  modifyCpfCnpj,
  modifyPhone,
  modifyCep,
  modifyNumber,
  modifyComplement,
  saveProfileUser,
  readDataUser,
  modifyPhoto,
  // Você precisará adicionar estas ações para gerenciar a imagem do perfil
  //updateProfileImage,
} from '../../../../store/actions/userActions';
import toastr, {ERROR} from '../../../../services/toastr';
import Toast from 'react-native-toast-message';
import {colors} from '../../../../styles/Styles';
import styles from './Styles';
// Importe a biblioteca para seleção de imagens (você precisará instalá-la)
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

class FormProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      menuVisible: false, // Estado para controlar a visibilidade do menu de imagem
      imageMenuVisible: false, // Estado para o menu personalizado
    };

    this.btnRegisterRef = React.createRef();
  }

  componentDidMount() {
    this.props.onReadDataUser();
  }

  handleCompleteCep = cep => {
    console.log('cep', cep);
    if (cep && cep.length >= 8) {
      this.props.onFetchAddressByCep(cep);
    }

    if (this.props.error) {
      toastr.showToast(this.props.error, ERROR);
    }
  };

  // Métodos para gerenciar o menu de seleção de imagem
  openImageMenu = () => this.setState({imageMenuVisible: true});
  closeImageMenu = () => this.setState({imageMenuVisible: false});

  // Função para solicitar permissão de câmera
  requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Permissão de Câmera',
          message:
            'Este aplicativo precisa de acesso à sua câmera para tirar fotos de perfil.',
          buttonNeutral: 'Pergunte-me depois',
          buttonNegative: 'Cancelar',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permissão de câmera concedida');
        return true;
      } else {
        console.log('Permissão de câmera negada');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Função para solicitar permissão de galeria/armazenamento
  requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

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
  };

  // Método para abrir a câmera com verificação de permissão
  handleCamera = async () => {
    // Primeiro, solicita permissão
    const hasCameraPermission = await this.requestCameraPermission();

    if (!hasCameraPermission) {
      toastr.showToast(
        'Permissão de câmera necessária para esta funcionalidade',
        ERROR,
      );
      this.closeImageMenu();
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: false,
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('Usuário cancelou a captura');
      } else if (response.errorCode) {
        toastr.showToast(
          'Erro ao acessar a câmera: ' + response.errorMessage,
          ERROR,
        );
      } else if (response.assets && response.assets.length > 0) {
        this.props.onModifyPhoto(
          response.assets[0].uri,
          response.assets[0].type,
        );
      }
      this.closeImageMenu();
    });
  };

  // Método para abrir a galeria com verificação de permissão
  handleGallery = async () => {
    // Primeiro, solicita permissão
    const hasStoragePermission = await this.requestStoragePermission();

    if (!hasStoragePermission) {
      toastr.showToast(
        'Permissão de acesso às fotos necessária para esta funcionalidade',
        ERROR,
      );
      this.closeImageMenu();
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('Usuário cancelou a seleção');
      } else if (response.errorCode) {
        toastr.showToast(
          'Erro ao acessar a galeria: ' + response.errorMessage,
          ERROR,
        );
      } else if (response.assets && response.assets.length > 0) {
        this.props.onModifyPhoto(
          response.assets[0].uri,
          response.assets[0].type,
        );
      }
      this.closeImageMenu();
    });
  };

  renderBtnRegister() {
    if (this.props.saveProfileInProgress) {
      return <ActivityIndicator size="large" color={colors.PRIMARY} />;
    }
    return (
      <Button
        ref={this.btnRegisterRef}
        mode="contained"
        style={styles.button}
        onPress={() => {
          if (this.validateFields()) {
            this.props.onSaveProfileUser(this.props);
          }
        }}>
        Salvar
      </Button>
    );
  }

  validateFields() {
    if (!this.props.name) {
      toastr.showToast('Nome é obrigatório!', ERROR);
      return false;
    } else if (!this.props.cpfcnpj) {
      toastr.showToast('CPF/CNPJ inválido!', ERROR);
      return false;
    } else if (!this.props.phone) {
      toastr.showToast('Telefone inválido!', ERROR);
      return false;
    } else if (!this.props.cep) {
      toastr.showToast('CEP inválido!', ERROR);
      return false;
    } else if (!this.props.address.logradouro) {
      toastr.showToast('Endereço inválido!', ERROR);
      return false;
    } else if (!this.props.number) {
      toastr.showToast('Número inválido!', ERROR);
      return false;
    } else if (!this.props.address.neighborhood) {
      toastr.showToast('Bairro inválido!', ERROR);
      return false;
    } else if (!this.props.address.city) {
      toastr.showToast('Cidade inválida!', ERROR);
      return false;
    } else if (!this.props.address.state) {
      toastr.showToast('Estado inválido!', ERROR);
      return false;
    }

    return true;
  }

  render() {
    const {address, loading} = this.props;
    const {imageMenuVisible} = this.state;

    return (
      <PaperProvider>
        <View style={{flex: 1}}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
              <View style={styles.containerAvatar}>
                {this.props.fileImgPath ? (
                  <Avatar.Image
                    size={100}
                    source={{uri: this.props.fileImgPath}}
                  />
                ) : (
                  <Avatar.Text
                    color="#FFF"
                    backgroundColor={colors.SECONDARY}
                    size={100}
                    label={this.props.name.charAt(0)}
                  />
                )}
                <View style={styles.containerAvatarIcon}>
                  <IconButton
                    icon="pencil"
                    size={14}
                    iconColor="white"
                    onPress={this.openImageMenu}
                    style={{margin: 0, padding: 0}}
                  />
                </View>
              </View>
              <View>
                <Text style={{fontSize: 16, color: colors.SECONDARY}}>
                  {this.props.email}
                </Text>
              </View>
              <TextInput
                autoFocus
                label="Nome"
                style={styles.input}
                value={this.props.name}
                onChangeText={text => this.props.onModifyName(text)}
                mode="outlined"
                theme={{colors: {primary: '#000000'}}}
              />
              <CpfCnpjInput
                style={styles.input}
                value={this.props.cpfcnpj}
                onChangeText={(formattedText, cleanText) => {
                  this.props.onModifyCpfCnpj(formattedText);
                }}
              />
              <PhoneInput
                style={styles.input}
                value={this.props.phone}
                onChangeText={(formattedText, cleanText) => {
                  this.props.onModifyPhone(formattedText);
                }}
              />
              <CepInput
                style={styles.input}
                value={this.props.cep}
                onChangeText={(formattedText, cleanText) => {
                  this.props.onModifyCep(formattedText);
                }}
                onCompleteCep={cep => this.handleCompleteCep(cep)}
              />
              <TextInput
                label="Endereço"
                style={styles.input}
                value={address.logradouro}
                onChangeText={text => this.props.onModifyAddress(text)}
                mode="outlined"
                theme={{colors: {primary: '#000000'}}}
              />
              <TextInput
                label="Número"
                style={styles.input}
                value={this.props.number}
                onChangeText={text => this.props.onModifyNumber(text)}
                mode="outlined"
                keyboardType="numeric"
                theme={{colors: {primary: '#000000'}}}
              />
              <TextInput
                label="Complemento (opcional)"
                style={styles.input}
                value={this.props.complement}
                onChangeText={text => this.props.onModifyComplement(text)}
                mode="outlined"
                theme={{colors: {primary: '#000000'}}}
              />
              <TextInput
                label="Bairro"
                style={styles.input}
                value={address.neighborhood}
                onChangeText={text => this.props.onModifyNeighborhood(text)}
                mode="outlined"
                theme={{colors: {primary: '#000000'}}}
              />
              <TextInput
                label="Cidade"
                style={styles.input}
                value={address.city}
                onChangeText={text => this.props.onModifyCity(text)}
                mode="outlined"
                theme={{colors: {primary: '#000000'}}}
              />
              <TextInput
                label="Estado"
                style={styles.input}
                value={address.state}
                onChangeText={text => this.props.onModifyState(text)}
                mode="outlined"
                theme={{colors: {primary: '#000000'}}}
              />
              {this.renderBtnRegister()}
            </View>
          </ScrollView>

          {/* Menu personalizado para seleção de imagem */}
          <Portal>
            <Modal
              visible={imageMenuVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={this.closeImageMenu}
              onDismiss={this.closeImageMenu}>
              <TouchableOpacity
                style={imageMenuStyles.modalOverlay}
                activeOpacity={1}
                onPress={this.closeImageMenu}>
                <Surface style={imageMenuStyles.menuContainer}>
                  <TouchableOpacity
                    style={imageMenuStyles.menuItem}
                    onPress={this.handleCamera}>
                    <IconButton
                      icon="camera"
                      size={30}
                      iconColor={colors.SECONDARY}
                    />
                    <Text style={imageMenuStyles.menuText}>Câmera</Text>
                  </TouchableOpacity>

                  <Divider style={imageMenuStyles.divider} />

                  <TouchableOpacity
                    style={imageMenuStyles.menuItem}
                    onPress={this.handleGallery}>
                    <IconButton
                      icon="image"
                      size={30}
                      iconColor={colors.SECONDARY}
                    />
                    <Text style={imageMenuStyles.menuText}>Galeria</Text>
                  </TouchableOpacity>

                  <Divider style={imageMenuStyles.divider} />

                  <TouchableOpacity
                    style={imageMenuStyles.menuItem}
                    onPress={this.closeImageMenu}>
                    <IconButton icon="close" size={30} iconColor="#FF3B30" />
                    <Text
                      style={[imageMenuStyles.menuText, {color: '#FF3B30'}]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </Surface>
              </TouchableOpacity>
            </Modal>
          </Portal>

          <Toast />
          {loading && <LoadingOverlay message="Buscando endereço..." />}
        </View>
      </PaperProvider>
    );
  }
}

// Estilos para o menu de seleção de imagem
const imageMenuStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: '80%',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});

const mapDispatchToProps = dispatch => ({
  onSaveProfileUser: user => dispatch(saveProfileUser(user)),
  onReadDataUser: () => dispatch(readDataUser()),
  onFetchAddressByCep: cep => dispatch(fetchAddressByCep(cep)),
  onModifyAddress: logradouro => dispatch(modifyAddress(logradouro)),
  onModifyNeighborhood: neighborhood =>
    dispatch(modifyNeighborhood(neighborhood)),
  onModifyCity: city => dispatch(modifyCity(city)),
  onModifyState: state => dispatch(modifyState(state)),
  onModifyName: name => dispatch(modifyName(name)),
  onModifyCpfCnpj: cpfcnpj => dispatch(modifyCpfCnpj(cpfcnpj)),
  onModifyPhone: phone => dispatch(modifyPhone(phone)),
  onModifyCep: cep => dispatch(modifyCep(cep)),
  onModifyNumber: number => dispatch(modifyNumber(number)),
  onModifyComplement: complement => dispatch(modifyComplement(complement)),
  onModifyPhoto: (fileImgPath, fileImgType) =>
    dispatch(modifyPhoto(fileImgPath, fileImgType)),
});

const mapStateToProps = state => ({
  registrationInProgress: state.userReducer.registrationInProgress,
  name: state.userReducer.name,
  email: state.userReducer.email,
  password: state.userReducer.password,
  cpfcnpj: state.userReducer.cpfcnpj,
  phone: state.userReducer.phone,
  cep: state.userReducer.cep,
  address: state.userReducer.address,
  complement: state.userReducer.complement,
  number: state.userReducer.number,
  error: state.userReducer.error,
  loading: state.userReducer.loading,
  saveProfileInProgress: state.userReducer.saveProfileInProgress,
  photoModify: state.userReducer.photoModify,
  fileImgPath: state.userReducer.fileImgPath,
  fileImgType: state.userReducer.fileImgType,
  profileImage: state.userReducer.profileImage,
});

export default connect(mapStateToProps, mapDispatchToProps)(FormProfile);
