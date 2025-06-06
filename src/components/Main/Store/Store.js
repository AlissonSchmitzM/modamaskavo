import React, {Component, createRef} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  InteractionManager,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import NavigatorService from '../../../services/NavigatorService';
import LinearGradient from 'react-native-linear-gradient';
import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
import {
  fetchProducts,
  loadMoreProducts,
  selectVariation,
  setActiveImageIndex,
  toggleDropdown,
  setDropdownLayout,
} from '../../../store/actions/productActions';
import {readDataConfig} from '../../../store/actions/configActions';
import Toast from 'react-native-toast-message';
import toastr, {ERROR, toastConfig} from '../../../services/toastr';
import styles from './Styles';
import modalStyles from './ModalStyles';
import {Button, Surface} from 'react-native-paper';
import {SuperFreteService} from '../../../services/SuperFreteService';
import {colors} from '../../../styles/Styles';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const {width} = Dimensions.get('window');
const CARD_WIDTH = width - 20;

const ProdutoShimmer = () => (
  <View style={styles.product}>
    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      style={{
        width: '100%',
        height: 300,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
      shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
    />
    <View style={styles.pagination}>
      {[1, 2, 3].map((_, index) => (
        <ShimmerPlaceholder
          key={index}
          LinearGradient={LinearGradient}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            marginHorizontal: 4,
          }}
          shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
        />
      ))}
    </View>
    <View style={styles.productInfo}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{width: '80%', height: 22, marginBottom: 6}}
        shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
      />
      <View style={styles.descriptionContainer}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{width: '100%', height: 14, marginBottom: 4}}
          shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
        />
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{width: '90%', height: 14, marginBottom: 4}}
          shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
        />
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{width: '60%', height: 14, marginBottom: 4}}
          shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
        />
      </View>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{width: '40%', height: 16, marginBottom: 4}}
        shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
      />
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{width: '60%', height: 14, marginBottom: 12}}
        shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
      />
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{width: '100%', height: 40, borderRadius: 5, marginTop: 8}}
        shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
      />
    </View>
  </View>
);

class Store extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageLoading: {},
      showShippingModal: false,
      shippingLoading: false,
      shippingError: null,
      shippingOptions: [],
      productSelected: null,
    };

    this.carouselRefs = {};
    this.dropdownRefs = {};
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.showShippingModal && !prevState.showShippingModal) {
      this.handleCalculateShipping();
    }
  }

  handleOpenShippingModal = product => {
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
      shippingError: null,
      shippingLoading: false,
      productSelected: product,
    });
  };

  handleCloseShippingModal = () => {
    this.setState({
      showShippingModal: false,
    });
  };

  handleCalculateShipping = async () => {
    this.setState({
      shippingLoading: true,
    });

    try {
      const options = await SuperFreteService.calculateShipping(
        this.props.userCep,
      );
      if (Array.isArray(options) && options.length > 0) {
        this.setState({
          shippingOptions: options,
          shippingLoading: false,
        });
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
    this.handleCloseShippingModal();
    this.handlePayment(option);
  };

  handlePayment = option => {
    const product = this.state.productSelected;
    const descricao = product.variation
      ? product.name + ' ' + product.variation.name
      : product.name;

    const orderData = {
      type: 'store',
      product: product,
      selectedShipping: {
        id: option.id,
        name: option.name,
        price: option.price.toFixed(2).replace('.', ','),
        delivery_time: option.delivery_time,
        company: option.company?.name,
      },
    };

    const valor = (
      parseFloat(product.price.replace(',', '.')) + parseFloat(option.price)
    )
      .toFixed(2)
      .replace('.', ',');

    NavigatorService.navigate('PaymentScreen', {
      valor: valor,
      descricao: descricao,
      product: product,
      orderData: orderData,
    });
  };

  proceedWithOrderCreation = () => {
    const {selectedShippingOption, selectedLogos} = this.state;
    /*
 type: state.orderReducer.type,
  segment: state.orderReducer.segment,
  tam: state.orderReducer.tam,
  amountPieces: state.orderReducer.amountPieces,
  description: state.orderReducer.description,

*/
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

  measureDropdown = productId => {
    if (this.dropdownRefs[productId]) {
      this.dropdownRefs[productId].measureInWindow((x, y, width, height) => {
        this.props.setDropdownLayout(productId, {x, y, width, height});
      });
    }
  };

  goToNextSlide = productId => {
    const product = this.props.products.find(p => p.id === productId);
    if (!product || !product.images || product.images.length <= 1) return;

    const currentIndex = this.props.activeImageIndexes[productId] || 0;
    const nextIndex = (currentIndex + 1) % product.images.length;

    if (this.carouselRefs[productId]) {
      this.carouselRefs[productId].scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }
    this.props.setActiveImageIndex(productId, nextIndex);
  };

  goToPrevSlide = productId => {
    const product = this.props.products.find(p => p.id === productId);
    if (!product || !product.images || product.images.length <= 1) return;

    const currentIndex = this.props.activeImageIndexes[productId] || 0;
    const prevIndex =
      currentIndex === 0 ? product.images.length - 1 : currentIndex - 1;

    if (this.carouselRefs[productId]) {
      this.carouselRefs[productId].scrollToIndex({
        index: prevIndex,
        animated: true,
      });
    }
    this.props.setActiveImageIndex(productId, prevIndex);
  };

  handleScroll = (event, productId) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    this.props.setActiveImageIndex(productId, index);
  };

  onScrollToIndexFailed = (info, productId) => {
    setTimeout(() => {
      if (this.carouselRefs[productId]) {
        this.carouselRefs[productId].scrollToIndex({
          index: info.index,
          animated: false,
        });
      }
    }, 500);
  };

  loadMoreProductsHandler = () => {
    if (!this.props.loading && this.props.hasMoreProducts) {
      this.props.loadMoreProducts(this.props.page);
    }
  };

  renderFooter = () => {
    if (!this.props.loading) return null;
    return <ProdutoShimmer />;
  };

  formatarAtributos = variation => {
    if (!variation.attributes || variation.attributes.length === 0) {
      return 'Padrão';
    }

    return variation.attributes
      .map(attr => `${attr.name}: ${attr.option}`)
      .join(' / ');
  };

  renderImageItem = ({item}, productId) => (
    <View style={styles.imageContainer}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        visible={!this.state.imageLoading[`${productId}-${item.id}`]}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 0,
        }}
        shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}>
        <Image
          source={{uri: item.src}}
          style={styles.image}
          resizeMode="cover"
          onLoadStart={() => {
            this.setState(prevState => ({
              imageLoading: {
                ...prevState.imageLoading,
                [`${productId}-${item.id}`]: true,
              },
            }));
          }}
          onLoadEnd={() => {
            this.setState(prevState => ({
              imageLoading: {
                ...prevState.imageLoading,
                [`${productId}-${item.id}`]: false,
              },
            }));
          }}
        />
      </ShimmerPlaceholder>
    </View>
  );

  render() {
    const {
      products,
      loading,
      updatingProductId,
      productVariations,
      loadingVariations,
      selectedVariations,
      openDropdowns,
      activeImageIndexes,
      dropdownLayout,
      userCep,
    } = this.props;

    const {showShippingModal, shippingLoading, shippingError, shippingOptions} =
      this.state;

    if (loading && products.length === 0) {
      return (
        <View style={styles.container}>
          <FlatList
            data={[1, 2, 3]}
            keyExtractor={item => `shimmer-${item}`}
            renderItem={() => <ProdutoShimmer />}
          />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          data={products}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{paddingBottom: 100}}
          removeClippedSubviews={true}
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          windowSize={5}
          renderItem={({item}) => (
            <View style={styles.product}>
              <View style={styles.carouselContainer}>
                {item.images && item.images.length > 0 && (
                  <>
                    {item.images.length > 1 && (
                      <TouchableOpacity
                        style={[styles.navButton, styles.leftButton]}
                        onPress={() => this.goToPrevSlide(item.id)}
                        activeOpacity={0.7}>
                        <Icon name="chevron-left" size={24} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                    <FlatList
                      ref={ref => {
                        this.carouselRefs[item.id] = ref;
                      }}
                      data={item.images}
                      renderItem={data => this.renderImageItem(data, item.id)}
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onScroll={event => this.handleScroll(event, item.id)}
                      keyExtractor={(img, index) => `${item.id}-img-${index}`}
                      onScrollToIndexFailed={info =>
                        this.onScrollToIndexFailed(info, item.id)
                      }
                      snapToInterval={CARD_WIDTH}
                      decelerationRate="fast"
                      snapToAlignment="center"
                      initialNumToRender={1}
                      maxToRenderPerBatch={2}
                      removeClippedSubviews={true}
                    />
                    {item.images.length > 1 && (
                      <TouchableOpacity
                        style={[styles.navButton, styles.rightButton]}
                        onPress={() => this.goToNextSlide(item.id)}
                        activeOpacity={0.7}>
                        <Icon name="chevron-right" size={24} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
              {item.images && item.images.length > 1 ? (
                <View style={styles.pagination}>
                  {item.images.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        InteractionManager.runAfterInteractions(() => {
                          if (this.carouselRefs[item.id]) {
                            this.carouselRefs[item.id].scrollToIndex({
                              index,
                              animated: true,
                            });
                          }
                        });
                      }}>
                      <View
                        style={[
                          styles.dot,
                          {
                            backgroundColor:
                              index === (activeImageIndexes[item.id] || 0)
                                ? '#000000'
                                : '#D3D3D3',
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={{marginBottom: 12}} />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.name}>{item.name}</Text>
                {item.short_description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.shortDescription} numberOfLines={3}>
                      {item.short_description.replace(/<\/?[^>]+(>|$)/g, '')}
                    </Text>
                  </View>
                )}
                <Text style={styles.price}>
                  {item.on_sale && item.regular_price !== '' ? (
                    <>
                      <Text style={styles.regularPrice}>
                        R${' '}
                        {parseFloat(item.regular_price)
                          .toFixed(2)
                          .replace('.', ',')}
                      </Text>{' '}
                      <Text>
                        R$ {parseFloat(item.price).toFixed(2).replace('.', ',')}
                      </Text>
                    </>
                  ) : (
                    `R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}`
                  )}
                </Text>

                {item.type === 'simple' ? (
                  <Text style={styles.stock}>
                    Em estoque: {item.stock_quantity || 'Disponível'}
                  </Text>
                ) : (
                  <Text style={styles.variableProduct}>
                    Produto com variações
                  </Text>
                )}

                {item.type === 'simple' ? (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => this.handleOpenShippingModal(item)}
                    disabled={updatingProductId === item.id}>
                    <Text style={styles.buttonText}>Comprar</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.dropdownContainer}>
                    <Text style={styles.dropdownLabel}>Tamanho</Text>
                    <TouchableOpacity
                      ref={ref => {
                        this.dropdownRefs[item.id] = ref;
                      }}
                      activeOpacity={0.7}
                      onPress={() => {
                        this.props.toggleDropdown(item.id);
                        this.measureDropdown(item.id);
                      }}
                      style={styles.dropdownField}
                      onLayout={() => this.measureDropdown(item.id)}>
                      <Text style={styles.dropdownText}>
                        {selectedVariations[item.id]
                          ? this.formatarAtributos(selectedVariations[item.id])
                          : 'Selecione uma opção'}
                      </Text>
                      <Icon name="chevron-down" size={20} color="#000000" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        !selectedVariations[item.id] && styles.buttonDisabled,
                      ]}
                      onPress={() => {
                        if (selectedVariations[item.id]) {
                          const productWithVariation = {
                            ...item,
                            variation: selectedVariations[item.id],
                          };

                          this.handleOpenShippingModal(productWithVariation);
                        }
                      }}
                      disabled={
                        updatingProductId === item.id ||
                        !selectedVariations[item.id]
                      }>
                      <Text style={styles.buttonText}>Comprar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
          onEndReached={this.loadMoreProductsHandler}
          onEndReachedThreshold={0.1}
          ListFooterComponent={this.renderFooter}
        />
        {Object.keys(openDropdowns).map(productId => {
          if (!openDropdowns[productId]) return null;

          const layout = dropdownLayout[productId] || {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
          };

          return (
            <Modal
              key={productId}
              visible={openDropdowns[productId]}
              transparent={true}
              animationType="none"
              onRequestClose={() => {
                this.props.toggleDropdown(productId);
              }}>
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => {
                  this.props.toggleDropdown(productId);
                }}>
                <View
                  style={[
                    styles.modalDropdownContainer,
                    {
                      position: 'absolute',
                      top: layout.y + layout.height,
                      left: layout.x,
                      width: layout.width,
                    },
                  ]}>
                  {loadingVariations[productId] ? (
                    <View style={{padding: 10}}>
                      <ShimmerPlaceholder
                        LinearGradient={LinearGradient}
                        style={{
                          width: '100%',
                          height: 40,
                          borderRadius: 5,
                          marginBottom: 5,
                        }}
                        shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                      />
                      <ShimmerPlaceholder
                        LinearGradient={LinearGradient}
                        style={{
                          width: '100%',
                          height: 40,
                          borderRadius: 5,
                          marginBottom: 5,
                        }}
                        shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                      />
                      <ShimmerPlaceholder
                        LinearGradient={LinearGradient}
                        style={{width: '100%', height: 40, borderRadius: 5}}
                        shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                      />
                    </View>
                  ) : productVariations[productId] &&
                    productVariations[productId].length > 0 ? (
                    <FlatList
                      data={productVariations[productId]}
                      keyExtractor={item => item.id.toString()}
                      renderItem={({item}) => (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() =>
                            this.props.selectVariation(productId, item)
                          }>
                          <Text style={styles.dropdownItemText}>
                            {this.formatarAtributos(item)}
                          </Text>
                          <Text style={styles.dropdownItemStock}>
                            Estoque: {item.stock_quantity}
                          </Text>
                        </TouchableOpacity>
                      )}
                      style={styles.dropdownList}
                      initialNumToRender={5}
                    />
                  ) : (
                    <Text style={styles.noVariations}>
                      Nenhuma variação em estoque
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </Modal>
          );
        })}
        {/* Modal Cálculo de Frete */}
        <Modal
          visible={showShippingModal}
          transparent
          animationType="slide"
          onRequestClose={this.handleCloseShippingModal}>
          <View style={modalStyles.modalContainer}>
            <Surface style={modalStyles.modalContent}>
              <Text style={modalStyles.modalTitle}>Selecionar Frete</Text>
              <Text style={modalStyles.modalCepInfo}>
                Calculando para o CEP: {userCep}
              </Text>
              <Text style={[modalStyles.modalCepInfo, {fontWeight: 'bold'}]}>
                Obs: O prazo é calculado a partir do início da postagem nos
                correios. O código de rastreio será enviado após o envio da
                mercadoria.
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
                    keyExtractor={item => item.id.toString()}
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
                            {item.price?.toFixed(2).replace('.', ',') || 'N/A'}
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
        <Toast config={toastConfig} />
      </View>
    );
  }
}

const mapStateToProps = state => ({
  products: state.productReducer.products,
  loading: state.productReducer.loading,
  page: state.productReducer.page,
  hasMoreProducts: state.productReducer.hasMoreProducts,
  updatingProductId: state.productReducer.updatingProductId,
  productVariations: state.productReducer.productVariations,
  loadingVariations: state.productReducer.loadingVariations,
  selectedVariations: state.productReducer.selectedVariations,
  openDropdowns: state.productReducer.openDropdowns,
  activeImageIndexes: state.productReducer.activeImageIndexes,
  dropdownLayout: state.productReducer.dropdownLayout,
  userCep: state.userReducer.cep,
});

const mapDispatchToProps = {
  fetchProducts,
  loadMoreProducts,
  selectVariation,
  setActiveImageIndex,
  toggleDropdown,
  setDropdownLayout,
  readDataConfig,
};

export default connect(mapStateToProps, mapDispatchToProps)(Store);
