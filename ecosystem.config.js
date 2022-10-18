module.exports = {
  apps: [
    {
      name: 'colevAPI',
      script: './api/index.js',
      env: {
        NODE_ENV: 'produccion',
      },
    },
  ],
};
