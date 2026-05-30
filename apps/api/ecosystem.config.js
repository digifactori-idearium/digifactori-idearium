// PM2 process manager configuration
// Docs: https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      // Identity
      name: 'idearium-api',
      script: './dist/main.js',

      // Runtime
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '5s',
      restart_delay: 3000,

      // Logs
      output: './logs/out.log',
      error: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Environment = production fallback
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
