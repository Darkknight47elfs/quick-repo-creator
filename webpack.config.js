const path = require('path');

module.exports = {
  // ... your existing configuration
  resolve: {
    fallback: {
      http: require.resolve('stream-http'),
      // You may need to add more fallbacks depending on your code
    },
  },
  // ... other configurations
};
