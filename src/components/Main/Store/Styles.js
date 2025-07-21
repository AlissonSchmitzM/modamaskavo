import {Dimensions, StyleSheet} from 'react-native';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width - 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
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
    marginHorizontal: 12,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    color: '#000000FF',
    fontWeight: 'bold',
  },
  stock: {
    fontSize: 14,
    color: '#006B92FF',
    marginBottom: 8,
  },
  variableProduct: {
    fontSize: 14,
    color: '#00AEEF',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#000000FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderRadius: 50,
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  regularPrice: {
    textDecorationLine: 'line-through',
    color: '#888',
    fontSize: 14,
  },
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
  shortDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default styles;
