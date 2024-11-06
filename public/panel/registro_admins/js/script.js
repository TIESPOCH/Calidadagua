document.getElementById('buscarBtn').addEventListener('click', function() {
    const campo = document.getElementById('campoBusqueda').value; // Campo seleccionado
    const valor = document.getElementById('valorBusqueda').value; // Valor del input
  
    if (campo && valor) {
      fetch(`/buscar_admin?campo=${campo}&valor=${valor}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            // Mostrar los datos en el formulario
            document.getElementById('nombre').value = data.nombre_ad || '';
            document.getElementById('apellido').value = data.apellido_ad || '';
            document.getElementById('cargo').value = data.cargo_ad || '';
            document.getElementById('usuario').value = data.usuario_ad || '';
            document.getElementById('correo').value = data.correo_ad || '';
          } else {
            alert('No se encontraron datos.');
          }
        })
        .catch(error => console.error('Error:', error));
    } else {
      alert('Por favor selecciona un campo y escribe un valor.');
    }
  });
  