import {
	PropType,
	parseNTIID,
	ntiidEquals,
	isNTIID,
	escapeId,
	encodeForURI,
	decodeFromURI
} from '../index';

const ROOT = 'tag:nextthought.com,2011-10:Root';
const SOME_ASSIGNMENT = 'tag:nextthought.com,2011-10:NTIAlpha-NAQ-NTI1000_TestCourse.naq.asg.assignment:content_essay';
const SOME_NAMED = 'tag:nextthought.com,2011-10:NTI-NTICourseOutlineNode-Fall2015_BIOL_2124_SubInstances_023.0';
const SOME_ENTITY = 'tag:nextthought.com,2011-10:system-NamedEntity:Community-ou.nextthought.com';
const SOME_OID = 'tag:nextthought.com,2011-10:system-OID-0x0c2b97:5573657273:yApwFmaJ4a1';
const SOME_COURSEINST = 'tag:nextthought.com,2011-10:system-OID-0x317ef2:5573657273:KnXf1MmK2VB';
const SOME_CATALOG_ENTRY = 'tag:nextthought.com,2011-10:NTI-CourseInfo-Alpha_NTI_1000';
const SOME_SYSTEM_CREATED_GRADE = 'tag:nextthought.com,2011-10:system-OID-0x32aa9a:5573657273:fSnNHAzMPbc';
const SOME_USER_UPDATED_GRADE = 'tag:nextthought.com,2011-10:test.instructor@nextthought.com-OID-0x32aa9a:5573657273:fSnNHAzMPbc';

const IDS = [ROOT, SOME_ASSIGNMENT, SOME_NAMED, SOME_ENTITY, SOME_OID, SOME_COURSEINST, SOME_CATALOG_ENTRY];

describe('NTIID Tests', ()=> {

	it('PropType validates NTIIDs', () => {
		const ComponentName = 'UnitTest';
		const propName = 'prop';
		let props = {};
		const message = () => `"${props[propName]}" is not a invalid NTIID (${propName} on ${ComponentName})`;

		expect(()=> PropType(props, propName, ComponentName)).not.toThrow();
		expect(()=> PropType.isRequired(props, propName, ComponentName)).toThrowError(message());

		props[propName] = 'foo';

		expect(()=> PropType(props, propName, ComponentName)).toThrowError(message());
		expect(()=> PropType.isRequired(props, propName, ComponentName)).toThrowError(message());


		props[propName] = '';

		expect(()=> PropType(props, propName, ComponentName)).toThrowError(message());
		expect(()=> PropType.isRequired(props, propName, ComponentName)).toThrowError(message());

		for (let id of IDS) {
			props[propName] = id;

			expect(()=> PropType(props, propName, ComponentName)).not.toThrow();
			expect(()=> PropType.isRequired(props, propName, ComponentName)).not.toThrow();
		}
	});


	it('identify ids', () => {

		for (let id of IDS) {
			expect(isNTIID(id)).toBeTruthy();
		}

		expect(isNTIID('')).toBeFalsy();
		expect(isNTIID('junk')).toBeFalsy();
		expect(isNTIID('lala')).toBeFalsy();
		expect(isNTIID('nextthought.com')).toBeFalsy();
	});


	it('encode/decode for/from uri should produce the same string', () => {

		for (let id of IDS) {
			expect(decodeFromURI(encodeForURI(id))).toBe(id);
		}

		for (let bad of ['junk', 'fooboo']) {
			expect(() => decodeFromURI(encodeForURI(bad))).toThrowError('Invalid NTIID');
		}

	});


	it('ntiidEquals compares ids (can ignore SpecificProvider)', () => {
		const A = SOME_SYSTEM_CREATED_GRADE;
		const B = SOME_USER_UPDATED_GRADE;

		expect(ntiidEquals(A, B)).toBeTruthy();
		expect(ntiidEquals(A, A)).toBeTruthy();
		expect(ntiidEquals(B, B)).toBeTruthy();

		//not ignoring...
		expect(ntiidEquals(A, B, false)).toBeFalsy();
		expect(ntiidEquals(A, A, false)).toBeTruthy();
		expect(ntiidEquals(B, B, false)).toBeTruthy();

	});


	it('escapeId', ()=> {
		const expected = 'tag\\3a nextthought\\2e com\\2c 2011-10\\3a system-OID-0x0c2b97\\3a 5573657273\\3a yApwFmaJ4a1';
		const result = escapeId('tag:nextthought.com,2011-10:system-OID-0x0c2b97:5573657273:yApwFmaJ4a1');

		expect(result).toBe(expected);
	});


	it('parseNTIID should produce an object if its an NTIID', () => {

		for (let id of IDS) {
			expect(typeof parseNTIID(id)).toBe('object');
		}

		//TODO: perform deeper validation

		expect(parseNTIID('foo')).toBeFalsy();
	});
});
