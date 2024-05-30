import {type IntType, type BitDepth} from '../../Types/AudioTypes';

export function getMethodName(bitDepth: BitDepth, isUnsigned?: boolean): `${IntType}${BitDepth}` {
	return `${isUnsigned ? 'Uint' : 'Int'}${bitDepth}`;
}
