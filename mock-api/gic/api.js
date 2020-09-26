const { join } = require('path');
const { readMockFile } = require('../../utils');

function getGic() {
  return readMockFile(join(__dirname, 'source.html'));
}

module.exports = {
  getGic,
};
