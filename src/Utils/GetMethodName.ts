import {type BitDepth} from '../Types/AudioTypes';

export function getMethodName(bitDepth: BitDepth): `Int${BitDepth}` {
	return `Int${bitDepth}`;
}
