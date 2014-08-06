/**
 * IFTTT to NodeJS
 *
 * Use this little Node app to have a node server running which can be accessed
 * by IFTTT's WordPress action. I needed this to have an easy way of using IFTTT
 * to communicate with my Raspberry PI.
 *
 * Credits for the idea of faking the Wordpress XML RPC API as customizable
 * IFTTT backend go to https://github.com/captn3m0/ifttt-webhook
 *
 */
var express = require('express');
var xmlparser = require('express-xml-bodyparser');
var bunyan = require('bunyan');

var helper = require('./modules/helper');

helper.printStartupHeader();

var pluginManager = require('./modules/plugin-manager');
var parameterExtractor = require('./modules/parameter-extractor').extractParameters;
var responseGenerator = require('./modules/response-generator');
var xmlRpcApiHandler = require('./modules/xml-rpc-api-handler');

var config = require('./config.js').getConfig();

var log = bunyan.createLogger({name: 'IFTTN'});
var app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(xmlparser());

helper.setLogger(log);
helper.checkDefaultCredentials();

pluginManager.setLogger(log);
pluginManager.loadPlugins();

xmlRpcApiHandler.setLogger(log);
xmlRpcApiHandler.setPluginManager(pluginManager);

app.post('/xmlrpc.php', function(req, res, next){
	log.info('XMLRPC API request received');
	log.info(req.rawBody);

	var methodName = req.body.methodcall.methodname[0];

	log.info('Method Name: %s', methodName);

	xmlRpcApiHandler.handleMethod(methodName, req, res);
});

var server = app.listen(1337, function() {
	log.info('Listening on port %d', server.address().port);
});
