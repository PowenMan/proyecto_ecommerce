const { app } = require('./config');
const db = require('./db');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

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

module.exports = app;