import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, Image, StyleSheet} from 'react-native';
import axios from 'axios';

const WooCommerceProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          'https://www.modamaskavo.com.br/wp-json/wc/v3/products',
          {
            params: {
              stock_status: 'instock',
            },
            auth: {
              username: 'ck_786b172f345c8788590cf6a0a78bff51ef0cfea1',
              password: 'cs_029f3eb048e8a3d3ed416f1c63254959ee8ad0bb',
            },
          },
        );
        setProducts(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.product}>
            <Image source={{uri: item.images[0]?.src}} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>R$ {item.price}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  product: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: '#888',
  },
});

export default WooCommerceProducts;
