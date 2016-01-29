var express = require('express');
var fs = require('fs');
var router = express.Router();

// [GET] /board
router.get('/', function(req, res){
    // Kijkt of er een gebruiker in de sessie staat, verwijst anders door naar het loginscherm
    if(req.session.username){
        req.getConnection(function(err, connection){
            // Join twee tabellen uit de database om de images van de desbetreffende gebruiker weer te geven
            connection.query('SELECT username, user_ID, image_ID, image_path FROM users LEFT JOIN images ON images.user_ID = users.ID WHERE username = ?', [req.session.username], function(err, result) {
                res.locals.images = result; // Zorgt dat 'images' op de /board/index gebruikt kan worden als array voor de loop
                res.render('board/index', {
                    feedback: false,
                    state: false,
                    user: result[0].username
                });    
            });
        });
    } else {
        res.redirect('/profile/login');
    }

    // Leest de bestanden uit de public/uploads map (de images van de gebruiker)
    fs.readdir('public/uploads', function(err, files) {
        if (err) return next(err);
        res.locals.files = files;
    });
});

// [GET] /upload
router.get('/upload', function(req, res) {
    res.locals.req = req;
    res.render('upload');
});

// [POST] /upload
router.post('/upload', function(req, res) {
    // Zorg dat file de naam krijgt zoals het is geüpload
    if(req.file !== undefined) {
        fs.rename(req.file.path, req.file.destination + req.file.originalname, function(err) {
            if(err) return next(err);
        });
    };
    req.getConnection(function(err, connection){
        connection.query('INSERT INTO images (user_ID, image_path) VALUES ((SELECT ID FROM users WHERE username = ?), ?);', [req.session.username, req.file.originalname], function(err, result) {
            
             connection.query('SELECT username, user_ID, image_ID, image_path FROM users LEFT JOIN images ON images.user_ID = users.ID WHERE username = ?', [req.session.username], function(err, imageList) {
                res.locals.images = imageList;
                res.render('board', {
                    feedback: 'Afbeelding toegevoegd!',
                    state: 'positive',
                    user: req.session.username
                });
            });
        });
    });
});

// [GET] /remove
router.get('/remove/:index', function(req, res){
    req.getConnection(function(err, connection) {
        connection.query('DELETE FROM images WHERE image_ID = ?', [req.params.index], function(err, result) {
            res.redirect('/board');
        });
    });
});

module.exports = router;