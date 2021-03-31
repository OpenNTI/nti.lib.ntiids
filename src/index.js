import { COMMON_PREFIX } from './constants.js';
import parseNTIID from './parse.js';

export * from './constants.js';
export * as HREF from './href.js';
export { parseNTIID };

export function PropType(props, propName, ComponentName) {
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
		throw new Error(
			`"${props[propName]}" is not a invalid NTIID (${propName} on ${ComponentName})`
		);
	}
};

function normalizeSpecificProvider(id) {
	const o = parseNTIID(id);
	if (!o) {
		return id;
	}

	o.specific.provider = 'system';
	return o.toString();
}

export function ntiidEquals(a, b, ignoreSpecificProvider = true) {
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

export function isNTIID(id) {
	return Boolean(parseNTIID(id));
}

/**
 * CSS escape ids
 * @param {string} id ntiid
 * @returns {string} CSS-friendly string to use in a selector
 */
export function escapeId(id) {
	return id
		.replace(/:/g, '\\3a ') //no colons
		.replace(/,/g, '\\2c ') //no commas
		.replace(/\./g, '\\2e '); //no periods
}

/**
 * Returns the prefix of the content ntiid we think this ntiid would reside beneath
 * WARNING: Do not USE!!
 * XXX: This is only here because the WebApp uses this. The prefix is not safe.
 * @deprecated
 * @param {string} id ntiid
 * @returns {string} prefix
 */
export function ntiidPrefix(id) {
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
export function parseFragment(fragment) {
	const isEmpty = s => s == null || s.length === 0;
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

encodeForURI.sloppy = id => encodeForURI(id, false);
export function encodeForURI(ntiid, strict = true) {
	const { length: cut } = COMMON_PREFIX;

	if (ntiid && ntiid.substr(0, cut) === COMMON_PREFIX) {
		ntiid = ntiid.substr(cut);
	} else if (!isNTIID(ntiid) && strict) {
		throw new Error('Invalid NTIID');
	}

	return encodeURIComponent(ntiid);
}

export function decodeFromURI(component) {
	if (typeof component !== 'string' || !component) {
		return null;
	}

	let ntiid = decodeURIComponent(component);

	if (!isNTIID(ntiid) && ntiid.substr(0, 3) !== 'tag' && ntiid.length > 0) {
		ntiid = COMMON_PREFIX + ntiid;
	}

	return ntiid;
}
