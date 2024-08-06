const { app, PORT} = require('./config');
require('./app');

// Iniciar server 
app.listen(PORT, () => {
    console.log(`Servidor iniciado el el puerto:${PORT}`);
});