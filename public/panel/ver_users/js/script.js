// Función para enviar una solicitud de actualización al servidor
function actualizarUsuario(id, btn) {
    // Obtener la fila actual
    const row = btn.parentElement.parentElement;
    
    // Obtener los datos de las celdas editables
    const nombre = row.cells[1].innerText;
    const apellido = row.cells[2].innerText;
    const edad = row.cells[3].innerText;
    const pais = row.cells[4].innerText;
    const provincia = row.cells[5].innerText;
    const ciudad = row.cells[6].innerText;
    const empleo = row.cells[7].innerText;
    const correo = row.cells[8].innerText;
    const contrasenia = row.cells[9].innerText;
    
    // Enviar la solicitud de actualización mediante AJAX
    fetch(`/actualizar_usuario/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nombre,
            apellido,
            edad,
            pais,
            provincia,
            ciudad,
            empleo,
            correo,
            contrasenia
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('Usuario actualizado correctamente');
    })
    .catch(error => {
        console.error('Error al actualizar el usuario:', error);
    });
}

// Función para eliminar un usuario
function eliminarUsuario(id) {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
        fetch(`/eliminar_usuario/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            alert('Usuario eliminado correctamente');
            // Recargar la página después de eliminar el usuario
            location.reload();
        })
        .catch(error => {
            console.error('Error al eliminar el usuario:', error);
        });
    }
}