import type {Config} from 'jest';

const config: Config = {
	clearMocks: true,

	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageProvider: 'v8',

	roots: [
		'./tests/**',
	],

	transform: {
		// eslint-disable-next-line
		'^.+\\.ts?$': 'ts-jest',
	},

	verbose: true,
};

export default config;
