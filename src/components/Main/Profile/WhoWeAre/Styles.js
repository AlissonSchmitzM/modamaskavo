import {StyleSheet, Dimensions} from 'react-native';

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerImage: {
    width: windowWidth,
    height: 300,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionContainer: {},
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
    textAlign: 'justify',
  },
  highlightContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 5,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#000',
  },
  highlightText: {
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 26,
    color: '#333',
  },
  testimonialsContainer: {
    marginVertical: 25,
  },
  testimonialsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  testimonialImage: {
    width: (windowWidth - 50) / 3,
    height: (windowWidth - 50) / 3,
    borderRadius: 5,
    marginBottom: 10,
  },
  quoteContainer: {
    backgroundColor: '#f9f9f9',
    padding: 25,
    borderRadius: 5,
    marginVertical: 20,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 26,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  authorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  quoteAuthor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  quoteRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default styles;
