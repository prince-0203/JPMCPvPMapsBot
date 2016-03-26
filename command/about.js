/**
 * about command
 */

const config = require('../package.json');

module.exports = (callback) => {
  return callback(`JPMCPvP Maps Bot v${config.version}\nAuthor: prince(https://github.com/prince-0203) TwitterID: prince__0203\n(c) prince 2016`);
};
