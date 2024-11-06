// Función para enviar la solicitud de actualización
function actualizarAdmin(btn) {
  // Obtener la fila actual
  const row = btn.parentElement.parentElement;
  
  // Obtener el ID de la primera celda (no editable)
  const id = row.cells[0].innerText;

  // Obtener los valores de las celdas editables
  const nombre = row.cells[1].innerText;
  const apellido = row.cells[2].innerText;
  const cargo = row.cells[3].innerText;
  const usuario = row.cells[4].innerText;
  const correo = row.cells[5].innerText;
  const contrasena = row.cells[6].innerText;

  // Enviar la solicitud de actualización
  fetch(`/actualizar_admin/${id}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          nombre,
          apellido,
          cargo,
          usuario,
          correo,
          contrasena
      })
  })
  .then(response => response.json())
  .then(data => {
      alert('Administrador actualizado correctamente');
  })
  .catch(error => {
      console.error('Error al actualizar el administrador:', error);
  });
}

// Función para eliminar un administrador
function eliminarAdmin(btn) {
  // Obtener la fila actual
  const row = btn.parentElement.parentElement;

  // Obtener el ID de la primera celda
  const id = row.cells[0].innerText;

  // Confirmación de eliminación
  if (confirm("¿Estás seguro de eliminar este administrador?")) {
      fetch(`/eliminar_admin/${id}`, {
          method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
          alert('Administrador eliminado correctamente');
          // Recargar la página después de eliminar
          location.reload();
      })
      .catch(error => {
          console.error('Error al eliminar el administrador:', error);
      });
  }
}