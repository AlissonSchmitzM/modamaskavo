import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  lottie: {
    width: 400,
    height: 200,
    marginTop: '-5%',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputsContainer: {
    width: '90%',
    alignItems: 'center',
  },
  inputWrapper: {
    width: '100%',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 250,
  },
  dropdownList: {
    maxHeight: 250,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  button: {
    width: '90%',
    marginBottom: 10,
    backgroundColor: '#000000',
  },
  fileUploadContainer: {
    marginBottom: 15,
    width: '100%',
  },
  fileUploadLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  fileUploadControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileUploadButton: {
    flex: 1,
    borderColor: '#000000',
    borderWidth: 1,
  },
  selectedFilesContainer: {
    marginTop: 10,
  },
  selectedFilesTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  filePreviewsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filePreviewContainer: {
    margin: 4,
  },
  fileChip: {
    backgroundColor: '#f0f0f0',
    marginBottom: 5,
    borderColor: '#000000',
  },
  fileChipText: {
    fontSize: 12,
    color: '#000000',
  },
  filePreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
});

export default styles;
