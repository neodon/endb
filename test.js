const Endb = require('./src');
const endb = new Endb();

(async () => {
    await endb.set('foo', 'bar');
    console.log(await endb.get('foo'));
})();