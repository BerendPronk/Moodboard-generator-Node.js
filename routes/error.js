var express = require('express');
var router = express.Router();

// [GET] /upload
router.get('/*', function(req, res, next) {
	// Stuurt naar browser dat het een 404 is
    res.status(404);

    // Verwijst naar de 404 pagina
    res.render('404', {
        feedback: 'Het lijkt erop dat deze pagina niet is gevonden!',
        state: 'negative'
    });
});

module.exports = router;