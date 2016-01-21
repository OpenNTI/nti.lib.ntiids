import isEmpty from 'fbjs/lib/isEmpty';


const COMMON_PREFIX = 'tag:nextthought.com,2011-10:';


export function PropType (props, propName, ComponentName) {
	try {
		PropType.isRequired(props, propName, ComponentName);
	} catch (e) {
		if (props[propName] != null) {
			throw e;
		}
	}
}

PropType.isRequired = function (props, propName, ComponentName) {
	if (!isNTIID(props[propName])) {
		throw new Error(`"${props[propName]}" is not a invalid NTIID (${propName} on ${ComponentName})`);
	}
};



/**
 * Parses an id and returns an object containing the split portions
 * See http://excelsior.nextthought.com/server-docs/ntiid-structure/
 *
 * @param {string} id ntiid
 * @returns {object} an object containing the components of the id
 */
export function parseNTIID (id) {
	let parts = (typeof id !== 'string' ? (id || '').toString() : id).split(':'),
		authority, specific,
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
		date: authority[1]
	};

	//join any parts after the 2nd into the specific portion that will
	//then be split back out into the specific parts.
	//TODO yank the fragment off the end
	specific = parts.slice(2).join(':');
	specific = specific.split('-');

	result.specific = {
		type: specific.length === 3 ? specific[1] : specific[0],
		typeSpecific: specific.length === 3 ? specific[2] : specific[1]
	};

	//Define a setter on provider property so we can match the ds escaping of '-' to '_'
	Object.defineProperty(result.specific, 'provider', {
		get () { return this.$$provider; },
		set (p) {
			if (p && p.replace) {
				p = p.replace(/-/g, '_');
			}
			this.$$provider = p;
		}
	});

	result.specific.provider = specific.length === 3 ? specific[0] : null;

	result.toString = function () {
		let m = this,
			a = [
				m.authority.name,
				m.authority.date
			],
			s = [
				m.specific.provider,
				m.specific.type,
				m.specific.typeSpecific
			];
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


function normalizeSpecificProvider (id) {
	const o = parseNTIID(id);
	if (!o) {
		return id;
	}

	o.specific.provider = 'system';
	return o.toString();
}


export function ntiidEquals (a, b, ignoreSpecificProvider = true) {
	if (a === b) {
		return true;
	}

	if (!ignoreSpecificProvider) {
		return false;
	}

	try {
		const idA = normalizeSpecificProvider(a);
		const idB = normalizeSpecificProvider(b);

		return idA === idB;

	} catch (e) {
		return false;
	}
}


export function isNTIID (id) {
	return Boolean(parseNTIID(id));
}


/**
 * CSS escape ids
 * @param {string} id ntiid
 * @returns {string} CSS-friendly string to use in a selector
 */
export function escapeId (id) {
	return id.replace(/:/g, '\\3a ') //no colons
			.replace(/,/g, '\\2c ')//no commas
			.replace(/\./g, '\\2e ');//no periods
}


/**
 * Returns the prefix of the content ntiid we think this ntiid would reside beneath
 * WARNING: Do not USE!!
 * XXX: This is only here because the WebApp uses this. The prefix is not safe.
 * @deprecated
 * @param {string} id ntiid
 * @returns {string} prefix
 */
export function ntiidPrefix (id) {
	let ntiid = parseNTIID(id);
	if (ntiid) {
		ntiid.specific.type = 'HTML';
		ntiid.specific.typeSpecific = ntiid.specific.typeSpecific.split('.')[0];
	}
	return ntiid && ntiid.toString();
}


/**
 * Parse the "URL friendly" NTIID we made for the legacy webapp.
 * @deprecated
 * @param {stirng} fragment The string from the url fragement
 * @returns {string} NTIID
 */
export function parseFragment (fragment) {
	const authority = 'nextthought.com,2011-10';

	if (isEmpty(fragment) || fragment.indexOf('#!') !== 0) {
		return null;
	}

	fragment = fragment.slice(2);

	const parts = fragment.split('/');
	if (parts.length < 2 || parts.length > 3) {
		return null;
	}

	const type = parts[0];
	const provider = parts.length === 3 ? parts[1] : '';
	const typeSpecific = parts.length === 3 ? parts[2] : parts[1];

	const s = [provider, type, typeSpecific].map(decodeURIComponent);
	if (isEmpty(provider)) {
		s.splice(0, 1);
	}

	return ['tag', authority, s.join('-')].join(':');
}


export function encodeForURI (ntiid) {
	let cut = COMMON_PREFIX.length;
	if (ntiid && ntiid.substr(0, cut) === COMMON_PREFIX) {
		ntiid = ntiid.substr(cut);
	} else if(!isNTIID(ntiid)) {
		throw new Error('Invalid NTIID');
	}

	return encodeURIComponent(ntiid);
}


export function decodeFromURI (component) {
	let ntiid = decodeURIComponent(component);

	if (!isNTIID(ntiid) && ntiid.substr(0, 3) !== 'tag' && ntiid.length > 0) {
		ntiid = COMMON_PREFIX + ntiid;
	}

	return ntiid;
}
