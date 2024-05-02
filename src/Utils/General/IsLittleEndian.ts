import {type Endianness} from '../../Types/AudioTypes';

import {endianness} from 'os';

export function isLittleEndian(type: Endianness = endianness()): boolean {
	return type === 'LE';
}
