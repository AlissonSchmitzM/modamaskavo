import React, {Component} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  readDataUser,
  readDataUsersFull,
} from '../../../store/actions/userActions';
import {connect} from 'react-redux';
import {
  readDataOrders,
  readDataOrdersFull,
} from '../../../store/actions/orderActions';
import {readDataConfig} from '../../../store/actions/configActions';

class Home extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.onReadDataUser();
    this.props.onReadDataUsersFull();
    this.props.onReadDataOrders();
    this.props.onReadDataOrdersFull();
    this.props.onReadDataConfig();
  }

  render() {
    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: '#f5f5f5'}}
        edges={['bottom', 'left', 'right']}>
        <Text style={{fontSize: 28, fontWeight: 'bold', textAlign: 'center'}}>
          Home
        </Text>
        <Button
          title="Ir para produtos"
          onPress={() => this.props.navigation.navigate('WooCommerceProducts')}
        />
      </SafeAreaView>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onReadDataUser: () => dispatch(readDataUser()),
  onReadDataUsersFull: () => dispatch(readDataUsersFull()),
  onReadDataOrders: () => dispatch(readDataOrders()),
  onReadDataOrdersFull: () => dispatch(readDataOrdersFull()),
  onReadDataConfig: () => dispatch(readDataConfig()),
});

export default connect(null, mapDispatchToProps)(Home);
