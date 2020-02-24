import express from "express";
import {PORT} from "./src/constants";
import {middleware} from "./src/server/api/middleware";
import {auth} from "./src/server/api/auth";
import {common} from "./src/server/api/util";

let app = express();

app.use(middleware);
app.use(auth);
app.use(common);

export const server = app.listen(PORT);

console.log("SERVER STARTED");
