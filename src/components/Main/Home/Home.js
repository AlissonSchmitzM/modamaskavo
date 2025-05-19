import React, {Component} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {readDataUser} from '../../../store/actions/userActions';
import {connect} from 'react-redux';

class Home extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.onReadDataUser();
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <Text style={styles.title}>Home</Text>
        <Button
          title="Ir para produtos"
          onPress={() => this.props.navigation.navigate('WooCommerceProducts')}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const mapDispatchToProps = dispatch => ({
  onReadDataUser: () => dispatch(readDataUser()),
});

export default connect(null, mapDispatchToProps)(Home);
