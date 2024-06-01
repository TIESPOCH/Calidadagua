// Función para inicializar el mapa de Google Maps
function inicializarMapa() {
  // Coordenadas iniciales del mapa
  const coordenadasCentro = { lat: -2.278875, lng: -78.141926 };

  // Crear un nuevo objeto Map y configurar sus propiedades
  const mapa = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: coordenadasCentro
  });

  // Agregar un marcador en la posición inicial
  const marcador = new google.maps.Marker({
    position: coordenadasCentro,
    map: mapa,
    title: '¡Estudio de la calidad de agua de la red hidrológica del cantón Morona!'
  });
}

// Función para abrir y cerrar las pestañas
function abrirPestania(evento, nombrePestania) {
  // Obtener todos los elementos con la clase "tabcontent"
  const contenidoPestanias = document.getElementsByClassName("tabcontent");
  // Obtener todos los elementos con la clase "tablink"
  const enlaces = document.getElementsByClassName("tablink");

  // Ocultar todos los contenidos de las pestañas
  for (let i = 0; i < contenidoPestanias.length; i++) {
    contenidoPestanias[i].style.display = "none";
  }

  // Remover la clase "active" de todos los enlaces
  for (let i = 0; i < enlaces.length; i++) {
    enlaces[i].classList.remove("active");
  }

  // Mostrar el contenido de la pestaña seleccionada
  document.getElementById(nombrePestania).style.display = "block";
  evento.currentTarget.classList.add("active");

  // Si se abre la pestaña "Parámetros Biológicos", cargar los datos relevantes
  if (nombrePestania === 'tab1') {
    cargarDatosCSV('https://raw.githubusercontent.com/EdisonFlores/parametrosbiologicos/main/bIO.csv','tabla1');
  }

  // Si se abre la pestaña "Parámetros Fisicoquímicos", cargar los datos relevantes
  if (nombrePestania === 'tab2') {
    cargarDatosCSV('https://raw.githubusercontent.com/EdisonFlores/parametrosbiologicos/05f6910aa5df6f08f3e1d92a81f8c04e2f8b38ac/Parametrosfisio.csv', 'tabla2');
  }
}

// Función para cargar un archivo CSV desde una URL
function cargarDatosCSV(urlCSV, idTabla) {
  // Utilizar la biblioteca PapaParse para cargar el archivo CSV
  Papa.parse(urlCSV, {
    download: true,
    header: true,
    complete: function(resultados) {
      // Una vez cargados los datos, llamar a la función para poblar la tabla
      poblarTabla(idTabla, resultados.data);
    }
  });
}

// Función para insertar los datos del archivo CSV en la tabla HTML
function poblarTabla(idTabla, datos) {
  // Obtener la tabla HTML por su id y seleccionar el elemento <tbody>
  const tabla = document.getElementById(idTabla).getElementsByTagName('tbody')[0];
  tabla.innerHTML = ''; // Limpiar contenido anterior de la tabla

  // Columnas a mostrar para la tabla de Parámetros Biológicos
  const columnasAMostrarBiologicos = ['RIO','COORD-X','COORD-Y','PUNTO','FECHA','DIVERSIDAD SEGÚN SHANNON','CALIDAD DEL AGUA SEGÚN SHANNON'];

  // Columnas a mostrar para la tabla de Parámetros Fisicoquímicos
  const columnasAMostrarFisicoquimicos = ['RIO','COORD- X','COORD- Y','PUNTO','FECHA','CALIDAD AGUA NSF','Clasificacion'];

  let columnasAMostrar;

  // Determinar qué columnas mostrar según la tabla
  if (idTabla === 'tabla1') {
    columnasAMostrar = columnasAMostrarBiologicos;
  } else {
    columnasAMostrar = columnasAMostrarFisicoquimicos;
  }

  // Crear la fila de encabezados
  const filaEncabezados = tabla.insertRow();
  columnasAMostrar.forEach(columna => {
    const encabezado = document.createElement('th');
    encabezado.textContent = columna;
    filaEncabezados.appendChild(encabezado);
  });

  // Iterar solo sobre los primeros 10 registros
  for (let i = 0; i < 10 && i < datos.length; i++) {
    const registro = datos[i];
    const filaNueva = tabla.insertRow();

    // Iterar sobre las columnas a mostrar y crear una celda para cada una
    for (const columna of columnasAMostrar) {
      const celdaNueva = filaNueva.insertCell();
      celdaNueva.textContent = registro[columna] || ''; // Mostrar un valor vacío si el campo no existe
    }
  }
}

// Al cargar la página, abrir la primera pestaña por defecto
document.addEventListener("DOMContentLoaded", function() {
  document.querySelector(".tablink").click();
});