import path from 'path'

require('dotenv').config();

module.exports = {
    apps: [{
        name: 'Clinic Api',
        script: './src/app.js',
        out_file: path.resolve(__dirname, 'logs', 'output-pm2.log'),
        error_file: path.resolve(__dirname, 'logs', 'error-pm2.log'),
        merge_logs: true,
        autorestart: true,
        min_uptime: 10000,
        max_restarts: 10,
        watch: false,
        env_production: {
            'NODE_ENV': 'production',
        }
    }]
};