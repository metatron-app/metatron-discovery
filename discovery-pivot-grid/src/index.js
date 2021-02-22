import 'babel-polyfill';

const common = require('./pivot.common');
const view = require('./pivot.view');

const zs = common()
view(zs);

module.exports = zs;