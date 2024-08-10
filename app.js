const { app } = require('./config');
const db = require('./db');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Milddleware para proteger rutas
function isAthenticated(req, res, next){
    if(req.session.usuario){
        return next();
    }else{
        res.redirect('/login');
    }
}

// Ruta para destruir sesion
app.get('/logout', (req, res) => {
    req.session.destroy((e) => {
        if(e){
            console.log(e);
            return res.status(500).send('Error al cerrar sesion');
        }
        res.redirect('/login');
    });
});

// Rutas de las url
app.get('/', (req, res) =>{
    res.render('index');
});

// Ruta de logueo
app.get('/login', (req, res) => {
    res.render('login');
});

// Ruta de registro
app.get('/registro', (req, res) => {
    res.render('registro');
});

// Crear la ruta de registro de usuario
app.post('/registro', async (req, res) => {
    const { nombre, apellido, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.query('INSERT INTO usuarios (nombre, apellidos, email, password) VALUES (?, ?, ?, ?)', [nombre, apellido, email, hashedPassword], (err, result) => {
        if(err){
            console.log(err);
            res.send('Error al registrar usuario');
        }else {
            console.log(result);
            res.redirect('login');
        }
    });
});

// Ruta inicio de sesion
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, result) => {
        if(err){
            console.log(err);
            res.send('Error al iniciar sesion');
        }else {
            if(result.length > 0){
                const usuario = result[0];
                if(await bcrypt.compare(password, usuario.password)){
                    req.session.usuario = usuario;
                    res.redirect('/admin');
                }else {
                    res.send('Credenciales incorrectas');
                }
            }else {
                res.send('Usuario no encontrado o no esta activo');
            }
        }
    });
});

// Ruta de logueo
app.get('/admin', isAthenticated, (req, res) => {
    res.render('admin');
});

// Ruta de categorias
app.get('/categorias', isAthenticated, (req, res) => {
    res.render('categorias');
});

// Ruta de categorias
app.post('/categorias', (req, res) => {
    console.log('Solicitud: ', req.body);
    const  { nombre, descripcion } = req.body;

    db.query('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion], (err, result) => {
        if(err){
            console.log(err);
            res.send('Error al insertar categoria');
        }else {
            console.log(result);
            res.send('categoria insertada con exito!');
        }    
    });
});

// Ruta de productos
app.get('/productos', isAthenticated, (req, res) => {
    const query = 'SELECT * FROM categorias';
    db.query(query, (err, result) => {
        if(err){
           console.err('Error al obtener las categorias', err);
           return res.status(500).send('Error al obtener las categorias'); 
        }
        res.render('productos', { categorias: result });
    });
});

// Ruta para cargar las categorias

module.exports = app;