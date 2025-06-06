import {StyleSheet} from 'react-native';
import {colors} from '../../../styles/Styles';

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo semi-transparente
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 8,
    elevation: 5,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalCepInfo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    color: '#555',
  },
  centeredView: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  optionsList: {
    maxHeight: 250, // Limita altura da lista
    marginBottom: 15,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionName: {
    fontSize: 15,
    fontWeight: '500',
  },
  optionPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.PRIMARY, // Usa cor primária
  },
  optionDelivery: {
    fontSize: 13,
    color: '#666',
  },
  closeButton: {
    marginTop: 10,
  },
});

export default modalStyles;
