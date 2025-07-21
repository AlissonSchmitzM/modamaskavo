import React, {Component} from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import {
  readDataUser,
  readDataUsersFull,
} from '../../../store/actions/userActions';
import {connect} from 'react-redux';
import {
  readDataOrders,
  readDataOrdersFull,
} from '../../../store/actions/orderActions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {readDataConfig} from '../../../store/actions/configActions';
import {Card, Surface, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import NavigatorService from '../../../services/NavigatorService';
import styles from './Styles';
// Importações para o Shimmer
import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {fetchProducts} from '../../../store/actions/productActions';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const {width} = Dimensions.get('window');
const CARD_WIDTH = width - 32; // Um pouco menor que a largura da tela para margens

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
      imagesLoading: {}, // Objeto para rastrear o carregamento de cada imagem
      imageHeight: 300, // Altura padrão inicial
    };
    this.flatListRef = React.createRef();
    this.intervalId = null;
  }

  componentDidMount() {
    this.props.onReadDataUser();
    this.props.onReadDataUsersFull();
    this.props.onReadDataOrders();
    this.props.onReadDataOrdersFull();
    this.props.onReadDataConfig();
    this.props.onReadDataProducts();

    // Inicializar o estado de carregamento para todas as imagens
    const imagesLoading = {};
    this.images.forEach(img => {
      imagesLoading[img.id] = true;
    });
    this.setState({imagesLoading});

    // Calcular a altura proporcional para a primeira imagem
    if (this.images.length > 0) {
      Image.getSize(
        this.images[0].url,
        (width, height) => {
          // Calcular a proporção e definir altura mantendo a largura do card
          const aspectRatio = width / height;
          const calculatedHeight = CARD_WIDTH / aspectRatio;
          this.setState({imageHeight: calculatedHeight});
        },
        error => {
          console.log('Erro ao carregar dimensões da imagem:', error);
        },
      );
    }

    // Configurar passagem automática de slides
    this.intervalId = setInterval(() => {
      this.goToNextSlide();
    }, 3000);
  }

  componentWillUnmount() {
    // Limpar o intervalo quando o componente for desmontado
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  images = [
    {
      id: '1',
      url: 'https://firebasestorage.googleapis.com/v0/b/modamaskavo-876a9.firebasestorage.app/o/photos_home%2Fhome_1.jpeg?alt=media&token=8fba3ed3-e8fa-4179-9b50-4a6b15c88b92',
    },
    {
      id: '2',
      url: 'https://firebasestorage.googleapis.com/v0/b/modamaskavo-876a9.firebasestorage.app/o/photos_home%2Fhome_2.jpg?alt=media&token=7a25490b-425f-4d11-b836-52d4a0cda5ae',
    },
    {
      id: '3',
      url: 'https://firebasestorage.googleapis.com/v0/b/modamaskavo-876a9.firebasestorage.app/o/photos_home%2Fhome_3.jpeg?alt=media&token=d004cbd7-8c9c-4a7b-a113-c2e3dd5003c4',
    },
    {
      id: '4',
      url: 'https://firebasestorage.googleapis.com/v0/b/modamaskavo-876a9.firebasestorage.app/o/photos_home%2Fhome_4.jpeg?alt=media&token=7f0cdac0-a184-46fa-a5c9-40346d2da5a7',
    },
    {
      id: '5',
      url: 'https://firebasestorage.googleapis.com/v0/b/modamaskavo-876a9.firebasestorage.app/o/photos_home%2Fhome_5.jpg?alt=media&token=4cfc6b32-142a-4fe3-ba64-2da307da2983',
    },
    {
      id: '6',
      url: 'https://firebasestorage.googleapis.com/v0/b/modamaskavo-876a9.firebasestorage.app/o/photos_home%2Fhome_6.jpeg?alt=media&token=bd80b34c-3a86-4b8f-9a11-88e8ed39f92a',
    },
    {
      id: '7',
      url: 'https://firebasestorage.googleapis.com/v0/b/modamaskavo-876a9.firebasestorage.app/o/photos_home%2Fhome_7.jpeg?alt=media&token=9c415b95-5a69-457f-93a1-c1ecb47a3ab8',
    },
  ];

  // Função para passar para a próxima imagem
  goToNextSlide = () => {
    this.intervalId = clearInterval(this.intervalId);
    const {activeIndex} = this.state;
    if (activeIndex === this.images.length - 1) {
      this.flatListRef.current.scrollToIndex({index: 0, animated: true});
    } else {
      this.flatListRef.current.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    }
  };

  // Função para voltar para a imagem anterior
  goToPrevSlide = () => {
    this.intervalId = clearInterval(this.intervalId);
    const {activeIndex} = this.state;
    if (activeIndex === 0) {
      this.flatListRef.current.scrollToIndex({
        index: this.images.length - 1,
        animated: true,
      });
    } else {
      this.flatListRef.current.scrollToIndex({
        index: activeIndex - 1,
        animated: true,
      });
    }
  };

  handleScroll = event => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    this.setState({activeIndex: index});
  };

  handleImageLoadStart = id => {
    this.setState(prevState => ({
      imagesLoading: {...prevState.imagesLoading, [id]: true},
    }));
  };

  handleImageLoadEnd = id => {
    this.setState(prevState => ({
      imagesLoading: {...prevState.imagesLoading, [id]: false},
    }));
  };

  renderItem = ({item}) => {
    const {imagesLoading, imageHeight} = this.state;
    const isLoading = imagesLoading[item.id];

    return (
      <View
        style={[
          {
            width: CARD_WIDTH,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
            overflow: 'hidden',
            height: imageHeight,
          },
        ]}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          visible={!isLoading}
          width={CARD_WIDTH}
          height={imageHeight}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}>
          <View />
        </ShimmerPlaceholder>

        <Image
          source={{uri: item.url}}
          style={{
            width: CARD_WIDTH,
            height: imageHeight,
            opacity: isLoading ? 0 : 1, // Esconder a imagem enquanto carrega
          }}
          onLoadStart={() => this.handleImageLoadStart(item.id)}
          onLoadEnd={() => this.handleImageLoadEnd(item.id)}
          resizeMode="cover"
        />
      </View>
    );
  };

  // Lidar com erros de scrollToIndex
  onScrollToIndexFailed = info => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      this.flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
      });
    });
  };

  render() {
    const {activeIndex, imageHeight} = this.state;

    return (
      <Surface style={styles.surface}>
        <Card style={styles.card}>
          <View style={[styles.carouselContainer, {height: imageHeight}]}>
            {/* Botão de navegação anterior */}
            <TouchableOpacity
              style={[styles.navButton, styles.leftButton]}
              onPress={this.goToPrevSlide}
              activeOpacity={0.7}>
              <Icon name="chevron-left" size={24} color="#FFFFFFFF" />
            </TouchableOpacity>

            {/* Carrossel */}
            <FlatList
              ref={this.flatListRef}
              data={this.images}
              renderItem={this.renderItem}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={this.handleScroll}
              keyExtractor={item => item.id}
              onScrollToIndexFailed={this.onScrollToIndexFailed}
              snapToInterval={CARD_WIDTH}
              decelerationRate="fast"
              snapToAlignment="center"
              contentContainerStyle={styles.flatListContent}
            />

            {/* Botão de navegação próximo */}
            <TouchableOpacity
              style={[styles.navButton, styles.rightButton]}
              onPress={this.goToNextSlide}
              activeOpacity={0.7}>
              <Icon name="chevron-right" size={24} color="#FFFFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Paginação logo abaixo da imagem */}
          <View style={styles.pagination}>
            {this.images.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  this.flatListRef.current.scrollToIndex({
                    index,
                    animated: true,
                  });
                }}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        index === activeIndex ? '#000000FF' : '#D3D3D3',
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <View style={styles.contentBelow}>
          <Text style={styles.title}>Peças Exclusivas e Uniformes</Text>
          <Text style={styles.description}>
            Faça seu pedido ou compre na loja e retornaremos com o melhor preço
            e qualidade.
          </Text>
          <Button
            mode="contained"
            onPress={() => NavigatorService.navigate('Orders')}
            icon={({size, color}) => (
              <Ionicons name="shirt" size={size} color={color} />
            )}
            style={styles.button}>
            Faça seu pedido
          </Button>
          <Button
            mode="contained"
            onPress={() => NavigatorService.navigate('Store')}
            icon={({size, color}) => (
              <Ionicons name="storefront" size={size} color={color} />
            )}
            style={styles.button}>
            Comprar na loja
          </Button>
        </View>
      </Surface>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onReadDataUser: () => dispatch(readDataUser()),
  onReadDataUsersFull: () => dispatch(readDataUsersFull()),
  onReadDataOrders: () => dispatch(readDataOrders()),
  onReadDataOrdersFull: () => dispatch(readDataOrdersFull()),
  onReadDataConfig: () => dispatch(readDataConfig()),
  onReadDataProducts: () => dispatch(fetchProducts()),
});

export default connect(null, mapDispatchToProps)(Home);
