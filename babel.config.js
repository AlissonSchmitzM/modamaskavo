module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // Ou '@babel/preset-env', '@react-native/babel-preset'
    plugins: [
      'react-native-reanimated/plugin', // Essencial para Reanimated
      // Outros plugins que você possa ter (ex: para módulos de estilo, etc.)
    ],
  };
};