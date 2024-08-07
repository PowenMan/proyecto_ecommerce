const mysql = require('mysql');
const { dbconfig } = require('./config');

// Crear la conexion a la base de datos
const connection = mysql.createConnection(dbconfig);

connection.connect((err) => {
    if(err){
        console.error('Erros al conectar con la base de datos!!!');
        return
    }
    console.log('Conexion a la base de datos exitosa!!!');
});

module.exports = connection;
