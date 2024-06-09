// Variables globales
let map;
let marker;
let filaSeleccionada = null;
let datosCSV = [];
let rios = ["RIO HUASAGA", "RIO CHAPIZA", "RIO ZAMORA", "RIO UPANO", "RIO JURUMBAINO",
    "RIO KALAGLAS", "RIO YUQUIPA", "RIO PAN DE AZÚCAR", "RIO JIMBITONO", "RIO DOMONO",
    "RIO BLANCO", "RIO ARAPICOS", "RIO KUSUIM", 
    "RIO TUTANANGOZA", "RIO INDANZA", "RIO MIRIUMI",
    "RIO YUNGANZA", "RIO CUYES", "RIO ZAMORA", "RIO EL IDEAL", "RIO MORONA",
    "RIO MUCHINKIN", "RIO NAMANGOZA", "RIO SANTIAGO", "RIO PASTAZA", "RIO CHIWIAS",
    "RIO TUNA CHIGUAZA", "RÍO PALORA", "RIO LUSHIN", "RIO SANGAY", "RIO NAMANGOZA",
    "RIO PAUTE", "RIO YAAPI", "RIO HUAMBIAZ", "RIO TZURIN", "RIO MANGOSIZA", "RIO PUCHIMI",
    "RIO EL CHURO", "RIO MACUMA", "RIO PANGUIETZA", "RIO PASTAZA", "RIO PALORA", "RIO TUNA",
    "RIO WAWAIM GRANDE","RIO LUSHIN"];

    function inicializarMapa() {
        map = L.map('map').setView([-2.278875, -78.141926], 14); // Ajustar si es necesario
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }
    



// Función para mover el marcador en el mapa a las coordenadas especificadas
function mostrarEnMapa(registro, fila) {
    const lat = parseFloat(registro['COORD- X']);
    const lon = parseFloat(registro['COORD- Y']);

    // Log para debug
    console.log("Registro seleccionado:", registro);
    console.log("Latitud:", lat, "Longitud:", lon);

    if (isNaN(lat) || isNaN(lon)) {
        mostrarPopupError("Las coordenadas no son válidas.");
        return;
    }

    const coordenadas = { latitude: lat, longitude: lon };

    if (filaSeleccionada) {
        filaSeleccionada.classList.remove('selected');
    }
    fila.classList.add('selected');
    filaSeleccionada = fila;

    if (marker) {
        marker.setLatLng([coordenadas.latitude, coordenadas.longitude]);
    } else {
        marker = L.marker([coordenadas.latitude, coordenadas.longitude]).addTo(map);
    }
    map.setView([coordenadas.latitude, coordenadas.longitude], 15);
}
// Función para abrir una pestaña específica
function abrirPestania(evt, tabName) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }

    const tablinks = document.getElementsByClassName('tablink');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }

    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}

// Función para cargar datos CSV y mostrarlos en las tablas
function cargarDatosCSV(url, tablaId) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: function(results) {
            const datos = results.data;
            if (tablaId === 'tabla1') {
                datosCSV = datos;
            }
            actualizarTabla(datos, tablaId);
            if (tablaId === 'tabla1') {
                cargarNombresRios();
            }
        },
        error: function(error) {
            mostrarPopupError("Error al cargar el archivo CSV: " + error.message);
        }
    });
}

// Función para actualizar la tabla con los datos cargados
function actualizarTabla(datos, tablaId) {
    const tabla = document.getElementById(tablaId).getElementsByTagName('tbody')[0];
    const thead = document.getElementById(tablaId).getElementsByTagName('thead')[0].getElementsByTagName('tr')[0];
    tabla.innerHTML = '';
    thead.innerHTML = '';

    if (tablaId === 'tabla1') {
        // Campos que se mostrarán en la tabla de parámetros biológicos
        const camposAMostrar = ['ID', 'RIO', 'COORD- X', 'COORD- Y', 'LAT', 'LON', 'PUNTO', 'FECHA',
            'RIQUEZA ABSOLUTA', 'DIVERSIDAD SEGÚN SHANNON', 'CALIDAD DEL AGUA SEGÚN SHANNON',
            'ÍNDICE BMWP/Col', 'ÍNDICE BMWP/Col.1'];

        // Crear encabezados de tabla para parámetros biológicos
        camposAMostrar.forEach(campo => {
            const th = document.createElement('th');
            th.textContent = campo;
            thead.appendChild(th);
        });

        // Llenar la tabla de parámetros biológicos
        datos.forEach(registro => {
            const fila = tabla.insertRow();

            camposAMostrar.forEach(campo => {
                const celda = fila.insertCell();
                celda.textContent = registro[campo];
            });

            fila.onclick = () => mostrarEnMapa(registro, fila);
        });
    } else if (tablaId === 'tabla2') {
        // Crear encabezados de tabla para parámetros fisicoquímicos
        const headers = Object.keys(datos[0]);
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            thead.appendChild(th);
        });

        // Llenar la tabla de parámetros fisicoquímicos
        datos.forEach(registro => {
            const fila = tabla.insertRow();

            headers.forEach(campo => {
                const celda = fila.insertCell();
                celda.textContent = registro[campo];
            });

            fila.onclick = () => mostrarEnMapa(registro, fila);
        });
    }
}

// Función para buscar datos y filtrarlos según el río seleccionado
function buscarDatos() {
    const selectRios = document.getElementById('rio-select');
    const nombreRioSeleccionado = selectRios.value;
    const tabla1 = document.getElementById('tabla1');
    const tabla2 = document.getElementById('tabla2');

    if (!nombreRioSeleccionado) {
        mostrarPopupError("Por favor, seleccione un río.");
        return;
    }

    const filasTabla1 = Array.from(tabla1.getElementsByTagName('tbody')[0].rows);
    const filasTabla2 = Array.from(tabla2.getElementsByTagName('tbody')[0].rows);

    filasTabla1.forEach(fila => {
        fila.style.display = (fila.cells[1].textContent === nombreRioSeleccionado) ? '' : 'none';
    });

    filasTabla2.forEach(fila => {
        fila.style.display = (fila.cells[1].textContent === nombreRioSeleccionado) ? '' : 'none';
    });
}

// Función para cargar los nombres de los ríos en el menú desplegable
function cargarNombresRios() {
    const selectRios = document.getElementById('rio-select');
    selectRios.innerHTML = '<option value="">Seleccione un río</option>'; // Limpiar opciones previas

    rios.forEach(nombreRio => {
        const opcion = document.createElement('option');
        opcion.value = nombreRio;
        opcion.textContent = nombreRio;
        selectRios.appendChild(opcion);
    });
}

// Función para mostrar el popup de error
function mostrarPopupError(mensaje) {
    const popup = document.getElementById('error-popup');
    const textoPopup = document.getElementById('error-popup-text');
    textoPopup.textContent = mensaje;
    popup.style.display = 'block';
}

// Función para cerrar el popup de error
function cerrarPopup() {
    const popup = document.getElementById('error-popup');
    popup.style.display = 'none';
}

// Inicialización del mapa y carga de datos al cargar la página
window.onload = function() {
    inicializarMapa();
    abrirPestania({currentTarget: document.getElementById('biological-parameters-tab')}, 'tab1');
    document.getElementById('buscar-btn').addEventListener('click', buscarDatos);
    cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/Parametrosbio.csv', 'tabla1');
    cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/Parametrosfisio.csv', 'tabla2');
};

// Nuevo código para llenar el menú desplegable con ríos y buscar datos
document.addEventListener("DOMContentLoaded", function () {
    const selectRio = document.getElementById('rio-select');
    rios.forEach(rio => {
        const option = document.createElement('option');
        option.value = rio;
        option.text = rio;
        selectRio.add(option);
    });

    const buscarBtn = document.getElementById('buscar-btn');
    buscarBtn.addEventListener('click', function () {
        const selectedRio = selectRio.value;
        if (!selectedRio) {
            mostrarPopupError("Por favor seleccione un río.");
            return;
        }
        cargarDatos(selectedRio);
    });
});

// Cargar datos del río seleccionado
function cargarDatos(rio) {
    console.log(`Cargando datos para ${rio}`);
}
