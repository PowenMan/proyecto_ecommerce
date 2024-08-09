const express = require('express');
const path = require('path');
const session = require('express-session');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Midelware
app.use(morgan('dev'));

// Configurar la sesion
app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: true
}));

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

module.exports = { app, PORT, dbconfig,  session};