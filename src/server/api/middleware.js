import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import flash from "connect-flash/lib";

export let middleware = express();

middleware.use(express.static('public'));
middleware.use(bodyParser.json());
middleware.use(bodyParser.urlencoded({extended: true}));
middleware.use(cookieParser());
middleware.use(flash());
