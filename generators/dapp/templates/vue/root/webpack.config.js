module.exports = require('../../vue/webpack.config')(
  require('./dbcp.json').public.name,
  require('path').resolve(__dirname, './dist'),
);
