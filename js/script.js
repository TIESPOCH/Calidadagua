// Variables globales
let map;
let marker;
let filaSeleccionada = null;
let datosCSV = [];

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
            const datos = results.data.filter(registro => registro['RIO'] === 'RIO HUASAGA');
            console.log("Datos filtrados para RIO HUASAGA:", datos); // Log para debug
            if (tablaId === 'tabla1') {
                datosCSV = datos;
            }
            actualizarTabla(datos, tablaId);
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
    cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/Parametrosbio.csv', 'tabla1');
    cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/Parametrosfisio.csv', 'tabla2');
};
