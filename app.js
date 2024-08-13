const { app, upload } = require('./config');
const db = require('./db');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

// Me permite recibir peticiones externas.
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
    const query = 'SELECT * FROM productos';
    db.query(query, (err, result) => {
        if(err){
           console.err('Error al obtener las productos', err);
           return res.status(500).send('Error al obtener los productos'); 
        }
        res.render('index', { productos: result });
    });
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

// Ruta para cargar los productos
app.post('/productos', isAthenticated, upload.single('imagen'), (req, res) => {
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    const imagenNombre = req.file.filename;
    const imagenURL = `${req.protocol}://${req.get('host')}/uploads/${imagenNombre}`;


    const query = 'INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, imagen_url) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [nombre, descripcion, precio, stock, categoria, imagenURL];

    db.query(query, values, (err, result) => {
        if(err){
            console.log('Error al guardar el producto:', err);
            return res.status(500).send('Error al guardar el producto');
        }
        res.redirect('/listar-productos');
        // res.send('Prodcuto guardado exitosamente');
    });
});

// Ruta listar productos
app.get('/listar-productos', isAthenticated, (req, res) => {
    const query = 'SELECT productos.nombre AS nom_producto, categorias.nombre AS nom_categoria, productos.descripcion, productos.precio, productos.stock, productos.imagen_url  FROM productos JOIN categorias ON productos.categoria_id = categorias.id';
    db.query(query, (err, result) => {
        if(err){
           console.err('Error al obtener las productos', err);
           return res.status(500).send('Error al obtener los productos'); 
        }
        res.render('listar-productos', { productos: result });
    });
});

module.exports = app;