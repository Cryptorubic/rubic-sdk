module.exports = {
    root: true,
    ignorePatterns: ['**/*.js'],
    overrides: [
        {
            files: ['src/**/*.ts', 'test/**/*.ts', 'e2e/**/*.ts'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
                createDefaultProgram: true
            },
            plugins: [
                '@typescript-eslint',
                'unused-imports'
            ],
            extends: [
                'airbnb-typescript/base',
                'plugin:prettier/recommended',
                'prettier'
            ],
            rules: {
                'import/prefer-default-export': 'off',
                '@typescript-eslint/no-useless-constructor': 'off',
                'no-plusplus': 'off',
                'class-method-use-this': 'off',
                'no-underscore-dangle': 'off',
                'no-inferrable-types': 'off',
                '@typescript-eslint/no-explicit-any': 2,
                'unused-imports/no-unused-imports': 'error',
                'unused-imports/no-unused-vars': [
                    'error',
                    {
                        vars: 'all',
                        args: 'all',
                        ignoreRestSiblings: false,
                        argsIgnorePattern: '^_'
                    }
                ],
                '@typescript-eslint/no-inferrable-types': 'off',
                'class-methods-use-this': 'off',
                complexity: ['error', 20],
                eqeqeq: ['error', 'smart'],
                'no-magic-numbers': 'off',
                '@typescript-eslint/no-magic-numbers': [
                    'warn',
                    {
                        ignore: [-1, 0, 1, 2, 3, 10, 100, 1000, 16, 64, 256],
                        detectObjects: true,
                        ignoreReadonlyClassProperties: true
                    }
                ],
                '@typescript-eslint/naming-convention': [
                    'error',
                    {
                        selector: 'enumMember',
                        format: ['UPPER_CASE']
                    }
                ],
                'no-empty': ['error', { 'allowEmptyCatch': true }],
                // Styling.
                'array-bracket-spacing': ['error', 'never'],
                'object-curly-spacing': ['error', 'always'],
                indent: 'off',
                'comma-dangle': 'off',
                '@typescript-eslint/comma-dangle': ['error', 'never'],
                // Temporary rules. Remove after full refactoring.
                'import/no-extraneous-dependencies': 'off',
                '@typescript-eslint/dot-notation': 'off',
                'no-restricted-globals': 'off',
                '@typescript-eslint/no-empty-function': 'off',
                'no-param-reassign': 'off',
                // Temporary rules. Remove as fast as it can be.
                'max-classes-per-file': 'off',
                radix: ['warn', 'as-needed'],
                'no-prototype-builtins': 'off',
                'no-return-assign': 'off',
                'no-restricted-syntax': [
                    'error',
                    'LabeledStatement',
                    'WithStatement'
                ],
                'no-console': [
                    'warn',
                    {
                        allow: ['debug', 'error', 'info']
                    }
                ],
                'import/export': 0,
                '@typescript-eslint/no-shadow': 'off',
                '@typescript-eslint/return-await': 'off'
            }
        }
    ]
};
