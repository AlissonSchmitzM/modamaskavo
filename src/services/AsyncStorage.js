import AsyncStorage from '@react-native-async-storage/async-storage';

const safeParse = value => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const safeStringify = value => {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
};

const store = {
  /**
   * Get a value or an array of values by key(s) from AsyncStorage
   * @param {String|Array} key A key or array of keys
   * @return {Promise}
   */
  async get(key) {
    if (!Array.isArray(key)) {
      const value = await AsyncStorage.getItem(key);
      return safeParse(value);
    }
    const result = await AsyncStorage.multiGet(key);
    return result.map(([_, value]) => safeParse(value));
  },

  /**
   * Save a key/value pair or array of key/value pairs to AsyncStorage.
   * @param  {String|Array} key The key or array of [key, value] pairs
   * @param  {Any} value The value to save (if key is string)
   * @return {Promise}
   */
  async save(key, value) {
    if (!Array.isArray(key)) {
      const jsonValue = safeStringify(value);
      if (jsonValue !== null) {
        return AsyncStorage.setItem(key, jsonValue);
      }
      return;
    }

    const pairs = key
      .map(([k, v]) => [k, safeStringify(v)])
      .filter(([_, v]) => v !== null);

    return AsyncStorage.multiSet(pairs);
  },

  /**
   * Update a value for a key. Replaces primitive or deep merges if object.
   * @param  {String} key
   * @param  {Any} value
   * @return {Promise}
   */
  async update(key, value) {
    const current = await this.get(key);

    let updatedValue;
    if (
      typeof current === 'object' &&
      current !== null &&
      typeof value === 'object'
    ) {
      updatedValue = {...current, ...value};
    } else {
      updatedValue = value;
    }

    return this.save(key, updatedValue);
  },

  /**
   * Delete a key or array of keys from AsyncStorage
   * @param  {String|Array} key
   * @return {Promise}
   */
  delete(key) {
    return Array.isArray(key)
      ? AsyncStorage.multiRemove(key)
      : AsyncStorage.removeItem(key);
  },

  /**
   * Get all keys stored in AsyncStorage
   * @return {Promise<Array>}
   */
  keys() {
    return AsyncStorage.getAllKeys();
  },
};

export default store;
