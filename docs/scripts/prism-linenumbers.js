(function() {
	if (typeof self === 'undefined' || !self.Prism || !self.document) {
		return;
	}

	Prism.hooks.add('complete', function(env) {
		if (!env.code) {
			return;
		}

		// Works only for <code> wrapped inside <pre> (not inline)
		const pre = env.element.parentNode;
		const clsReg = /\s*\bline-numbers\b\s*/;
		if (
			!pre ||
			!/pre/i.test(pre.nodeName) ||
			// Abort only if nor the <pre> nor the <code> have the class
			(!clsReg.test(pre.className) && !clsReg.test(env.element.className))
		) {
			return;
		}

		if (env.element.querySelector('.line-numbers-rows')) {
			// Abort if line numbers already exists
			return;
		}

		if (clsReg.test(env.element.className)) {
			// Remove the class "line-numbers" from the <code>
			env.element.className = env.element.className.replace(clsReg, '');
		}

		if (!clsReg.test(pre.className)) {
			// Add the class "line-numbers" to the <pre>
			pre.className += ' line-numbers';
		}

		const match = env.code.match(/\n(?!$)/g);
		const linesNum = match ? match.length + 1 : 1;
		let lineNumbersWrapper;

		let lines = new Array(linesNum + 1);
		lines = lines.join('<span></span>');

		lineNumbersWrapper = document.createElement('span');
		lineNumbersWrapper.setAttribute('aria-hidden', 'true');
		lineNumbersWrapper.className = 'line-numbers-rows';
		lineNumbersWrapper.innerHTML = lines;

		if (pre.hasAttribute('data-start')) {
			pre.style.counterReset =
				'linenumber ' + (parseInt(pre.getAttribute('data-start'), 10) - 1);
		}

		env.element.append(lineNumbersWrapper);
	});
})();
