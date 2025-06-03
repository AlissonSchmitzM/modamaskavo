import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  card: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    marginBottom: 10,
  },
  carouselContainer: {
    position: 'relative',
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  flatListContent: {
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  loader: {
    position: 'absolute',
    zIndex: 1,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{translateY: -20}],
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftButton: {
    left: 10,
  },
  rightButton: {
    right: 10,
  },
  contentBelow: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#555',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#000000',
  },
});

export default styles;
