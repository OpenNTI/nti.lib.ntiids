import { Base64 } from 'js-base64';

import { COMMON_PREFIX, HREF_SPECIFIC_TYPE } from './constants';
import parseNTIID from './parse';

export function encodeIdFrom(href) {
	const id = encodeURIComponent(Base64.encode(href));
	return `${COMMON_PREFIX}${HREF_SPECIFIC_TYPE}-${id}`;
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

	return Base64.decode(decodeURIComponent(typeSpecific));
}
