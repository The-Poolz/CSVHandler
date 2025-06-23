import {terser} from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default [
    {
        input: 'src/index.ts',
        output: {
            file: "dist/index.js",
            format: 'es',
            plugins: [
                terser({
                    ecma: 2020,
                    mangle: { toplevel: true },
                    compress: {
                        module: true,
                        toplevel: true,
                        unsafe_arrows: true,
                    },
                    output: { quote_style: 1 }
                })
            ]
        },
        plugins: [typescript({declaration: true, declarationDir: 'dist', outDir: 'dist'})]
    }
]
