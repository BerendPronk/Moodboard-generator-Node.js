// Bepaal de modules
var express = require('express');						// Het framework waar de applicatie voornamelijk op draait
var session = require('express-session');				// Maakt sessies mogelijk, zodat gebruikers niet iedere keer in hoeven te loggen
var multer = require('multer');							// Biedt mogelijkheid om bestanden aan de request toe te voegen
var fs = require('fs');									// 
var path = require('path');								// Hiermee kan functies uitoefenen op de file-paths
var bodyParser = require('body-parser');				// Middleware om POST requests mogelijk te maken 
var mysql = require('mysql');							// Zorgt dat de applicatie gelinkt kan worden met een database
var myConnection = require('express-myconnection'); 	// Zorgt dat de applicatie gebruik kan maken van de MSQL-connectie
var app = express();									// Sla de express-functie op in variabele voor gemak

// MySQL connectie
app.use(myConnection(mysql, {
	host: '127.0.0.1',
	user: 'root',
	password: '!1MeoW0)',
	database: 'serverside_scripting_eindopdracht',
	port: 3306
}, 'single'));

// Bepaal de routers
var profileRoutes = require('./routes/profile');
var boardRoutes = require('./routes/board');
var errorRoutes = require('./routes/error');

// Zorg dat statische bestanden (CSS, etc.) geladen kunnen worden
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));

// Setup multer met verwijzing naar de upload map
var upload = multer({dest: 'public/uploads/'});

// Bepaal de view-engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Activeer de sessie module
app.use(session({
	secret: 'qwsawedserfdrtgftyhgyujhuikjiolk',
	saveUninitialized: true,
	resave: false
}));

// Setup van de routing
app.use('/profile', profileRoutes);
app.use('/board', upload.single('bs-file'), boardRoutes);

// De index pagina die op 'localhost:3000' wordt weergegeven
app.get('/', function(req, res) {
	res.render('index', {
		feedback: false
	});
});

// Error handling als er een verkeerde URL is ingevoerd
app.use(errorRoutes);

// Start de server
app.listen(3000, function(){
	console.log('Started!');
});