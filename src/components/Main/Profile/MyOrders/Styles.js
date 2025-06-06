import {StyleSheet, Dimensions} from 'react-native';

const windowHeight = Dimensions.get('window').height;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 8,
  },
  filterLabel: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#000000',
  },
  dropdownButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#FFFFFFFF',
  },
  dropdownButtonText: {
    textAlign: 'center',
    color: '#000000',
  },
  clearFilterContainer: {
    alignItems: 'center',
    marginBottom: 5,
    backgroundColor: '#F5F5F5',
    paddingBottom: 10,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  bottomPadding: {
    height: '2%', // Espaço extra no final da lista
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60, // PAGINATION_CONTAINER_HEIGHT
    elevation: 5, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 1000, // Garante que fique acima de outros elementos
  },
  paginationButton: {
    minWidth: 100,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageIndicator: {
    fontWeight: 'bold',
    color: '#000000',
  },
  logoText: {
    flex: 1,
    color: '#000',
    fontSize: 14,
  },
  logoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBE8E879',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  logoLink: {
    marginVertical: 4,
  },
  viewIcon: {
    margin: 0,
    padding: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 30,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 600,
    height: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    aspectRatio: 1, // Mantém proporção quadrada
    marginBottom: 15,
    borderRadius: 5,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 450,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#000000FF',
  },
  closeButtonLabel: {
    color: 'white',
  },
  invalidLogo: {
    color: 'red',
    fontStyle: 'italic',
  },
  logosContainer: {
    marginTop: 20,
  },
  infoRow: {
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
});
