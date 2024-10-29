module.exports = {
  apps: [
    {
      name: 'app',         // Main UI server
      script: './server.js',
      cwd: './noodle',
      env: {
        PORT: process.env.PORT || 8888  // Primary port
      }
    },
    {
      name: 'api',         // API server
      script: './index.js',
      cwd: './noodle-api',
      env: {
        PORT: process.env.API_PORT || 8889
      }
    },
    {
      name: 'hermes',      // WebSocket server
      script: './index.js',
      cwd: './hermes',
      env: {
        PORT: process.env.HERMES_PORT || 8890
      }
    },
    {
      name: 'unicorn',     // Collaborative document server
      script: './index.js',
      cwd: './unicorn',
      env: {
        PORT: process.env.UNICORN_PORT || 8891
      }
    }
  ]
}
