'use strict';

module.exports = class Util {
	static math(base, op, opand) {
		switch (op) {
			case 'add':
			case 'addition':
			case '+':
				return base + opand;
			case 'sub':
			case 'subtract':
			case '-':
				return base - opand;
			case 'mult':
			case 'multiply':
			case '*':
				return base * opand;
			case 'div':
			case 'divide':
			case '/':
				return base / opand;
			case 'exp':
			case 'exponent':
			case '^':
				return base ** opand;
			case 'mod':
			case 'modulo':
			case '%':
				return base % opand;
			default:
				throw new Error('Must pass an operation');
		}
	}

	static safeRequire(id) {
		try {
			return require(id);
		} catch {
			console.error(
				`Install ${id} to continue; run "npm install ${id}" to install it.`
			);
			return undefined;
		}
	}
};
