const path = require("path");
module.exports = {
    parser: "@typescript-eslint/parser", // Specifies the ESLint parser
    plugins: [
        "@typescript-eslint",
    ],
    env: {
        browser: true,
        es6: true,
        jest: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
    ],
    settings: {
        react: {
            "version": "detect", // Autodetect React version
        }
    },
    /*
    parserOptions: {
        project: path.resolve(__dirname, "./tsconfig.json"),
        tsconfigRootDir: __dirname,
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: "module", // Allows for the use of imports
    },
    */
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        
        "@typescript-eslint/explicit-function-return-type": 1,
        "@typescript-eslint/interface-name-prefix": 0,
        "@typescript-eslint/no-empty-function": 0,
        "@typescript-eslint/no-unused-vars": [ 1, { "argsIgnorePattern": "^_" } ],  // allows unused parameters if they're prefixed with underscore
        "@typescript-eslint/no-use-before-define": 0,
        "@typescript-eslint/no-var-requires": 0,

        "react/jsx-indent": 1,
        "react/jsx-indent-props": [ 1, "first" ],
        "react/prop-types": 0,
        "react/no-unescaped-entities": 0,

        "array-bracket-spacing": [ 1, "always" ],
        "comma-dangle": [ 1, "never" ],
        "indent": [ 1, 4, { 
            "ignoredNodes": ["JSXElement *", "JSXElement"],    // ignoredNodes prevents clashing with react/jsx-indent-props
            "SwitchCase": 1
        } ],
        "key-spacing": [ 1, { "afterColon": true, "beforeColon": false }],
        "no-debugger": 0,
        "no-trailing-spaces": 1,
        "object-curly-spacing": [ 1, "always" ],
        "quotes": 1,
        "semi": [ 1, "always" ],
        "space-in-parens": [ 1, "always", { "exceptions": [ "{}" ] }]
    },
};
