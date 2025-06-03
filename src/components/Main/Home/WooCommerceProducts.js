import React, {useEffect, useRef, useState} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  InteractionManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import NavigatorService from '../../../services/NavigatorService';
import LinearGradient from 'react-native-linear-gradient';
import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
import {
  fetchProducts,
  loadMoreProducts,
  diminuirEstoqueProdutoSimples,
  diminuirEstoqueVariacao,
  selectVariation,
  setActiveImageIndex,
  toggleDropdown,
  setDropdownLayout,
} from '../../../store/actions/productActions';
import {readDataConfig} from '../../../store/actions/configActions';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const {width, height} = Dimensions.get('window');
const CARD_WIDTH = width - 20; // Um pouco menor que a largura da tela para margens

// Componente de Shimmer para produtos em carregamento
const ProdutoShimmer = () => {
  return (
    <View style={styles.product}>
      {/* Shimmer para imagem */}
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

      {/* Shimmer para paginação */}
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
        {/* Shimmer para título */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{width: '80%', height: 22, marginBottom: 6}}
          shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
        />

        {/* Shimmer para descrição */}
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

        {/* Shimmer para preço */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{width: '40%', height: 16, marginBottom: 4}}
          shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
        />

        {/* Shimmer para estoque */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{width: '60%', height: 14, marginBottom: 12}}
          shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
        />

        {/* Shimmer para botão */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{width: '100%', height: 40, borderRadius: 5, marginTop: 8}}
          shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
        />
      </View>
    </View>
  );
};

const WooCommerceProducts = ({
  products,
  loading,
  page,
  hasMoreProducts,
  updatingProductId,
  productVariations,
  loadingVariations,
  selectedVariations,
  openDropdowns,
  activeImageIndexes,
  dropdownLayout,
  fetchProducts,
  loadMoreProducts,
  diminuirEstoqueProdutoSimples,
  diminuirEstoqueVariacao,
  selectVariation,
  setActiveImageIndex,
  toggleDropdown,
  setDropdownLayout,
  readDataConfig,
}) => {
  const carouselRefs = useRef({});
  const dropdownRefs = useRef({});
  const [imageLoading, setImageLoading] = useState({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Usar InteractionManager para garantir que as operações pesadas ocorram após a renderização inicial
    const fetchInitialData = async () => {
      await fetchProducts();
      await readDataConfig();
      setIsReady(true);
    };

    InteractionManager.runAfterInteractions(() => {
      fetchInitialData();
    });
  }, []);

  const handleProdutoClick = product => {
    if (product.type === 'simple') {
      diminuirEstoqueProdutoSimples(product);
    }
  };

  const handlePayment = product => {
    const descricao = product.variation
      ? product.name + ' ' + product.variation.name
      : product.name;

    NavigatorService.navigate('PaymentScreen', {
      valor: parseFloat(product.price.replace(',', '.')),
      descricao: descricao,
      product: product,
    });
  };

  // Medir a posição e tamanho do dropdown
  const measureDropdown = productId => {
    if (dropdownRefs.current[productId]) {
      InteractionManager.runAfterInteractions(() => {
        dropdownRefs.current[productId].measureInWindow(
          (x, y, width, height) => {
            setDropdownLayout(productId, {x, y, width, height});
          },
        );
      });
    }
  };

  // Funções para o carrossel de imagens
  const goToNextSlide = productId => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.images || product.images.length <= 1) return;

    const currentIndex = activeImageIndexes[productId] || 0;
    const nextIndex = (currentIndex + 1) % product.images.length;

    InteractionManager.runAfterInteractions(() => {
      if (carouselRefs.current[productId]) {
        carouselRefs.current[productId].scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }
      setActiveImageIndex(productId, nextIndex);
    });
  };

  const goToPrevSlide = productId => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.images || product.images.length <= 1) return;

    const currentIndex = activeImageIndexes[productId] || 0;
    const prevIndex =
      currentIndex === 0 ? product.images.length - 1 : currentIndex - 1;

    InteractionManager.runAfterInteractions(() => {
      if (carouselRefs.current[productId]) {
        carouselRefs.current[productId].scrollToIndex({
          index: prevIndex,
          animated: true,
        });
      }
      setActiveImageIndex(productId, prevIndex);
    });
  };

  const handleScroll = (event, productId) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    setActiveImageIndex(productId, index);
  };

  // Lidar com erros de scrollToIndex
  const onScrollToIndexFailed = (info, productId) => {
    setTimeout(() => {
      if (carouselRefs.current[productId]) {
        carouselRefs.current[productId].scrollToIndex({
          index: info.index,
          animated: false,
        });
      }
    }, 500);
  };

  const loadMoreProductsHandler = () => {
    if (!loading && hasMoreProducts) {
      loadMoreProducts(page);
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return <ProdutoShimmer />;
  };

  // Formatar os atributos da variação para exibição
  const formatarAtributos = variation => {
    if (!variation.attributes || variation.attributes.length === 0) {
      return 'Padrão';
    }

    return variation.attributes
      .map(attr => `${attr.name}: ${attr.option}`)
      .join(' / ');
  };

  // Renderizar um item do carrossel de imagens
  const renderImageItem = ({item}, productId) => (
    <View style={styles.imageContainer}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        visible={!imageLoading[`${productId}-${item.id}`]}
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
            setImageLoading(prev => ({
              ...prev,
              [`${productId}-${item.id}`]: true,
            }));
          }}
          onLoadEnd={() => {
            setImageLoading(prev => ({
              ...prev,
              [`${productId}-${item.id}`]: false,
            }));
          }}
        />
      </ShimmerPlaceholder>
    </View>
  );

  // Mostrar shimmer quando estiver carregando inicialmente
  if (loading && products.length === 0) {
    return (
      <View style={styles.container}>
        <FlatList
          data={[1, 2, 3]} // Mostrar 3 itens de shimmer
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
        removeClippedSubviews={true}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
        renderItem={({item}) => (
          <View style={styles.product}>
            {/* Carrossel de imagens */}
            <View style={styles.carouselContainer}>
              {item.images && item.images.length > 0 && (
                <>
                  {/* Botão de navegação anterior */}
                  {item.images.length > 1 && (
                    <TouchableOpacity
                      style={[styles.navButton, styles.leftButton]}
                      onPress={() => goToPrevSlide(item.id)}
                      activeOpacity={0.7}>
                      <Icon name="chevron-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}

                  {/* Carrossel */}
                  <FlatList
                    ref={ref => {
                      carouselRefs.current[item.id] = ref;
                    }}
                    data={item.images}
                    renderItem={data => renderImageItem(data, item.id)}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={event => handleScroll(event, item.id)}
                    keyExtractor={(img, index) => `${item.id}-img-${index}`}
                    onScrollToIndexFailed={info =>
                      onScrollToIndexFailed(info, item.id)
                    }
                    snapToInterval={CARD_WIDTH}
                    decelerationRate="fast"
                    snapToAlignment="center"
                    initialNumToRender={1}
                    maxToRenderPerBatch={2}
                    removeClippedSubviews={true}
                  />

                  {/* Botão de navegação próximo */}
                  {item.images.length > 1 && (
                    <TouchableOpacity
                      style={[styles.navButton, styles.rightButton]}
                      onPress={() => goToNextSlide(item.id)}
                      activeOpacity={0.7}>
                      <Icon name="chevron-right" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            {/* Indicadores de paginação */}
            {item.images && item.images.length > 1 && (
              <View style={styles.pagination}>
                {item.images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      InteractionManager.runAfterInteractions(() => {
                        if (carouselRefs.current[item.id]) {
                          carouselRefs.current[item.id].scrollToIndex({
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
                // Botão para produtos simples
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePayment(item)}
                  disabled={updatingProductId === item.id}>
                  {updatingProductId === item.id ? (
                    <ShimmerPlaceholder
                      LinearGradient={LinearGradient}
                      style={{width: '100%', height: 20, borderRadius: 5}}
                      shimmerColors={['#808080', '#606060', '#808080']}
                    />
                  ) : (
                    <Text style={styles.buttonText}>Comprar</Text>
                  )}
                </TouchableOpacity>
              ) : (
                // Dropdown e botão para produtos variáveis
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>Tamanho</Text>

                  {/* Campo de dropdown */}
                  <TouchableOpacity
                    ref={ref => {
                      dropdownRefs.current[item.id] = ref;
                    }}
                    activeOpacity={0.7}
                    onPress={() => {
                      toggleDropdown(item.id);
                      measureDropdown(item.id);
                    }}
                    style={styles.dropdownField}
                    onLayout={() => measureDropdown(item.id)}>
                    <Text style={styles.dropdownText}>
                      {selectedVariations[item.id]
                        ? formatarAtributos(selectedVariations[item.id])
                        : 'Selecione uma opção'}
                    </Text>
                    <Icon name="chevron-down" size={20} color="#000000" />
                  </TouchableOpacity>

                  {/* Botão Comprar para variações */}
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
                        handlePayment(productWithVariation);
                      }
                    }}
                    disabled={
                      updatingProductId === item.id ||
                      !selectedVariations[item.id]
                    }>
                    {updatingProductId === item.id ? (
                      <ShimmerPlaceholder
                        LinearGradient={LinearGradient}
                        style={{width: '100%', height: 20, borderRadius: 5}}
                        shimmerColors={['#808080', '#606060', '#808080']}
                      />
                    ) : (
                      <Text style={styles.buttonText}>Comprar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
        onEndReached={loadMoreProductsHandler}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
      />

      {/* Modal para exibir as opções do dropdown */}
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
              toggleDropdown(productId);
            }}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => {
                toggleDropdown(productId);
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
                        onPress={() => selectVariation(productId, item)}>
                        <Text style={styles.dropdownItemText}>
                          {formatarAtributos(item)}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  product: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  // Estilos para o carrossel
  carouselContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  leftButton: {
    left: 10,
  },
  rightButton: {
    right: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  productInfo: {
    padding: 12,
  },
  name: {
    fontSize: 22,
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    color: '#000000FF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stock: {
    fontSize: 14,
    color: '#006B92FF',
    marginBottom: 12,
  },
  variableProduct: {
    fontSize: 14,
    color: '#00AEEF',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#000000FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  regularPrice: {
    textDecorationLine: 'line-through',
    color: '#888',
    fontSize: 14,
  },
  // Estilos para o dropdown
  dropdownContainer: {
    marginTop: 8,
    width: '100%',
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dropdownField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  // Modal dropdown
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalDropdownContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    maxHeight: 200,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 16,
    flex: 2,
  },
  dropdownItemStock: {
    fontSize: 14,
    color: '#006B92FF',
    flex: 1,
    textAlign: 'right',
  },
  loadingVariations: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  noVariations: {
    textAlign: 'center',
    padding: 10,
    fontStyle: 'italic',
    color: '#6c757d',
  },
  descriptionContainer: {
    marginBottom: 8,
  },
  shortDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

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
});

const mapDispatchToProps = {
  fetchProducts,
  loadMoreProducts,
  diminuirEstoqueProdutoSimples,
  diminuirEstoqueVariacao,
  selectVariation,
  setActiveImageIndex,
  toggleDropdown,
  setDropdownLayout,
  readDataConfig,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WooCommerceProducts);
