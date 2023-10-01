module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            'module:metro-react-native-babel-preset',
            "babel-preset-expo"
        ],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./src'],
                    extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                    alias: {
                        tests: ['./tests/'],
                        "@components": "./components",
                    }
                }
            ],
            [
                "react-native-reanimated/plugin"
            ],
            [
                "module:react-native-dotenv",
                {
                    moduleName: "@env",
                    path: ".env",
                }
            ]
        ]
    }
};
