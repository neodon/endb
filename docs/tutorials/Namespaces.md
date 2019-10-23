Endb supports namespaces to avoid key collisions. Namespaces allow you to perform operations only for a certain namespace while using the same database.

```javascript
const users = new Endb({ namespace: 'users' });
const members = new Endb({ namespace: 'cache' });

await users.set('foo', 'users'); // true
await members.set('foo', 'members'); // true
await users.get('foo'); // 'users'
await members.get('foo'); // 'members'
await users.clear(); // undefined
await users.get('foo'); // undefined
await members.get('foo'); // 'members'
```