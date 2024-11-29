import globals from 'globals';
import tseslint from 'typescript-eslint';
import xoTypeScript from 'eslint-config-xo-typescript';

export default [
	{files: ['**/*.{js,mjs,cjs,ts}']},
	{files: ['**/*.js'], languageOptions: {sourceType: 'script'}},
	{languageOptions: {globals: globals.node}},
	{ignores: ['node_modules', 'dist', 'eslint.config.mjs']},
	...tseslint.configs.recommended,
	...xoTypeScript,
	{rules: {
		'@typescript-eslint/no-unsafe-call': 'off',
		'@typescript-eslint/no-unsafe-argument': 'off',
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'@typescript-eslint/no-unsafe-return': 'off',
		'@typescript-eslint/restrict-plus-operands': 'off',
	}}
];
