import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends('next/core-web-vitals', 'next/typescript'),
	{
		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
			'react/no-unescaped-entities': 'off',
			'@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
			'react/no-unknown-property': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@next/next/no-img-element': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'react-hooks/exhaustive-deps': 'off',
			'react-hooks/rules-of-hooks': 'off',
		},
	},
];

export default eslintConfig;
