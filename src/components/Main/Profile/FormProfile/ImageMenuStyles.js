import {StyleSheet, Appearance} from 'react-native';

const imageMenuStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: '80%',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 8,
    color: Appearance.getColorScheme() === 'dark' ? '#ADADADFF' : '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});

export default imageMenuStyles;
