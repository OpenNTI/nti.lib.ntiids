/* eslint-env jest */
import parseNTIID from '../parse.js';

const ROOT = 'tag:nextthought.com,2011-10:Root';
const SOME_ASSIGNMENT =
	'tag:nextthought.com,2011-10:NTIAlpha-NAQ-NTI1000_TestCourse.naq.asg.assignment:content_essay';
const SOME_NAMED =
	'tag:nextthought.com,2011-10:NTI-NTICourseOutlineNode-Fall2015_BIOL_2124_SubInstances_023.0';
const SOME_ENTITY =
	'tag:nextthought.com,2011-10:system-NamedEntity:Community-ou.nextthought.com';
const SOME_OID =
	'tag:nextthought.com,2011-10:system-OID-0x0c2b97:5573657273:yApwFmaJ4a1';
const SOME_COURSEINST =
	'tag:nextthought.com,2011-10:system-OID-0x317ef2:5573657273:KnXf1MmK2VB';
const SOME_CATALOG_ENTRY =
	'tag:nextthought.com,2011-10:NTI-CourseInfo-Alpha_NTI_1000';

const IDS = [
	ROOT,
	SOME_ASSIGNMENT,
	SOME_NAMED,
	SOME_ENTITY,
	SOME_OID,
	SOME_COURSEINST,
	SOME_CATALOG_ENTRY,
];

describe('NTIID Tests', () => {
	test('parseNTIID should produce an object if its an NTIID', () => {
		for (let id of IDS) {
			expect(typeof parseNTIID(id)).toBe('object');
		}

		//TODO: perform deeper validation

		expect(parseNTIID('foo')).toBeFalsy();
	});
});
