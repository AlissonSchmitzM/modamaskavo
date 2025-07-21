import React, {Component} from 'react';
import {
  View,
  ScrollView,
  Text,
  Modal,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Appearance,
} from 'react-native';
import {
  TextInput,
  Button,
  ActivityIndicator,
  Avatar,
  IconButton,
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
} from '../../../common';
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
  modifyUf,
  deleteAccount,
  signOut,
} from '../../../../store/actions/userActions';
import toastr, {ERROR, toastConfig} from '../../../../services/toastr';
import Toast from 'react-native-toast-message';
import {colors} from '../../../../styles/Styles';
import styles from './Styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {getAuth} from '@react-native-firebase/auth';
import {SafeAreaView} from 'react-native-safe-area-context';
import imageMenuStyles from './ImageMenuStyles';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {DeleteAccountModal} from './DeleteAccountModal';
import store from '../../../../services/AsyncStorage';
import NavigatorService from '../../../../services/NavigatorService';
import b64 from 'base-64';
import {get, ref, getDatabase} from '@react-native-firebase/database';

class FormProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      menuVisible: false,
      imageMenuVisible: false,
      imageLoading: true,
      deleteAccountModalVisible: false,
      processingDeleteAccount: false,
      saveProfile: null,
    };

    this.btnRegisterRef = React.createRef();
    this.nameRef = React.createRef();
    this.cpfcnpjRef = React.createRef();
    this.celularRef = React.createRef();
    this.cepRef = React.createRef();
    this.enderecoRef = React.createRef();
    this.numeroRef = React.createRef();
    this.complementoRef = React.createRef();
    this.bairroRef = React.createRef();
    this.cidadeRef = React.createRef();
    this.ufRef = React.createRef();
  }

  componentDidMount() {
    if (this.state.processingDeleteAccount === false) {
      this.props.onReadDataUser();
    }
    this.checkUserLogin();
  }

  isGoogleUser = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    return currentUser.providerData.some(
      provider => provider.providerId === 'google.com',
    );
  };

  async checkUserLogin() {
    const emailUserLogged = await store.get('emailUserLogged');
    if (emailUserLogged) {
      const emailB64 = b64.encode(emailUserLogged);

      try {
        // Usando a API modular do Firebase
        const snapshot = await get(
          ref(getDatabase(), `/users/${emailB64}/saveProfile`),
        );

        const saveProfile = snapshot.val();

        this.setState({saveProfile});
      } catch (error) {
        toastr.showToast(`Erro ao buscar perfil: ${error}`, ERROR);
        this.setState({saveProfile: null});
      }
    }
  }

  handleCompleteCep = cep => {
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
    if (Platform.OS === 'android') {
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

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else if (Platform.OS === 'ios') {
      try {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        return result === RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }

    return true; // Para outras plataformas (web, etc.)
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
      return (
        <ActivityIndicator
          size="large"
          color={colors.PRIMARY}
          style={{marginBottom: 10}}
        />
      );
    }
    return (
      <Button
        ref={this.btnRegisterRef}
        mode="contained"
        style={styles.button}
        textColor="#FFF"
        icon="content-save"
        onPress={this.handleSubmit}>
        Salvar
      </Button>
    );
  }

  renderBtnDeleteAccount() {
    if (this.props.deleteAccountInProgress) {
      return (
        <ActivityIndicator
          size="large"
          color="#D32F2F"
          style={{marginBottom: 10}}
        />
      );
    }
    return (
      <Button
        mode="contained"
        style={[styles.button, {backgroundColor: '#D32F2F'}]}
        textColor="#FFF"
        icon="delete"
        onPress={() => this.setState({deleteAccountModalVisible: true})}>
        Excluir conta
      </Button>
    );
  }

  getTextModalDeleteAccount = async () => {
    const deleteAccount = await store.get('deleteAccount');
    if (deleteAccount === true) {
      return 'Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.';
    } else {
      return 'Tem certeza que deseja excluir sua conta? É necessário fazer login novamente antes de excluir totalmente sua conta.';
    }
  };

  getTextButtonDeleteAccount = async () => {
    const deleteAccount = await store.get('deleteAccount');
    if (deleteAccount === true) {
      return 'Excluir conta';
    } else {
      return 'Sair';
    }
  };
  validateFields() {
    if (!this.props.name) {
      toastr.showToast('Nome é obrigatório!', ERROR);
      return false;
    } else if (
      !this.props.cpfcnpj ||
      (this.props.cpfcnpj.length !== 14 && this.props.cpfcnpj.length !== 18)
    ) {
      toastr.showToast('CPF/CNPJ inválido!', ERROR);
      return false;
    } else if (!this.props.phone || this.props.phone.length < 15) {
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
    } else if (!this.props.address.uf) {
      toastr.showToast('UF inválido!', ERROR);
      return false;
    }

    return true;
  }

  handleSubmit = () => {
    if (this.validateFields()) {
      this.props.onSaveProfileUser(this.props);
    }
  };

  handleDeleteAccount = async () => {
    const deleteAccount = await store.get('deleteAccount');

    if (deleteAccount === true) {
      this.setState({processingDeleteAccount: true});
      new Promise(resolve => setTimeout(resolve, 3000));
      this.props.onDeleteAccount();
      this.setState({deleteAccountModalVisible: false});
      toastr.showToast('Conta excluída com sucesso!', SUCCESS);
      store.delete('deleteAccount');
    } else {
      this.setState({deleteAccountModalVisible: false});
      NavigatorService.navigate('FormLogin');
    }
  };

  render() {
    const {address, loading} = this.props;
    const {imageMenuVisible} = this.state;

    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: '#FFFFFF'}}
        edges={['bottom', 'left', 'right']}>
        <PaperProvider>
          <KeyboardAwareScrollView
            style={{flex: 1}}
            extraScrollHeight={100}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={{flex: 1}}>
              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets={true}
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                  <View style={styles.containerAvatar}>
                    <View
                      style={{
                        borderColor: '#7E7D7DFF',
                        borderRadius: 50,
                        borderWidth: 1,
                      }}>
                      {this.props.fileImgPath ? (
                        <ShimmerPlaceholder
                          LinearGradient={LinearGradient}
                          visible={!this.state.imageLoading}
                          height={100}
                          width={100}
                          style={{
                            borderRadius: 50,
                          }}>
                          <Avatar.Image
                            size={100}
                            source={{uri: this.props.fileImgPath}}
                            onLoadStart={() =>
                              this.setState({imageLoading: true})
                            }
                            onLoadEnd={() =>
                              this.setState({imageLoading: false})
                            }
                          />
                        </ShimmerPlaceholder>
                      ) : (
                        <Avatar.Text
                          color="#FFF"
                          backgroundColor={colors.SECONDARY}
                          size={100}
                          label={this.props.name.charAt(0)}
                        />
                      )}
                    </View>
                    <View
                      style={[
                        styles.containerAvatarIcon,
                        this.isGoogleUser() ? {display: 'none'} : null,
                      ]}>
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
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: colors.PRIMARY,
                        marginVertical: 10,
                      }}>
                      {this.props.email}
                    </Text>
                  </View>
                  <TextInput
                    autoFocus
                    label="Nome"
                    style={styles.input}
                    value={this.props.name}
                    textColor="#000"
                    returnKeyType="next"
                    onSubmitEditing={() => this.cpfcnpjRef.current?.focus()}
                    onChangeText={text => this.props.onModifyName(text)}
                    mode="outlined"
                    theme={{
                      colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                    }}
                  />
                  <CpfCnpjInput
                    ref={this.cpfcnpjRef}
                    returnKeyType="next"
                    onSubmitEditing={() => this.celularRef.current?.focus()}
                    style={styles.input}
                    value={this.props.cpfcnpj}
                    onChangeText={(formattedText, cleanText) => {
                      this.props.onModifyCpfCnpj(formattedText);
                    }}
                  />
                  <PhoneInput
                    ref={this.celularRef}
                    returnKeyType="next"
                    onSubmitEditing={() => this.cepRef.current?.focus()}
                    style={styles.input}
                    value={this.props.phone}
                    onChangeText={(formattedText, cleanText) => {
                      this.props.onModifyPhone(formattedText);
                    }}
                  />
                  <CepInput
                    ref={this.cepRef}
                    returnKeyType="go"
                    style={styles.input}
                    value={this.props.cep}
                    onChangeText={(formattedText, cleanText) => {
                      this.props.onModifyCep(formattedText);
                    }}
                    onCompleteCep={cep => this.handleCompleteCep(cep)}
                  />
                  <TextInput
                    ref={this.enderecoRef}
                    returnKeyType="next"
                    onSubmitEditing={() => this.numeroRef.current?.focus()}
                    label="Endereço"
                    style={styles.input}
                    value={address.logradouro}
                    textColor="#000"
                    onChangeText={text => this.props.onModifyAddress(text)}
                    mode="outlined"
                    theme={{
                      colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                    }}
                  />
                  <TextInput
                    ref={this.numeroRef}
                    returnKeyType="next"
                    onSubmitEditing={() => this.complementoRef.current?.focus()}
                    label="Número"
                    style={styles.input}
                    value={this.props.number}
                    textColor="#000"
                    onChangeText={text => this.props.onModifyNumber(text)}
                    mode="outlined"
                    keyboardType="numeric"
                    theme={{
                      colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                    }}
                  />
                  <TextInput
                    ref={this.complementoRef}
                    returnKeyType="next"
                    onSubmitEditing={() => this.bairroRef.current?.focus()}
                    label="Complemento (opcional)"
                    style={styles.input}
                    value={this.props.complement}
                    textColor="#000"
                    onChangeText={text => this.props.onModifyComplement(text)}
                    mode="outlined"
                    theme={{
                      colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                    }}
                  />
                  <TextInput
                    ref={this.bairroRef}
                    returnKeyType="next"
                    onSubmitEditing={() => this.cidadeRef.current?.focus()}
                    label="Bairro"
                    style={styles.input}
                    value={address.neighborhood}
                    textColor="#000"
                    onChangeText={text => this.props.onModifyNeighborhood(text)}
                    mode="outlined"
                    theme={{
                      colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                    }}
                  />
                  <TextInput
                    editable={false}
                    ref={this.cidadeRef}
                    returnKeyType="next"
                    onSubmitEditing={() => this.ufRef.current?.focus()}
                    label="Cidade"
                    style={[styles.input, {backgroundColor: '#ECECECFF'}]}
                    value={address.city}
                    textColor="#000"
                    onChangeText={text => this.props.onModifyCity(text)}
                    mode="outlined"
                    theme={{
                      colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                    }}
                  />
                  <TextInput
                    editable={false}
                    ref={this.ufRef}
                    returnKeyType="go"
                    onSubmitEditing={this.handleSubmit}
                    label="UF"
                    style={[styles.input, {backgroundColor: '#ECECECFF'}]}
                    value={address.uf}
                    textColor="#000"
                    onChangeText={text => this.props.onModifyUf(text)}
                    mode="outlined"
                    theme={{
                      colors: {primary: '#000000', onSurfaceVariant: '#999999'},
                    }}
                  />
                  {this.renderBtnRegister()}
                  {this.renderBtnDeleteAccount()}
                  <Button
                    mode="contained"
                    style={[
                      styles.button,
                      {
                        backgroundColor: '#FFF',
                        borderWidth: 1,
                        borderColor: '#AAA',
                        display: this.state.saveProfile ? 'none' : 'flex',
                      },
                    ]}
                    textColor="#000"
                    icon="logout"
                    onPress={() => this.props.onSignOut()}>
                    Sair
                  </Button>
                </View>
              </ScrollView>

              <DeleteAccountModal
                visible={this.state.deleteAccountModalVisible}
                onClose={() =>
                  this.setState({deleteAccountModalVisible: false})
                }
                onConfirm={this.handleDeleteAccount}
                textModal={this.getTextModalDeleteAccount()}
                textButtonDelete={this.getTextButtonDeleteAccount()}>
                Excluir Conta
              </DeleteAccountModal>

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
                        <IconButton
                          icon="close"
                          size={30}
                          iconColor="#FF3B30"
                        />
                        <Text
                          style={[
                            imageMenuStyles.menuText,
                            {color: '#FF3B30'},
                          ]}>
                          Cancelar
                        </Text>
                      </TouchableOpacity>
                    </Surface>
                  </TouchableOpacity>
                </Modal>
              </Portal>
              {loading && <LoadingOverlay message="Buscando endereço..." />}
            </View>
          </KeyboardAwareScrollView>
          <Toast config={toastConfig} />
        </PaperProvider>
      </SafeAreaView>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onSaveProfileUser: user => dispatch(saveProfileUser(user)),
  onReadDataUser: () => dispatch(readDataUser()),
  onFetchAddressByCep: cep => dispatch(fetchAddressByCep(cep)),
  onModifyAddress: logradouro => dispatch(modifyAddress(logradouro)),
  onModifyNeighborhood: neighborhood =>
    dispatch(modifyNeighborhood(neighborhood)),
  onModifyCity: city => dispatch(modifyCity(city)),
  onModifyUf: uf => dispatch(modifyUf(uf)),
  onModifyName: name => dispatch(modifyName(name)),
  onModifyCpfCnpj: cpfcnpj => dispatch(modifyCpfCnpj(cpfcnpj)),
  onModifyPhone: phone => dispatch(modifyPhone(phone)),
  onModifyCep: cep => dispatch(modifyCep(cep)),
  onModifyNumber: number => dispatch(modifyNumber(number)),
  onModifyComplement: complement => dispatch(modifyComplement(complement)),
  onModifyPhoto: (fileImgPath, fileImgType) =>
    dispatch(modifyPhoto(fileImgPath, fileImgType)),
  onDeleteAccount: () => dispatch(deleteAccount()),
  onSignOut: () => dispatch(signOut()),
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
  deleteAccountInProgress: state.userReducer.deleteAccountInProgress,
});

export default connect(mapStateToProps, mapDispatchToProps)(FormProfile);
