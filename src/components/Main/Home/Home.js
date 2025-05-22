import React, {Component} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {readDataUser} from '../../../store/actions/userActions';
import {connect} from 'react-redux';
import {readDataOrders} from '../../../store/actions/orderActions';

class Home extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.onReadDataUser();
    this.props.onReadDataOrders();
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <Text style={styles.title}>Home</Text>
        <Button
          title="Ir para produtos"
          //onPress={() => this.props.navigation.navigate('WooCommerceProducts')}
          onPress={() => console.log(this.props.orders)}
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
  onReadDataOrders: () => dispatch(readDataOrders()),
});

const mapStateToProps = state => ({
  orders: state.orderReducer.orders,
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
