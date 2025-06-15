const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "main.js"
    },
    target: "web",
    devServer: {
        static: ["./public"],
        port: "3000",
        proxy: [
            {
                context: ["/server"],
                target: "http://localhost:4000",
                changeOrigin: true,
                secure: false,
                pathRewrite: {"^/server": ""}
            }
        ],
        // open: true,
        hot: true,
        liveReload: true,
    },
    resolve: {
        extensions: [".js", ".jsx", ".json", ".css"]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1
                        }
                    }, 
                    "postcss-loader"]
            }
        ]
    }
}