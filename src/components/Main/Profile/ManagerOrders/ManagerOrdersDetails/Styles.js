import {StyleSheet, Dimensions} from 'react-native';

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  divider: {
    marginVertical: 12,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  situationContainer: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lottieContainer: {
    width: '10%',
  },
  infoRow: {
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  dateContainer: {
    marginTop: 12,
  },
  dateText: {
    color: 'gray',
  },
  userHeaderContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#000',
  },
  userHeaderInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
  },
  userEmail: {
    color: '#555',
  },
  logosContainer: {
    marginTop: 8,
  },
  logoLink: {
    marginVertical: 4,
  },
  logoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBE8E879',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  logoText: {
    flex: 1,
    color: '#000',
    fontSize: 14,
  },
  viewIcon: {
    margin: 0,
    padding: 0,
  },
  invalidLogo: {
    color: 'red',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: windowHeight * 0.8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    height: windowHeight * 0.5,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#000',
  },
  closeButtonLabel: {
    color: '#fff',
  },
  actionButtonsContainer: {
    marginTop: 10,
  },
  actionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  dialogContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 500,
  },
  dialogTitle: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#000',
    fontWeight: 'bold',
  },
  dialogText: {
    marginBottom: 15,
  },
  dialogInput: {
    marginBottom: 15,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
});

export default styles;
