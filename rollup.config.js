import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';

const name = pkg.name
	.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
	.replace(/^\w/, m => m.toUpperCase())
	.replace(/-\w/g, m => m[1].toUpperCase());

export default [
	{
		input: 'src/svelte/index.js',
		output: [
			{ file: pkg.module, 'format': 'es' },
			{ file: pkg.main, 'format': 'umd', name }
		],
		plugins: [
			svelte(),
			resolve()
		]
	},
	
	{
		input: 'src/svelte/index.js',
		output: [
			{ file: pkg.custom_module, 'format': 'es' },
			{ file: pkg.custom_main, 'format': 'umd', name }
		],
		plugins: [
			svelte({customElement: true,tag: "sidebar-swipe"}),
			resolve()
		]
	},
];
