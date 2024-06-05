// Variables globales
let map;
let vectorSource;
let vectorLayer;
let filaSeleccionada = null;
let datosCSV = [];

// Función para inicializar el mapa con OpenLayers
function inicializarMapa() {
    vectorSource = new ol.source.Vector();

    vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({color: 'red'}),
                stroke: new ol.style.Stroke({
                    color: [255, 0, 0], width: 2
                })
            })
        })
    });

    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            vectorLayer
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([-78.141926, -2.278875]),
            zoom: 14
        })
    });
}

// Función para mover el marcador en el mapa a las coordenadas especificadas
function mostrarEnMapa(registro, fila) {
    const lat = parseFloat(registro['COORD-Y'] || registro['COORD- Y']);
    const lng = parseFloat(registro['COORD-X'] || registro['COORD- X']);

    if (!isNaN(lat) && !isNaN(lng)) {
        const coord = ol.proj.fromLonLat([lng, lat]);

        // Limpiar los marcadores anteriores
        vectorSource.clear();

        // Crear un nuevo marcador con un punto rojo
        const marker = new ol.Feature({
            geometry: new ol.geom.Point(coord)
        });
        marker.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({color: 'red'}),
                stroke: new ol.style.Stroke({
                    color: [255, 0, 0], width: 2
                })
            })
        }));

        // Añadir el nuevo marcador al vectorSource
        vectorSource.addFeature(marker);

        // Centrar el mapa en la nueva coordenada
        map.getView().animate({
            center: coord,
            duration: 1000
        });

        // Obtener el índice de la fila seleccionada en la tabla
        const filas = fila.parentNode.children;
        const indiceFilaSeleccionada = Array.from(filas).indexOf(fila);

        // Mostrar el punto en la consola
        console.log(`Punto seleccionado: ${registro['PUNTO']} (Fila ${indiceFilaSeleccionada + 1} en la tabla)`);
    } else {
        mostrarPopupError("Coordenadas inválidas. Por favor, verifique los datos.");
    }

    // Resaltar la fila seleccionada
    if (filaSeleccionada) {
        filaSeleccionada.classList.remove('selected');
    }
    fila.classList.add('selected');
    filaSeleccionada = fila;
}

// Función para abrir y cerrar las pestañas
function abrirPestania(evento, nombrePestania) {
    const contenidoPestanias = document.getElementsByClassName("tabcontent");
    const enlaces = document.getElementsByClassName("tablink");

    for (let i = 0; i < contenidoPestanias.length; i++) {
        contenidoPestanias[i].style.display = "none";
    }

    for (let i = 0; i < enlaces.length; i++) {
        enlaces[i].classList.remove("active");
    }

    document.getElementById(nombrePestania).style.display = "block";
    evento.currentTarget.classList.add("active");

    if (nombrePestania === 'tab1') {
        cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/Parametrosbio.csv', 'tabla1');
    }

    if (nombrePestania === 'tab2') {
        cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/Parametrosfisio.csv', 'tabla2');
    }
}

// Función para cargar un archivo CSV desde una URL
function cargarDatosCSV(urlCSV, idTabla) {
    Papa.parse(urlCSV, {
        download: true,
        header: true,
        complete: function(resultados) {
            datosCSV = resultados.data;
            poblarTabla(idTabla, datosCSV);
        }
    });
}

// Función para insertar los datos del archivo CSV en la tabla HTML
function poblarTabla(idTabla, datos) {
    const tabla = document.getElementById(idTabla).getElementsByTagName('tbody')[0];
    tabla.innerHTML = '';

    const columnasAMostrarBiologicos = ['RIO','COORD- X','COORD- Y','PUNTO','FECHA','DIVERSIDAD SEGÚN SHANNON','CALIDAD DEL AGUA SEGÚN SHANNON'];
    const columnasAMostrarFisicoquimicos = ['RIO','COORD- X','COORD- Y','PUNTO','FECHA','CALIDAD AGUA NSF','Clasificacion'];

    let columnasAMostrar;

    if (idTabla === 'tabla1') {
        columnasAMostrar = columnasAMostrarBiologicos;
    } else {
        columnasAMostrar = columnasAMostrarFisicoquimicos;
    }

    const filaEncabezados = tabla.insertRow();
    columnasAMostrar.forEach(columna => {
        const encabezado = document.createElement('th');
        encabezado.textContent = columna;
        filaEncabezados.appendChild(encabezado);
    });

    datos.forEach((registro) => {
        const filaNueva = tabla.insertRow();

        columnasAMostrar.forEach((columna) => {
            const celdaNueva = filaNueva.insertCell();
            celdaNueva.textContent = registro[columna];
        });

        // Agregar evento de clic a cada fila
        filaNueva.addEventListener('click', function() {
            mostrarEnMapa(registro, this);
        });
    });
}

// Función para mostrar datos en la tabla
function mostrarDatosEnTabla(idTabla, data) {
    poblarTabla(idTabla, data);
}

// Función para mostrar popup de error
function mostrarPopupError(mensaje) {
    const popup = document.getElementById('error-popup');
    const popupText = document.getElementById('error-popup-text');
    popupText.textContent = mensaje;
    popup.style.display = 'block';
}

// Función para cerrar popup de error
function cerrarPopup() {
    const popup = document.getElementById('error-popup');
    popup.style.display = 'none';
    location.reload(); // Recargar la página
}

// Función para filtrar y mostrar datos por río
function filtrarPorRio() {
    const selectedRio = document.getElementById('rio-select').value;
    const filteredData = datosCSV.filter(row => row.RIO === selectedRio);
    mostrarDatosEnTabla('tabla1', filteredData);
    mostrarDatosEnTabla('tabla2', filteredData);
}

// Inicializar el mapa cuando la ventana se carga y cargar datos adicionales
window.onload = function() {
    inicializarMapa();

    const rios = [
        "RIO HUASAGA", "RIO  CHAPIZA", "RIO ZAMORA", "RIO UPANO", "RIO JURUMBAINO",
        "RIO KALAGLAS", "RIO YUQUIPA", "RIO  PAN DE AZÚCAR", "RIO  JIMBITONO", "RIO DOMONO",
        "RIO RIO BLANCO", "RIO ARAPICOS", "RIO KUSUIM", "RIO TUNANZA", "RIO COPUENZA",
        "RIO YANAYACU", "RIO  GUANGANZA", "RIO  TUTANANGOZA", "RIO INDANZA", "RIO MIRIUMI",
        "RIO YUNGANZA", "RIO INDANZA", "RIO CUYES", "RIO ZAMORA", "RIO EL IDEAL", "RIO MORONA",
        "RIO MUCHINKIN", "RIO NAMANGOZA", "RIO SANTIAGO", "RIO PASTAZA", "RIO CHIWIAS",
        "RIO TUNA CHIGUAZA", "RÍO PALORA", "RIO LUSHIN", "RIO SANGAY", "RIO NAMANGOZA",
        "RIO PAUTE", "RIO YAAPI", "RIO HUAMBIAZ", "RIO TZURIN", "RIO MANGOSIZA", "RIO PUCHIMI",
        "RIO EL CHURO", "RIO MACUMA", "RIO PANGUIETZA", "RIO PASTAZA", "RIO PALORA", "RIO TUNA",
        "RIO WAWAIM GRANDE"
    ];
    
    // Llenar el dropdown con los ríos
    const rioSelect = document.getElementById('rio-select');
    rios.forEach(rio => {
        const option = document.createElement('option');
        option.value = rio;
        option.textContent = rio;
        rioSelect.appendChild(option);
    });

    // Añadir el botón de búsqueda y su evento
    const buscarBtn = document.getElementById('buscar-btn');
    buscarBtn.addEventListener('click', filtrarPorRio);

    cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/Parametrosbio.csv', 'tabla1');
    cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/Parametrosfisio.csv', 'tabla2');
};