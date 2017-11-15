module.exports = {
  dataDirectory: 'test/.data',
  stores       : {
    defaultStore: {
      client          : 'sqlite3',
      useNullAsDefault: true,
      connection      : {
        filename: 'test/.tmp/scaffolding.sqlite'
      }
    }
  }
};