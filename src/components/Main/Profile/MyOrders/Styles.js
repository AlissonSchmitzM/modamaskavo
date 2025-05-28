import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: '#fff',
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
    backgroundColor: '#f9f9f9',
  },
  dropdownButtonText: {
    textAlign: 'center',
    color: '#000000',
  },
  clearFilterContainer: {
    alignItems: 'center',
    marginBottom: 5,
    backgroundColor: '#fff',
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
});
