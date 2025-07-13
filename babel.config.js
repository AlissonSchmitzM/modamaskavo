module.exports = function (api) {
  api.cache(true); // Boa prática para caching
  return {
    presets: ['babel-preset-expo'], // <<< Mude para este preset
  };
};
