const { app } = require('./config');


// Ruta de la url
app.get('/', (req, res) => {
    res.render('index');
});