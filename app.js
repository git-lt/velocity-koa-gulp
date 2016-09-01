'use strict';

require("babel-register");
require('babel-polyfill');

var koa = require('koa');
var path = require('path');
var logger = require('koa-logger');
var staticServer = require('koa-static');
var onerror = require('koa-onerror');
var webRouter = require('./router.web');

var app = koa();

app
	.use(logger())
	.use(staticServer(__dirname + '/'))
	.use(webRouter().routes());

onerror(app);

app.listen(3010, function () {
    console.log("Server running at 3010, please open http://127.0.0.1:3010");
});

module.exports = app;
