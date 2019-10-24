By default, Endb uses its own parse and stringify methods for data serialization to ensure consistency.
Optionally, You can pass your own serialization methods to support extra data types.

```javascript
const endb = new Endb({
    serialize: JSON.stringify,
    deserialize: JSON.parse
});
```

> Warning: Using custom serializers means you lose any guarantee of data consistency. You should do extensive testing with your serialisation functions and chosen storage engine.