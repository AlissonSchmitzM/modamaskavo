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
import {readDataConfig} from '../../../store/actions/configActions';
import {Card, Surface, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import NavigatorService from '../../../services/NavigatorService';
import styles from './Styles';
// Importações para o Shimmer
import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

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
      url: 'https://firebasestorage.googleapis.com/v0/b/modamaskavo-876a9.firebasestorage.app/o/photos_home%2Fhome_1.jpeg?alt=media&token=0fd1e082-e9a3-4107-8fc8-d5f7ffe17825',
    },
    {
      id: '2',
      url: 'https://firebasestorage.googleapis.com/v0/b/modamaskavo-876a9.firebasestorage.app/o/photos_home%2Fhome_2.jpg?alt=media&token=c7aa0091-bbd1-48c6-9f84-7e0e96111de4',
    },
    {
      id: '3',
      url: 'https://firebasestorage.googleapis.com/v0/b/modamaskavo-876a9.firebasestorage.app/o/photos_home%2Fhome_3.jpeg?alt=media&token=4412da46-a03e-47dc-9b7c-40b30077efcc',
    },
    {
      id: '4',
      url: 'https://firebasestorage.googleapis.com/v0/b/modamaskavo-876a9.firebasestorage.app/o/photos_home%2Fhome_4.jpeg?alt=media&token=90b48c12-66e5-4b75-b601-8251195fd689',
    },
    {
      id: '5',
      url: 'https://firebasestorage.googleapis.com/v0/b/modamaskavo-876a9.firebasestorage.app/o/photos_home%2Fhome_5.jpg?alt=media&token=db0c7fec-e82d-46b3-853b-1fed99cd1063',
    },
    {
      id: '6',
      url: 'https://firebasestorage.googleapis.com/v0/b/modamaskavo-876a9.firebasestorage.app/o/photos_home%2Fhome_6.jpeg?alt=media&token=d3d0997d-6440-47ce-b9e5-a447e9fb91d3',
    },
    {
      id: '7',
      url: 'https://firebasestorage.googleapis.com/v0/b/modamaskavo-876a9.firebasestorage.app/o/photos_home%2Fhome_7.jpeg?alt=media&token=61964351-f675-4de6-8631-6453c0d7fb8a',
    },
  ];

  // Função para passar para a próxima imagem
  goToNextSlide = () => {
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
            Faça seu pedido e retornaremos com o melhor preço e qualidade.
          </Text>
          <Button
            mode="contained"
            onPress={() => NavigatorService.navigate('Orders')}
            style={styles.button}>
            Faça seu pedido
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
});

export default connect(null, mapDispatchToProps)(Home);
