const path = require('path');

module.exports = {
    entry: {
        domWithStyles: path.resolve(__dirname, './src/index.js')
    },
    output: {
        library: '[name]',
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        sourceType: "unambiguous",
                        presets: ["@babel/preset-env"],
                        plugins: ["@babel/plugin-transform-runtime"]
                    },
                },
            }
        ]
    }
};