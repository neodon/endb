/* http://prismjs.com/download.html?themes=prism&languages=markup+css+clike+javascript+json+yaml&plugins=line-numbers */
const _self =
	typeof window !== 'undefined'
		? window
		: typeof WorkerGlobalScope !== 'undefined' &&
		  self instanceof WorkerGlobalScope
		? self
		: {};
const Prism = (function() {
	const e = /\blang(?:uage)?-(\w+)\b/i;
	let t = 0;
	var n = (_self.Prism = {
		manual: _self.Prism && _self.Prism.manual,
		util: {
			encode(e) {
				return e instanceof a
					? new a(e.type, n.util.encode(e.content), e.alias)
					: n.util.type(e) === 'Array'
					? e.map(n.util.encode)
					: e
							.replace(/&/g, '&amp;')
							.replace(/</g, '&lt;')
							.replace(/\u00A0/g, ' ');
			},
			type(e) {
				return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1];
			},
			objId(e) {
				return e.__id || Object.defineProperty(e, '__id', {value: ++t}), e.__id;
			},
			clone(e) {
				const t = n.util.type(e);
				switch (t) {
					case 'Object':
						var a = {};
						for (const r in e)
							e.hasOwnProperty(r) && (a[r] = n.util.clone(e[r]));
						return a;
					case 'Array':
						return (
							e.map &&
							e.map(function(e) {
								return n.util.clone(e);
							})
						);
				}

				return e;
			}
		},
		languages: {
			extend(e, t) {
				const a = n.util.clone(n.languages[e]);
				for (const r in t) a[r] = t[r];
				return a;
			},
			insertBefore(e, t, a, r) {
				r = r || n.languages;
				const l = r[e];
				if (arguments.length == 2) {
					a = arguments[1];
					for (var i in a) a.hasOwnProperty(i) && (l[i] = a[i]);
					return l;
				}

				const o = {};
				for (const s in l)
					if (l.hasOwnProperty(s)) {
						if (s == t) for (var i in a) a.hasOwnProperty(i) && (o[i] = a[i]);
						o[s] = l[s];
					}

				return (
					n.languages.DFS(n.languages, function(t, n) {
						n === r[e] && t != e && (this[t] = o);
					}),
					(r[e] = o)
				);
			},
			DFS(e, t, a, r) {
				r = r || {};
				for (const l in e)
					e.hasOwnProperty(l) &&
						(t.call(e, l, e[l], a || l),
						n.util.type(e[l]) !== 'Object' || r[n.util.objId(e[l])]
							? n.util.type(e[l]) !== 'Array' ||
							  r[n.util.objId(e[l])] ||
							  ((r[n.util.objId(e[l])] = !0), n.languages.DFS(e[l], t, l, r))
							: ((r[n.util.objId(e[l])] = !0),
							  n.languages.DFS(e[l], t, null, r)));
			}
		},
		plugins: {},
		highlightAll(e, t) {
			const a = {
				callback: t,
				selector:
					'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
			};
			n.hooks.run('before-highlightall', a);
			for (
				var r, l = a.elements || document.querySelectorAll(a.selector), i = 0;
				(r = l[i++]);

			)
				n.highlightElement(r, e === !0, a.callback);
		},
		highlightElement(t, a, r) {
			for (var l, i, o = t; o && !e.test(o.className); ) o = o.parentNode;
			o &&
				((l = (o.className.match(e) || [, ''])[1].toLowerCase()),
				(i = n.languages[l])),
				(t.className =
					t.className.replace(e, '').replace(/\s+/g, ' ') + ' language-' + l),
				(o = t.parentNode),
				/pre/i.test(o.nodeName) &&
					(o.className =
						o.className.replace(e, '').replace(/\s+/g, ' ') + ' language-' + l);
			const s = t.textContent;
			const u = {element: t, language: l, grammar: i, code: s};
			if ((n.hooks.run('before-sanity-check', u), !u.code || !u.grammar))
				return (
					u.code && (u.element.textContent = u.code),
					n.hooks.run('complete', u),
					void 0
				);
			if ((n.hooks.run('before-highlight', u), a && _self.Worker)) {
				const g = new Worker(n.filename);
				g.addEventListener('message', function(e) {
					(u.highlightedCode = e.data),
						n.hooks.run('before-insert', u),
						(u.element.innerHTML = u.highlightedCode),
						r && r.call(u.element),
						n.hooks.run('after-highlight', u),
						n.hooks.run('complete', u);
				}),
					g.postMessage(
						JSON.stringify({
							language: u.language,
							code: u.code,
							immediateClose: !0
						})
					);
			} else
				(u.highlightedCode = n.highlight(u.code, u.grammar, u.language)),
					n.hooks.run('before-insert', u),
					(u.element.innerHTML = u.highlightedCode),
					r && r.call(t),
					n.hooks.run('after-highlight', u),
					n.hooks.run('complete', u);
		},
		highlight(e, t, r) {
			const l = n.tokenize(e, t);
			return a.stringify(n.util.encode(l), r);
		},
		tokenize(e, t) {
			const a = n.Token;
			const r = [e];
			const l = t.rest;
			if (l) {
				for (var i in l) t[i] = l[i];
				delete t.rest;
			}

			e: for (var i in t)
				if (t.hasOwnProperty(i) && t[i]) {
					let o = t[i];
					o = n.util.type(o) === 'Array' ? o : [o];
					for (const u of o) {
						const g = u.inside;
						const c = Boolean(u.lookbehind);
						const h = Boolean(u.greedy);
						let f = 0;
						const d = u.alias;
						if (h && !u.pattern.global) {
							const p = u.pattern.toString().match(/[imuy]*$/)[0];
							u.pattern = new RegExp(u.pattern.source, p + 'g');
						}

						u = u.pattern || u;
						for (let m = 0, y = 0; m < r.length; y += r[m].length, ++m) {
							let v = r[m];
							if (r.length > e.length) break e;
							if (!(v instanceof a)) {
								u.lastIndex = 0;
								var b = u.exec(v);
								let k = 1;
								if (!b && h && m != r.length - 1) {
									if (((u.lastIndex = y), (b = u.exec(e)), !b)) break;
									for (
										var w = b.index + (c ? b[1].length : 0),
											_ = b.index + b[0].length,
											P = m,
											A = y,
											j = r.length;
										j > P && _ > A;
										++P
									)
										(A += r[P].length), w >= A && (++m, (y = A));
									if (r[m] instanceof a || r[P - 1].greedy) continue;
									(k = P - m), (v = e.slice(y, A)), (b.index -= y);
								}

								if (b) {
									c && (f = b[1].length);
									var w = b.index + f;
									var b = b[0].slice(f);
									var _ = w + b.length;
									const x = v.slice(0, w);
									const O = v.slice(_);
									const S = [m, k];
									x && S.push(x);
									const N = new a(i, g ? n.tokenize(b, g) : b, d, b, h);
									S.push(N), O && S.push(O), Array.prototype.splice.apply(r, S);
								}
							}
						}
					}
				}

			return r;
		},
		hooks: {
			all: {},
			add(e, t) {
				const a = n.hooks.all;
				(a[e] = a[e] || []), a[e].push(t);
			},
			run(e, t) {
				const a = n.hooks.all[e];
				if (a && a.length) for (var r, l = 0; (r = a[l++]); ) r(t);
			}
		}
	});
	var a = (n.Token = function(e, t, n, a, r) {
		(this.type = e),
			(this.content = t),
			(this.alias = n),
			(this.length = 0 | (a || '').length),
			(this.greedy = Boolean(r));
	});
	if (
		((a.stringify = function(e, t, r) {
			if (typeof e === 'string') return e;
			if (n.util.type(e) === 'Array')
				return e
					.map(function(n) {
						return a.stringify(n, t, e);
					})
					.join('');
			const l = {
				type: e.type,
				content: a.stringify(e.content, t, r),
				tag: 'span',
				classes: ['token', e.type],
				attributes: {},
				language: t,
				parent: r
			};
			if (
				(l.type == 'comment' && (l.attributes.spellcheck = 'true'), e.alias)
			) {
				const i = n.util.type(e.alias) === 'Array' ? e.alias : [e.alias];
				Array.prototype.push.apply(l.classes, i);
			}

			n.hooks.run('wrap', l);
			const o = Object.keys(l.attributes)
				.map(function(e) {
					return (
						e + '="' + (l.attributes[e] || '').replace(/"/g, '&quot;') + '"'
					);
				})
				.join(' ');
			return (
				'<' +
				l.tag +
				' class="' +
				l.classes.join(' ') +
				'"' +
				(o ? ' ' + o : '') +
				'>' +
				l.content +
				'</' +
				l.tag +
				'>'
			);
		}),
		!_self.document)
	)
		return _self.addEventListener
			? (_self.addEventListener(
					'message',
					function(e) {
						const t = JSON.parse(e.data);
						const a = t.language;
						const r = t.code;
						const l = t.immediateClose;
						_self.postMessage(n.highlight(r, n.languages[a], a)),
							l && _self.close();
					},
					!1
			  ),
			  _self.Prism)
			: _self.Prism;
	const r =
		document.currentScript ||
		[].slice.call(document.querySelectorAll('script')).pop();
	return (
		r &&
			((n.filename = r.src),
			!document.addEventListener ||
				n.manual ||
				r.hasAttribute('data-manual') ||
				(document.readyState !== 'loading'
					? window.requestAnimationFrame
						? window.requestAnimationFrame(n.highlightAll)
						: window.setTimeout(n.highlightAll, 16)
					: document.addEventListener('DOMContentLoaded', n.highlightAll))),
		_self.Prism
	);
})();
typeof module !== 'undefined' && module.exports && (module.exports = Prism),
	typeof global !== 'undefined' && (global.Prism = Prism);
(Prism.languages.markup = {
	comment: /<!--[\w\W]*?-->/,
	prolog: /<\?[\w\W]+?\?>/,
	doctype: /<!DOCTYPE[\w\W]+?>/i,
	cdata: /<!\[CDATA\[[\w\W]*?]]>/i,
	tag: {
		pattern: /<\/?(?!\d)[^\s>\/=$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i,
		inside: {
			tag: {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {punctuation: /^<\/?/, namespace: /^[^\s>\/:]+:/}
			},
			'attr-value': {
				pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/i,
				inside: {punctuation: /[=>"']/}
			},
			punctuation: /\/?>/,
			'attr-name': {pattern: /[^\s>\/]+/, inside: {namespace: /^[^\s>\/:]+:/}}
		}
	},
	entity: /&#?[\da-z]{1,8};/i
}),
	Prism.hooks.add('wrap', function(a) {
		a.type === 'entity' &&
			(a.attributes.title = a.content.replace(/&amp;/, '&'));
	}),
	(Prism.languages.xml = Prism.languages.markup),
	(Prism.languages.html = Prism.languages.markup),
	(Prism.languages.mathml = Prism.languages.markup),
	(Prism.languages.svg = Prism.languages.markup);
(Prism.languages.css = {
	comment: /\/\*[\w\W]*?\*\//,
	atrule: {pattern: /@[\w-]+?.*?(;|(?=\s*\{))/i, inside: {rule: /@[\w-]+/}},
	url: /url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
	selector: /[^\{\}\s][^\{\};]*?(?=\s*\{)/,
	string: {pattern: /("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/, greedy: !0},
	property: /(\b|\B)[\w-]+(?=\s*:)/i,
	important: /\B!important\b/i,
	function: /[-a-z0-9]+(?=\()/i,
	punctuation: /[(){};:]/
}),
	(Prism.languages.css.atrule.inside.rest = Prism.util.clone(
		Prism.languages.css
	)),
	Prism.languages.markup &&
		(Prism.languages.insertBefore('markup', 'tag', {
			style: {
				pattern: /(<style[\w\W]*?>)[\w\W]*?(?=<\/style>)/i,
				lookbehind: !0,
				inside: Prism.languages.css,
				alias: 'language-css'
			}
		}),
		Prism.languages.insertBefore(
			'inside',
			'attr-value',
			{
				'style-attr': {
					pattern: /\s*style=("|').*?\1/i,
					inside: {
						'attr-name': {
							pattern: /^\s*style/i,
							inside: Prism.languages.markup.tag.inside
						},
						punctuation: /^\s*=\s*['"]|['"]\s*$/,
						'attr-value': {pattern: /.+/i, inside: Prism.languages.css}
					},
					alias: 'language-css'
				}
			},
			Prism.languages.markup.tag
		));
Prism.languages.clike = {
	comment: [
		{pattern: /(^|[^\\])\/\*[\w\W]*?\*\//, lookbehind: !0},
		{pattern: /(^|[^\\:])\/\/.*/, lookbehind: !0}
	],
	string: {pattern: /(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: !0},
	'class-name': {
		pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,
		lookbehind: !0,
		inside: {punctuation: /(\.|\\)/}
	},
	keyword: /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	boolean: /\b(true|false)\b/,
	function: /\w+(?=\()/i,
	number: /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
	operator: /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
	punctuation: /[{}[\];(),.:]/
};
(Prism.languages.javascript = Prism.languages.extend('clike', {
	keyword: /\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
	number: /\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,
	function: /[_$a-zA-Z\u00A0-\uFFFF][_$a-zA-Z0-9\u00A0-\uFFFF]*(?=\()/i,
	operator: /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*\*?|\/|~|\^|%|\.{3}/
})),
	Prism.languages.insertBefore('javascript', 'keyword', {
		regex: {
			pattern: /(^|[^\/])\/(?!\/)(\[.+?]|\\.|[^\/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
			lookbehind: !0,
			greedy: !0
		}
	}),
	Prism.languages.insertBefore('javascript', 'string', {
		'template-string': {
			pattern: /`(?:\\\\|\\?[^\\])*?`/,
			greedy: !0,
			inside: {
				interpolation: {
					pattern: /\$\{[^}]+\}/,
					inside: {
						'interpolation-punctuation': {
							pattern: /^\$\{|\}$/,
							alias: 'punctuation'
						},
						rest: Prism.languages.javascript
					}
				},
				string: /[\s\S]+/
			}
		}
	}),
	Prism.languages.markup &&
		Prism.languages.insertBefore('markup', 'tag', {
			script: {
				pattern: /(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,
				lookbehind: !0,
				inside: Prism.languages.javascript,
				alias: 'language-javascript'
			}
		}),
	(Prism.languages.js = Prism.languages.javascript);
(Prism.languages.json = {
	property: /"(?:\\.|[^\\"])*"(?=\s*:)/gi,
	string: /"(?!:)(?:\\.|[^\\"])*"(?!:)/g,
	number: /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee][+-]?\d+)?)\b/g,
	punctuation: /[{}[\]);,]/g,
	operator: /:/g,
	boolean: /\b(true|false)\b/gi,
	null: /\bnull\b/gi
}),
	(Prism.languages.jsonp = Prism.languages.json);
Prism.languages.yaml = {
	scalar: {
		pattern: /([\-:]\s*(![^\s]+)?[ \t]*[|>])[ \t]*(?:((?:\r?\n|\r)[ \t]+)[^\r\n]+(?:\3[^\r\n]+)*)/,
		lookbehind: !0,
		alias: 'string'
	},
	comment: /#.*/,
	key: {
		pattern: /(\s*(?:^|[:\-,[{\r\n?])[ \t]*(![^\s]+)?[ \t]*)[^\r\n{[\]},#\s]+?(?=\s*:\s)/,
		lookbehind: !0,
		alias: 'atrule'
	},
	directive: {pattern: /(^[ \t]*)%.+/m, lookbehind: !0, alias: 'important'},
	datetime: {
		pattern: /([:\-,[{]\s*(![^\s]+)?[ \t]*)(\d{4}-\d\d?-\d\d?([tT]|[ \t]+)\d\d?:\d{2}:\d{2}(\.\d*)?[ \t]*(Z|[-+]\d\d?(:\d{2})?)?|\d{4}-\d{2}-\d{2}|\d\d?:\d{2}(:\d{2}(\.\d*)?)?)(?=[ \t]*($|,|]|}))/m,
		lookbehind: !0,
		alias: 'number'
	},
	boolean: {
		pattern: /([:\-,[{]\s*(![^\s]+)?[ \t]*)(true|false)[ \t]*(?=$|,|]|})/im,
		lookbehind: !0,
		alias: 'important'
	},
	null: {
		pattern: /([:\-,[{]\s*(![^\s]+)?[ \t]*)(null|~)[ \t]*(?=$|,|]|})/im,
		lookbehind: !0,
		alias: 'important'
	},
	string: {
		pattern: /([:\-,[{]\s*(![^\s]+)?[ \t]*)("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')(?=[ \t]*($|,|]|}))/m,
		lookbehind: !0,
		greedy: !0
	},
	number: {
		pattern: /([:\-,[{]\s*(![^\s]+)?[ \t]*)[+\-]?(0x[\da-f]+|0o[0-7]+|(\d+\.?\d*|\.?\d+)(e[\+\-]?\d+)?|\.inf|\.nan)[ \t]*(?=$|,|]|})/im,
		lookbehind: !0
	},
	tag: /![^\s]+/,
	important: /[&*][\w]+/,
	punctuation: /---|[:[\]{}\-,|>?]|\.\.\./
};
!(function() {
	typeof self !== 'undefined' &&
		self.Prism &&
		self.document &&
		Prism.hooks.add('complete', function(e) {
			if (e.code) {
				const t = e.element.parentNode;
				const s = /\s*\bline-numbers\b\s*/;
				if (
					t &&
					/pre/i.test(t.nodeName) &&
					(s.test(t.className) || s.test(e.element.className)) &&
					!e.element.querySelector('.line-numbers-rows')
				) {
					s.test(e.element.className) &&
						(e.element.className = e.element.className.replace(s, '')),
						s.test(t.className) || (t.className += ' line-numbers');
					let n;
					const a = e.code.match(/\n(?!$)/g);
					const l = a ? a.length + 1 : 1;
					let r = new Array(l + 1);
					(r = r.join('<span></span>')),
						(n = document.createElement('span')),
						n.setAttribute('aria-hidden', 'true'),
						(n.className = 'line-numbers-rows'),
						(n.innerHTML = r),
						t.hasAttribute('data-start') &&
							(t.style.counterReset =
								'linenumber ' +
								(parseInt(t.getAttribute('data-start'), 10) - 1)),
						e.element.appendChild(n);
				}
			}
		});
})();
