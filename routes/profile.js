var express = require('express');
var router = express.Router();

// [GET] /profile
router.get('/', function(req, res){
    // Kijkt of gebruiker in de sessie is opgeslagen, verwijst anders door naar de login
    if(req.session.username){
        req.getConnection(function(err, connection){
            connection.query('SELECT ID FROM users WHERE username = ?', [req.session.username], function(err, result) {
                res.render('profile/index', {
                    title: 'Ingelogd als, ' + req.session.username,
                    feedback: false,
                    state: false,
                    ID: result[0].ID
                });    
            });
        });
    } else {
        res.redirect('/profile/login');
    }
});

// [GET] /profile/login
router.get('/login', function(req, res){
    res.render('profile/login', {
        postUrl: '/profile/login', // wordt gebruikt door de body-parser voor een post-request
        feedback: false,
        state: false
    });
});

// [POST] /profile/login
router.post('/login', function(req, res){
    // Variabelen die zijn ingevoerd in login als object opgeslagen
    var data = {
        username: req.body.username,
        password: req.body.password
    };
    req.getConnection(function(err, connection){
        connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [data.username, data.password], function(err, result) {
            // Verwijs naar /board bij bestaande inlog of als query overeenkomt. Geeft anders feedback dat login niet klopt
            if (req.session.username) {         
                res.redirect('/board');
            } else if (result.length > 0) {
                req.session.username = result[0].username; // Zet de username als sessie
                res.redirect('/board');
            } else {
                res.render('profile/login', {
                    postUrl: '/profile/login',
                    feedback: 'Gebruikersnaam en/of wachtwoord onjuist.',
                    state: 'negative'
                });
            }
        });
    });
});

// [GET] /profile/register
router.get('/register', function(req, res) {
    res.render('profile/register', {
        postUrl: '/profile/register',
        feedback: false,
        state: false
    });
});

// [POST] /profile/register
router.post('/register', function(req, res) {
    req.getConnection(function(err, connection){
        var data = {
            username: req.body.username,
            password: req.body.password
        };
        var passwordCopy = req.body.passwordcopy;

        connection.query('SELECT * FROM users WHERE username = ?', [data.username], function(err, result) {
            // Kijk in database of gebruikersnaam al bestaat, geef feedback als het al bestaat
            if (result.length > 0) {
                res.render('profile/register', {
                    postUrl: '/profile/register',
                    feedback: 'Deze gebruikersnaam bestaat al.',
                    state: 'negative'
                });
            } else {
                // Kijkt of de ingevulde wachtwoorden overeenkomen, geeft anders feedback erover
                if (data.password === passwordCopy) {
                    // Kijkt of de nieuwe gegevens niet leeg zijn en voert de volgende query uit, indien de logische statement klopt.
                    if (data.username != '' && data.password != '') {
                        connection.query('INSERT INTO users SET ?', [data], function(err, result) {
                            res.render('index', {
                                feedback: 'U bent succesvol geregistreerd!',
                                state: 'positive'
                            });
                        });
                    } else {
                        res.render('profile/register', {
                            postUrl: '/profile/register',
                            feedback: 'Gebruikernaam en/of wachtwoord niet ingevuld.',
                            state: 'negative'
                        });
                    }
                } else {
                    res.render('profile/register', {
                        postUrl: '/profile/register',
                        feedback: 'De door u ingevulde wachtwoorden kwamen niet overeen.',
                        state: 'negative'
                    });
                }
            }
        });
    });
});
 
// [GET] /profile/edit
router.get('/edit/:index', function(req, res) {
    req.getConnection(function(err, connection){
        connection.query('SELECT * FROM users WHERE ID = ?', [req.params.index], function(err, result) {
            // Query kijkt of het getal achter /edit/ overeenkomt met een ID uit de database, gebruikt vervolgens hetzelfde getal in de postUrl
            if(result.length > 0) {
                res.locals.feedback = false;
                res.locals.state = false;
                res.locals.user = result[0];
                res.locals.postUrl = '/profile/edit/' + result[0].ID;
            } else {
                res.locals.feedback = 'Gebruiker niet gevonden.';
                res.locals.state = 'negative';
            }
            res.render('profile/edit');
        });
    });
});

// [POST] /profile/edit
router.post('/edit/:index', function(req, res) {
    req.getConnection(function(err, connection){
        var data = {
            username: req.body.username,
            password: req.body.password
        };
        // Kijkt of er wel nieuwe data is ingevuld
        if (data.username != '' && data.password != '') {
            // Pas ingevulde gegevens aan bij betreffende ID in database
            connection.query('UPDATE users SET ? WHERE id = ?', [data, req.params.index], function(err, result) {});
            
            // Selecteer benodigde gegevens en laad de overzichtspagina weer in
            connection.query('SELECT * FROM users WHERE username = ?', [req.session.username], function(err, result) {
                res.render('profile/index', {
                    title: 'Ingelogd als, ' + req.session.username,
                    postUrl: '/profile',
                    feedback: 'Uw account is succesvol gewijzigd.',
                    state: 'positive',
                    ID: result[0].ID
                });
            });
        } else {
            // Verwijst naar dezelfde pagina een geeft feedback dat één of meerdere velden niet zijn ingevuld
            connection.query('SELECT * FROM users WHERE ID = ?', [req.params.index], function(err, result) {
                res.locals.user = result[0];
                res.locals.postUrl = '/profile/edit/' + req.params.index;
                res.render('profile/edit', {
                    feedback: 'Gebruikernaam en/of wachtwoord niet ingevuld.',
                    state: 'negative'
                });
            });
        }
    });
});

// [GET] /profile/logout
router.get('/logout', function(req, res){
    // Haalt de huidige gebruiker uit de sessie, zodat het mogelijk is om met een ander account in te loggen
    req.session.destroy();
    res.render('index', {
        feedback: 'U bent succesvol uitgelogd!',
        state: 'positive'
    });
});

module.exports = router;