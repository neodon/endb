- **Isolation**: Namespaces isolate elements within a database.
- **Avoid Key-Collisions**: Endb namespaces separate elements (keys & values) by prefixing the key with a certain name.
- **Clear Certain Namespace**: Namespaces allow you to clear only a certain namespace while using the same database.

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