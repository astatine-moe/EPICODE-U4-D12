//built in modules
const http = require("http"),
    path = require("path");

//npm modules
const dotenv = require("dotenv"),
    express = require("express"),
    morgan = require("morgan"),
    bodyParser = require("body-parser"),
    cors = require("cors"),
    expressListRoutes = require("express-list-routes");

//local modules
const database = require("./database");
const { walk } = require("./util");
const {
    badRequestHandler,
    notFoundHandler,
    genericErrorHandler,
} = require("./err");

//init environmental variables
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(cors());

const start = async () => {
    server.listen(process.env.PORT);

    for await (const p of walk("./routes/")) {
        const route = require(path.resolve(__dirname, p));
        const dirs = p.split("\\");
        dirs.shift(); //remove base dir
        const fileName = dirs.pop(); //get filename;
        let routeName;
        if (fileName === "index.js") {
            routeName = `/${dirs.join("/")}`;
        } else {
            routeName = `/${dirs.join("/")}/${fileName.replace(".js", "")}`;
        }

        app.use(routeName, route);

        console.log(`Loaded route ${routeName}`);
    }

    app.use(badRequestHandler);
    app.use(notFoundHandler);
    app.use(genericErrorHandler);

    console.table(expressListRoutes(app));
    console.log(`http://127.0.0.1:${process.env.PORT}`);
};

let wait = setInterval(() => {
    const isConnected = database.hasEstablishedConnection();

    if (isConnected) {
        clearInterval(wait);
        start();
    }
}, 1000);

database.connect();
