const Endb = require('./');
const endb = new Endb('mongodb+srv://test:test1234567890@test-rhvos.mongodb.net/test?retryWrites=true&w=majority', { adapter: 'mongodb'});

endb.on('error', console.error);

endb.get('key');
endb.set('key', 'value');

console.log(endb.options.store);