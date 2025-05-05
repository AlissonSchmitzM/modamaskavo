import React, {useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, RadioButton, TextInput} from 'react-native-paper';
import {order} from '../../../assets';
import LottieView from 'lottie-react-native';

const Orders = () => {
  const [selectedOption, setSelectedOption] = useState('exclusive');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pedidos</Text>
        <LottieView source={order} autoPlay loop style={styles.lottie} />
      </View>
      <View style={styles.content}>
        <RadioButton.Group
          onValueChange={value => setSelectedOption(value)}
          value={selectedOption}>
          <View style={styles.radioGroup}>
            <RadioButton.Item
              color="#000"
              label="Peças Exclusivas"
              value="exclusive"
            />
            <RadioButton.Item color="#000" label="Uniformes" value="uniform" />
          </View>
        </RadioButton.Group>

        {selectedOption === 'exclusive' && (
          <View style={styles.inputsContainer}>
            {Array.from({length: 9}).map((_, index) => (
              <TextInput
                key={index}
                label="Nome"
                style={styles.input}
                mode="outlined"
                theme={{colors: {primary: '#000000'}}}
              />
            ))}
          </View>
        )}

        {selectedOption === 'uniform' && (
          <View style={styles.inputsContainer}>
            <TextInput
              label="TESTE"
              style={styles.input}
              mode="outlined"
              theme={{colors: {primary: '#000000'}}}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  lottie: {
    width: 400,
    height: 200,
    marginTop: '-5%',
  },
  content: {
    alignItems: 'center',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '90%',
    marginBottom: 15,
    backgroundColor: '#fff',
  },
});

export default Orders;
