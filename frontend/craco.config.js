const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },
  babel: {
    presets: [
      ['@babel/preset-env', { targets: { browsers: ['last 2 versions'] } }],
    ],
  },
};
