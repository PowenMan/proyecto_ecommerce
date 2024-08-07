const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Resolver las rutas statics
app.use(express.static("public"));

// Rutas motor de vistas ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views'));

// Configurar base de datos
const dbconfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'apptech'
}

module.exports = { app, PORT, dbconfig };