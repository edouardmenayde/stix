const path = require('path');

module.exports = {
  dataDirectory: path.resolve(process.cwd(), 'test/.data'),
  stores       : {
    defaultStore: {
      client          : 'sqlite3',
      useNullAsDefault: true,
      connection      : {
        filename: path.resolve(process.cwd(), 'test/.tmp/scaffolding.sqlite')
      }
    }
  }
};