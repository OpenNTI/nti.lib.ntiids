import { COMMON_PREFIX, HREF_SPECIFIC_TYPE } from './constants';
import parseNTIID from './parse';

const { atob, btoa } = global;

export function encodeIdFrom(href) {
	try {
		const id = encodeURIComponent(btoa(href));
		return `${COMMON_PREFIX}${HREF_SPECIFIC_TYPE}-${id}`;
	} catch (e) {
		console.error('Missing polyfill for btoa'); //eslint-disable-line no-console
		throw e;
	}
}

export function isHrefId(id) {
	const parsed = parseNTIID(id);
	return parsed && parsed.specific.type === HREF_SPECIFIC_TYPE;
}

export function decodeHrefFrom(id) {
	const { specific: data } = parseNTIID(id) || {};
	if (!data) {
		return null;
	}

	const { typeSpecific } = data;
	try {
		return atob(decodeURIComponent(typeSpecific));
	} catch (e) {
		console.error('Missing polyfill for atob'); //eslint-disable-line no-console
		throw e;
	}
}
