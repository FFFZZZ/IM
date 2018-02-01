const env = process.env.NODE_ENV
var dev = require('./config.dev');
var pro=require('./config.pro')

module.exports = env == 'production' ? pro : dev;