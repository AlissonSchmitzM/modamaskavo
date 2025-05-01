import {StyleSheet} from 'react-native';

export const colors = {
  PRIMARY: '#000000FF',
  SECONDARY: '#7A7A7AFF',
};

export const styleButton = StyleSheet.create({
  textButton: {
    fontSize: 16,
    color: 'white',
  },
  button: {
    width: '100%',
    height: 40,
    borderRadius: 5,
  },
  contentButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 20,
    color: 'white',
  },
});
