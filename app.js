//1. Invocamos a express
const express = require('express');
const app = express();


//2. Seteamos URLENCONDED para capturar los datos del formulario.
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//3. Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

//4. Setear el directorio de Public
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

console.log(__dirname);
//5.Establecer un motor de plantillas
app.set('view engine','ejs');

//6.Invocar a bcryptjs
const bcryptjs=require('bcryptjs');

//7.Var. de session
const session = require('express-session');
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
})) ;
app.use('/', require('./router'));
//8. Invocamos al modulo de conexión de la base de datos
const connection = require('./database/db');

//9.Establecemos rutas
app.get('/', (req, res) => {
    res.render('login');
});
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/index', (req, res) => {
    res.render('index');
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.get('/admin', (req, res) => {
    res.render('admin');
});
//app.get('/ver_users', (req, res) => {
  //  res.render('ver_users');
//});

app.get('/registro_admins', (req, res) => {
    res.render('registro_admins');
});
app.get('/actividad', (req, res) => {
    res.render('actividad');
});

app.get('/login_admin', (req, res) => {
    res.render('login_admin');
});
app.use(express.static('public'));
// 10. Registro
app.post('/register', async (req, res) => {
    const user = req.body.registerNombre;
    const apellido = req.body.registerApellido;
    const edad = req.body.registerEdad;
    const pais = req.body.registerPais;
    const provincia = req.body.registerProvincia;
    const ciudad = req.body.registerCiudad;
    const empleo = req.body.registerEmpleo;
    const correo = req.body.registerEmail;
    const contrasenia = req.body.registerContraseña;
    //let passwordHash = await bcryptjs.hash(contrasenia, 8);
 
    // Verificar si el correo ya está registrado
    connection.query('SELECT correo_us FROM usuarios WHERE correo_us = ?', [correo], (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error en la base de datos');
        }

        // Si el correo ya está en uso
        if (results.length > 0) {
            // Renderizar el formulario con un mensaje de advertencia
            return res.render('register', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Este correo ya está registrado, por favor usa otro.",
                alertIcon: 'warning',
                showConfirmation: false,
                timer: false,  // No cerrar automáticamente
                ruta: 'register'
            });
        }

        // Si el correo no está en uso, continuar con el registro
        connection.query('INSERT INTO usuarios SET ?', {
            nombre_us: user,
            apellido_us: apellido,
            edad_us: edad,
            pais_us: pais,
            provincia_us: provincia,
            ciudad_us: ciudad,
            empleo_us: empleo,
            correo_us: correo,
            contrasenia_us: contrasenia
        }, (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Error al registrar el usuario');
            } else {
                // Mostrar mensaje de éxito
                res.render('register', {
                    alert: true,
                    alertTitle: "Registro",
                    alertMessage: "¡Registro Exitoso!",
                    alertIcon: 'success',
                    showConfirmation: false,
                    timer: 1500,
                    ruta: 'login'
                });
            }
        });
    });
});



app.post('/auth', async (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;

    if (user && pass) {
        connection.query('SELECT * FROM usuarios WHERE correo_us = ?', [user], async (error, results) => {
            if (error) {
                return res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Error en la base de datos",
                    alertIcon: 'error'
                });
            }
            
            // Verifica si el usuario existe y si la contraseña es correcta
           // Verifica si el usuario existe y si la contraseña es correcta
               if (results.length == 0 || pass !== results[0].contrasenia_us) {
                 return res.render('login', {
                 alert: true,
                 alertTitle: "Error",
                 alertMessage: "Correo electrónico y/o contraseña incorrectas",
                alertIcon: 'error'
             });
             } else {
                // Login correcto, obtener el id_us del usuario
                const userId = results[0].id_us; // Aquí obtenemos el id_us del usuario
                
                // Registrar la fecha y hora actuales
                const currentDate = new Date();
                const time = currentDate.toTimeString().split(' ')[0];  // Hora en formato HH:MM:SS
                const date = currentDate.toISOString().split('T')[0];  // Fecha en formato YYYY-MM-DD

                // Insertar el registro en la tabla ingresos_users
                connection.query(
                    'INSERT INTO ingresos_users (hora_ingus, fecha_ingus, id_user) VALUES (?, ?, ?)', 
                    [time, date, userId], 
                    (error, result) => {
                        if (error) {
                            return res.render('login', {
                                alert: true,
                                alertTitle: "Error",
                                alertMessage: "Error al registrar el ingreso",
                                alertIcon: 'error'
                            });
                        }

                        // Si todo sale bien, redirigir a ica.html
                        return res.redirect('/calinagua/ica.html');
                    }
                );
            }
        });
    } else {
        res.render('login', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Por favor, ingrese usuario y contraseña",
            alertIcon: 'error'
        });
    }
});




//registro de administradores
app.post('/registro_admins', async (req, res) => {
    const user = req.body.nombre_ad;
    const apellido = req.body.apellido_ad;
    const cargo = req.body.cargo_ad;
    const nombreusuario = req.body.usuario_ad;
    const correo = req.body.correo_ad;
    const contrasenia = req.body.contrasenia_ad;
    //let passwordHash = await bcryptjs.hash(contrasenia, 8);

    // Verificar si el usuario ya está registrado
    // Verificar si el nombre de usuario o el correo ya están en uso
connection.query('SELECT usuario_ad, correo_ad FROM administradores WHERE usuario_ad = ? OR correo_ad = ?', [nombreusuario, correo], (error, results) => {
    if (error) {
        console.log(error);
        return res.status(500).send('Error en la base de datos');
    }

    // Si el usuario o el correo ya están en uso
    if (results.length > 0) {
        // Verificar cuál está en uso
        if (results[0].usuario_ad === nombreusuario) {
            return res.render('registro_admins', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Este usuario ya está siendo usado, por favor usa otro.",
                alertIcon: 'warning',
                showConfirmation: false,
                timer: false,  // No cerrar automáticamente
                ruta: 'registro_admins'
            });
        } else if (results[0].correo_ad === correo) {
            return res.render('registro_admins', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Este correo ya está siendo usado, por favor usa otro.",
                alertIcon: 'warning',
                showConfirmation: false,
                timer: false,  // No cerrar automáticamente
                ruta: 'registro_admins'
            });
        }
    }

    // Si el nombre de usuario y el correo no están en uso, continuar con el registro
    connection.query('INSERT INTO administradores SET ?', {
        nombre_ad: user,
        apellido_ad: apellido,
        cargo_ad: cargo,
        usuario_ad: nombreusuario,
        correo_ad: correo,
        contrasena_ad: contrasenia
    }, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error al registrar el usuario');
        } else {
            // Mostrar mensaje de éxito
            res.render('registro_admins', {
                alert: true,
                alertTitle: "Registro",
                alertMessage: "¡Registro Exitoso!",
                alertIcon: 'success',
                showConfirmation: false,
                timer: 1500,
                ruta: 'ver_admins'
            });
        }
    });
});

});
//registro de usuarios

app.post('/registro_usuarios', async (req, res) => {
    const user = req.body.nombre_us;
    const apellido = req.body.apellido_us;
    const edad = req.body.edad_us;
    const pais = req.body.pais_us;
    const provincia = req.body.provincia_us;
    const ciudad = req.body.ciudad_us;
    const empleo = req.body.empleo_us;
    const correo = req.body.correo_us;
    const contrasenia = req.body.contrasenia_us;
   // let passwordHash = await bcryptjs.hash(contrasenia, 8);

    // Verificar si el usuario ya está registrado
    // Verificar si el nombre de usuario o el correo ya están en uso
connection.query('SELECT correo_us FROM usuarios WHERE  correo_us = ?', [correo], (error, results) => {
    if (error) {
        console.log(error);
        return res.status(500).send('Error en la base de datos');
    }

    // Si el usuario o el correo ya están en uso
    if (results.length > 0) {
        // Verificar cuál está en uso
         if (results[0].correo_ad === correo) {
            return res.render('admin', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Este correo ya está siendo usado, por favor usa otro.",
                alertIcon: 'warning',
                showConfirmation: false,
                timer: false,  // No cerrar automáticamente
                ruta: 'admin'
            });
        }
    }

    // Si el nombre de usuario y el correo no están en uso, continuar con el registro
    connection.query('INSERT INTO usuarios SET ?', {
        nombre_us: user,
        apellido_us: apellido,
        edad_us: edad,
        pais_us: pais,
        provincia_us: provincia,
        ciudad_us: ciudad,
        empleo_us: empleo,
        correo_us: correo,
        contrasenia_us: contrasenia
    }, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error al registrar el usuario');
        } else {
            // Mostrar mensaje de éxito
            res.render('admin', {
                alert: true,
                alertTitle: "Registro",
                alertMessage: "¡Registro Exitoso!",
                alertIcon: 'success',
                showConfirmation: false,
                timer: 1500,
                ruta: 'ver_users'
            });
        }
    });
});

});
// login de administrador
app.post('/authadmin', async (req, res) => {
    const userad = req.body.correoad;
    const passad = req.body.contrasenia_ad;  // Esto ahora coincide con el input del formulario
 

    if (userad && passad) {
        connection.query('SELECT * FROM administradores WHERE correo_ad = ?', [userad], async (error, results) => {
            if (error) {
                return res.render('login_admin', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Error en la base de datos",
                    alertIcon: 'error'
                });
            }
            
            // Verifica si el usuario existe y si la contraseña es correcta
           // Verifica si el administrador existe y si la contraseña es correcta
            if (results.length == 0 || passad !== results[0].contrasena_ad) {
             console.log(contrasena_ad);
             return res.render('login_admin', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Correo electrónico y/o contraseña incorrectas",
            alertIcon: 'error'
             });
          }
            else {
                // Login correcto, obtener el id_us del usuario
                const userId = results[0].id_ad;
                
                // Registrar la fecha y hora actuales
                const currentDate = new Date();
                const time = currentDate.toTimeString().split(' ')[0];
                const date = currentDate.toISOString().split('T')[0];

                // Insertar el registro en la tabla ingresos_admins
                connection.query(
                    'INSERT INTO ingresos_admins (hora_ingad,fecha_ingad,id_adm) VALUES (?, ?, ?)', 
                    [time, date, userId], 
                    (error, result) => {
                        if (error) {
                            return res.render('login_admin', {
                                alert: true,
                                alertTitle: "Error",
                                alertMessage: "Error al registrar el ingreso",
                                alertIcon: 'error'
                            });
                        }

                        // Si todo sale bien, redirigir a la página de administración
                        return res.redirect('admin');
                    }
                );
            }
        });
    } else {
        res.render('login_admin', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Por favor, ingrese usuario y contraseña",
            alertIcon: 'error'
        });
    }
});



//prueba de conexión
app.get('/', (req, res) => {
    res.send('Hola Munghdo');
});

app.listen(3000, () => {
    console.log('server running on port 3000');
});
