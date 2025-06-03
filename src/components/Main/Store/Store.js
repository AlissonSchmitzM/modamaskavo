import React, {useEffect, useRef, useState} from 'react';
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
import {toastConfig} from '../../../services/toastr';
import styles from './Styles';

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

const Store = ({
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
  selectVariation,
  setActiveImageIndex,
  toggleDropdown,
  setDropdownLayout,
  readDataConfig,
}) => {
  const carouselRefs = useRef({});
  const dropdownRefs = useRef({});
  const [imageLoading, setImageLoading] = useState({});

  const handlePayment = product => {
    const descricao = product.variation
      ? product.name + ' ' + product.variation.name
      : product.name;

    NavigatorService.navigate('PaymentScreen', {
      valor: parseFloat(product.price).toFixed(2).replace('.', ','),
      descricao: descricao,
      product: product,
    });
  };

  const measureDropdown = productId => {
    if (dropdownRefs.current[productId]) {
      dropdownRefs.current[productId].measureInWindow((x, y, width, height) => {
        setDropdownLayout(productId, {x, y, width, height});
      });
    }
  };

  const goToNextSlide = productId => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.images || product.images.length <= 1) return;

    const currentIndex = activeImageIndexes[productId] || 0;
    const nextIndex = (currentIndex + 1) % product.images.length;

    if (carouselRefs.current[productId]) {
      carouselRefs.current[productId].scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }
    setActiveImageIndex(productId, nextIndex);
  };

  const goToPrevSlide = productId => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.images || product.images.length <= 1) return;

    const currentIndex = activeImageIndexes[productId] || 0;
    const prevIndex =
      currentIndex === 0 ? product.images.length - 1 : currentIndex - 1;

    if (carouselRefs.current[productId]) {
      carouselRefs.current[productId].scrollToIndex({
        index: prevIndex,
        animated: true,
      });
    }
    setActiveImageIndex(productId, prevIndex);
  };

  const handleScroll = (event, productId) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    setActiveImageIndex(productId, index);
  };

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

  const formatarAtributos = variation => {
    if (!variation.attributes || variation.attributes.length === 0) {
      return 'Padrão';
    }

    return variation.attributes
      .map(attr => `${attr.name}: ${attr.option}`)
      .join(' / ');
  };

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
                      onPress={() => goToPrevSlide(item.id)}
                      activeOpacity={0.7}>
                      <Icon name="chevron-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
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
            {item.images && item.images.length > 1 ? (
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
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>Tamanho</Text>
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

      <Toast config={toastConfig} />
    </View>
  );
};

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
  selectVariation,
  setActiveImageIndex,
  toggleDropdown,
  setDropdownLayout,
  readDataConfig,
};

export default connect(mapStateToProps, mapDispatchToProps)(Store);
