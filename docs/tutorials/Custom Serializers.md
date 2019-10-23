By default, Endb uses its own parse and stringify functions for serialization and deserialization of data to ensure consistency.
Optionally, You can pass your own (de)serialization functions to support extra data types.

```javascript
const endb = new Endb({
    serialize: JSON.stringify,
    deserialize: JSON.parse
});
```