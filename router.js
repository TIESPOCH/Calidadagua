const express = require('express');
const router = express.Router();
const conexion = require('./database/db');

router.get('/ver_users', (req, res) => {
    conexion.query('SELECT * FROM usuarios', (error, results) => {
        if (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).send('Error al obtener usuarios');
        } else {
            //console.log('Resultados obtenidos:', results);
            res.render('ver_users', { results: results });
        }
    });
});
// para  ver los admins
router.get('/ver_admins', (req, res) => {
    conexion.query('SELECT * FROM administradores', (error, results) => {
        if (error) {
            console.error('Error al obtener administradores:', error);
            res.status(500).send('Error al obtener administradores');
        } else {
            //console.log('Resultados obtenidos:', results);
            res.render('ver_admins', { results: results });
        }
    });
});
// para  ver los ingresos de usuarios
router.get('/ingreso_usuarios', (req, res) => {
    conexion.query(`
        SELECT ingresos_users.*, usuarios.nombre_us, usuarios.apellido_us
        FROM ingresos_users
        JOIN usuarios ON ingresos_users.id_user = usuarios.id_us
    `, (error, results) => {
        if (error) {
            console.error('Error al obtener los ingresos:', error);
            res.status(500).send('Error al obtener los ingresos');
        } else {
            //console.log('Resultados obtenidos:', results);
            res.render('ingreso_usuarios', { results: results });
        }
    });
});

// para  ver los ingresos de admins
router.get('/ingreso_admins', (req, res) => {
    conexion.query(`
        SELECT ingresos_admins.*, administradores.nombre_ad, administradores.apellido_ad
        FROM ingresos_admins
        JOIN administradores ON ingresos_admins.id_adm = administradores.id_ad
    `, (error, results) => {
        if (error) {
            console.error('Error al obtener los ingresos:', error);
            res.status(500).send('Error al obtener los ingresos');
        } else {
            //console.log('Resultados obtenidos:', results);
            res.render('ingreso_admins', { results: results });
        }
    });
});

//para editar a los usuarios
router.post('/actualizar_usuario/:id', async (req, res) => {
    const id = req.params.id;
    const { nombre, apellido, edad, pais, provincia, ciudad, empleo, correo, contrasenia } = req.body;
    

    conexion.query(
        'UPDATE usuarios SET ? WHERE id_us = ?',
        [{ 
            nombre_us: nombre, 
            apellido_us: apellido,
            edad_us: edad,
            pais_us: pais,
            provincia_us: provincia,
            ciudad_us: ciudad,
            empleo_us: empleo,
            correo_us: correo,
            contrasenia_us: contrasenia 
        }, id],
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Error al actualizar el usuario');
            } else {
                return res.status(200).json({ message: 'Usuario actualizado correctamente' });
            }
        }
    );
});

router.delete('/eliminar_usuario/:id', (req, res) => {
    const id = req.params.id;

    conexion.query('DELETE FROM usuarios WHERE id_us = ?', [id], (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error al eliminar el usuario');
        } else {
            return res.status(200).json({ message: 'Usuario eliminado correctamente' });
        }
    });
});
router.post('/actualizar_admin/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, apellido, cargo, usuario, correo, contrasena } = req.body;

    conexion.query(
        'UPDATE administradores SET ? WHERE id_ad = ?',
        [{ 
            nombre_ad: nombre, 
            apellido_ad: apellido,
            cargo_ad: cargo,
            usuario_ad: usuario,
            correo_ad: correo,
            contrasena_ad: contrasena
        }, id],
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Error al actualizar el administrador');
            } else {
                return res.status(200).json({ message: 'Administrador actualizado correctamente' });
            }
        }
    );
});

router.delete('/eliminar_admin/:id', (req, res) => {
    const id = req.params.id;

    conexion.query('DELETE FROM administradores WHERE id_ad = ?', [id], (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error al eliminar el administrador');
        } else {
            return res.status(200).json({ message: 'Administrador eliminado correctamente' });
        }
    });
});

module.exports = router;