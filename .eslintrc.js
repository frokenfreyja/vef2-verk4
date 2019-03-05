module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'linebreak-style': 0,
    'object-curly-newline': ['error', {
      'ExportDeclaration': { 'multiline': true, 'minProperties': 4 }
    }]
  },
  plugins: ['import'],
};
