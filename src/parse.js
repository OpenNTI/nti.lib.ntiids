/**
 * Parses an id and returns an object containing the split portions
 * See http://excelsior.nextthought.com/server-docs/ntiid-structure/
 *
 * @param {string} id ntiid
 * @returns {Object} an object containing the components of the id
 */
export default function parseNTIID(id) {
	let parts = (typeof id !== 'string' ? (id || '').toString() : id).split(
			':'
		),
		authority,
		specific,
		result = {};

	if (parts.length < 3 || parts[0] !== 'tag') {
		//console.warn('"'+id+'" is not an NTIID');
		return null;
	}

	//First part is tag, second is authority, third is specific portion

	//authority gets split by comma into name and date
	authority = parts[1].split(',');
	if (authority.length !== 2) {
		//invalid authority chunk
		return null;
	}

	result.authority = {
		name: authority[0],
		date: authority[1],
	};

	//join any parts after the 2nd into the specific portion that will
	//then be split back out into the specific parts.
	//TODO yank the fragment off the end
	specific = parts.slice(2).join(':');
	specific = specific.split('-');

	result.specific = {
		type: specific.length === 3 ? specific[1] : specific[0],
		typeSpecific: specific.length === 3 ? specific[2] : specific[1],
	};

	//Define a setter on provider property so we can match the ds escaping of '-' to '_'
	Object.defineProperty(result.specific, 'provider', {
		get() {
			return this.$$provider;
		},
		set(p) {
			if (p && p.replace) {
				p = p.replace(/-/g, '_');
			}
			this.$$provider = p;
		},
	});

	result.specific.provider = specific.length === 3 ? specific[0] : null;

	result.toString = function () {
		let m = this,
			a = [m.authority.name, m.authority.date],
			s = [m.specific.provider, m.specific.type, m.specific.typeSpecific];
		if (!m.specific.provider) {
			s.splice(0, 1);
		}

		return ['tag', a.join(','), s.join('-')].join(':');
	};

	//FIXME include authority?
	result.toURLSuffix = function () {
		//#!html/mathcounts/mathcounts2013.warm_up_7
		let m = this,
			components = [];

		components.push(m.specific.type);
		if (m.specific.provider) {
			components.push(m.specific.provider);
		}
		components.push(m.specific.typeSpecific);

		return '#!' + components.map(encodeURIComponent).join('/');
	};

	return result;
}
