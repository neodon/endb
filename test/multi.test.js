'use strict';

import {serial} from 'ava';
import {Endb} from '../src';

serial('Multiple Endb instances', async t => {
	const {members, users} = Endb.multi(['members', 'users']);
	t.is(await members.set('foo', 'bar'), true);
	t.is(await users.set('bar', 'foo'), true);
	t.is(await members.has('foo'), true);
	t.is(await users.has('bar'), true);
	t.is(await members.get('foo'), 'bar');
	t.is(await users.get('bar'), 'foo');
	t.is(await members.clear(), undefined);
	t.is(await users.clear(), undefined);
});
