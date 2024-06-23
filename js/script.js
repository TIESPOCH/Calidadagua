// Variables globales
let map;
let marker;
let filaSeleccionada = null;
let datosCSV = [];
let datosBiologicos = [];
let datosFisicoquimicos = [];
let rios = ["RIO HUASAGA", "RIO CHAPIZA", "RIO ZAMORA", "RIO UPANO", "RIO JURUMBAINO",
    "RIO KALAGLAS", "RIO YUQUIPA", "RIO PAN DE AZÚCAR",
    "RIO BLANCO", 
    "RIO TUTANANGOZA", "RIO INDANZA", "RIO MIRIUMI ",
    "RIO YUNGANZA", "RIO CUYES", "RIO ZAMORA", "RIO EL IDEAL", "RIO MORONA",
    "RIO MUCHINKIN", "RIO NAMANGOZA", "RIO SANTIAGO", "RIO PASTAZA", "RIO CHIWIAS",
    "RIO TUNA CHIGUAZA", "RÍO PALORA", "RIO LUSHIN", "RIO SANGAY", "RIO NAMANGOZA",
    "RIO PAUTE", "RIO YAAPI", "RIO HUAMBIAZ", "RIO TZURIN", "RIO MANGOSIZA", "RIO PUCHIMI",
    "RIO EL CHURO", "RIO MACUMA", "RIO PANGUIETZA", "RIO PASTAZA", "RIO PALORA", "RIO TUNA ",
    "RIO WAWAIM GRANDE","RIO LUSHIN"];

// Función para inicializar el mapa
function inicializarMapa() {
    map = L.map('map').setView([-1.831239, -78.183406], 6.60); // Coordenadas y zoom para ver Ecuador
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// Función para mostrar en el mapa y en la consola los campos especificados
function mostrarEnMapa(registro, fila) {
    const lat = parseFloat(registro['COORD- X']);
    const lon = parseFloat(registro['COORD- Y']);

    if (isNaN(lat) || isNaN(lon)) {
        mostrarPopupError("Las coordenadas no son válidas.");
        return;
    }

    const coordenadas = { latitude: lat, longitude: lon };

    // Eliminar la clase 'selected' de todas las filas
    document.querySelectorAll('tr.selected').forEach(fila => fila.classList.remove('selected'));

    // Añadir la clase 'selected' a la fila actual
    fila.classList.add('selected');
    filaSeleccionada = fila;

    // Buscar la fecha en el dataset correspondiente
    let fecha = '';
    if (registro.hasOwnProperty('ÍNDICE BMWP/Col.1')) {
        fecha = obtenerFechaPorID(datosBiologicos, registro['ID']);
    } else if (registro.hasOwnProperty('Clasificacion ')) {
        fecha = obtenerFechaPorID(datosFisicoquimicos, registro['ID']);
    }

    // Determinar el contenido del pop-up utilizando las funciones generadoras
    let popupContent = '';
    if (registro.hasOwnProperty('ÍNDICE BMWP/Col.1')) {
        popupContent = generarContenidoPopupBiologicos(registro, fecha);
        generarGraficoBarras(registro);
    } else if (registro.hasOwnProperty('Clasificacion ')) {
        popupContent = generarContenidoPopupFisicoquimicos(registro, fecha);
        generarGraficosFisicoquimicos(registro); // Llamada para generar gráficos
    } else {
        popupContent = `
            <div>
                <strong>Río:</strong> ${registro['RIO']}<br>
                <strong>Punto:</strong> ${registro['PUNTO']}<br>
                <strong>Fecha:</strong> ${fecha}<br>
                <strong>Información no disponible</strong>
            </div>
        `;
    }

    if (marker) {
        marker.setLatLng([coordenadas.latitude, coordenadas.longitude])
              .setPopupContent(popupContent)
              .openPopup();
    } else {
        marker = L.marker([coordenadas.latitude, coordenadas.longitude])
                  .addTo(map)
                  .bindPopup(popupContent)
                  .openPopup();
    }

    // Añadir eventos para mostrar el popup al pasar el mouse
    marker.on('mouseover', function() {
        marker.openPopup();
    });

    marker.on('mouseout', function() {
        marker.closePopup();
    });
    map.setView([coordenadas.latitude, coordenadas.longitude], 15);

    // Mostrar los campos solicitados en la consola
    console.log("Nivel 10: ", registro['Nivel 10']);
    console.log("Nivel 9: ", registro['Nivel 9 ']);
    console.log("Nivel 8: ", registro['Nivel 8']);
    console.log("Nivel 7: ", registro['Nivel 7']);
    console.log("Nivel 6: ", registro['Nivel 6']);
    console.log("Nivel 5: ", registro['Nivel 5']);
    console.log("Nivel 4: ", registro['Nivel 4']);
    console.log("Nivel 3: ", registro['Nivel 3']);
    console.log("Nivel 2: ", registro['Nivel 2']);
    console.log("Nivel 1: ", registro['Nivel 1']);

   
}


// Función para obtener la fecha por ID
function obtenerFechaPorID(datos, id) {
    const registro = datos.find(item => item['ID'] === id);
    return registro ? registro['FECHA'] : 'Fecha no disponible';
}
// Función para limpiar el área de información
function limpiarInfoArea() {
    const infoArea = document.querySelector('.info-area');
    infoArea.innerHTML = '<h2><i class="fas fa-info-circle"></i> Información Adicional</h2>';
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

    // Mostrar el contenedor del dropdown cuando se hace clic en un tab
    document.getElementById("dropdown-container").style.display = "flex";
      // Limpiar el área de información al cambiar de pestaña
      limpiarInfoArea();
}

// Función para cargar datos CSV y mostrarlos en las tablas
function cargarDatosCSV(url, tablaId) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: function(results) {
            const datos = results.data;
            if (tablaId === 'tabla1') {
                datosBiologicos = datos;
            } else if (tablaId === 'tabla2') {
                datosFisicoquimicos = datos;
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

    if (datos.length === 0) return;

    // Obtener los campos específicos para cada tabla
    let camposAMostrar = [];
    if (tablaId === 'tabla1') {
        camposAMostrar = ['ID', 'RIO', 'PUNTO','Nivel 10','Nivel 9','Nivel 8','Nivel 7','Nivel 6','Nivel 5','Nivel 4','Nivel 3','Nivel 2','Nivel 1', 'RIQUEZA ABSOLUTA', 'DIVERSIDAD SEGÚN SHANNON', 'CALIDAD DEL AGUA SEGÚN SHANNON', 'ÍNDICE BMWP/Col', 'ÍNDICE BMWP/Col.1'];
    } else if (tablaId === 'tabla2') {
        camposAMostrar = ['ID', 'RIO', 'PUNTO', 'Temperatura', 'Ph', 'Oxigeno disuelto', 'Solidos_Totales', 'Nitratos', 'Fosfatos', 'Turbiedad', 'DBO5', 'Coliformes fecales', 'CALIDAD AGUA NSF', 'Clasificacion '];
    }

    // Crear encabezados de tabla
    camposAMostrar.forEach(campo => {
        const th = document.createElement('th');
        th.textContent = campo;
        thead.appendChild(th);
    });

    // Llenar la tabla con los datos
    datos.forEach(registro => {
        const fila = tabla.insertRow();

        camposAMostrar.forEach(campo => {
            const celda = fila.insertCell();
            celda.textContent = registro[campo];
        });

        fila.onclick = () => mostrarEnMapa(registro, fila);
    });
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

    // Filtrar y mostrar las filas en tabla1
    const filasTabla1 = Array.from(tabla1.getElementsByTagName('tbody')[0].rows);
    filasTabla1.forEach(fila => {
        fila.style.display = (fila.cells[1].textContent === nombreRioSeleccionado) ? '' : 'none';
    });

    // Filtrar y mostrar las filas en tabla2
    const filasTabla2 = Array.from(tabla2.getElementsByTagName('tbody')[0].rows);
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
    document.getElementById('biological-parameters-tab').addEventListener('click', () => cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/tablabio.csv', 'tabla1'));
    document.getElementById('physicochemical-parameters-tab').addEventListener('click', () => cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/Parametrosfisio.csv', 'tabla2'));
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
        buscarDatos();
    });
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    toggleBtn.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('collapsed');
        const content = document.querySelector('.content');
        content.classList.toggle('expanded');
    });
    
});

// Función para generar el contenido del popup para parámetros biológicos
function generarContenidoPopupBiologicos(registro, fecha) {
    const nombreRio = registro['RIO'];
    const puntoRio = registro['PUNTO'];
    const indiceBMWP = registro['ÍNDICE BMWP/Col.1'];
    const calidadshanon = registro['CALIDAD DEL AGUA SEGÚN SHANNON'];

    return `
        <div>
            <strong>Río:</strong> ${nombreRio}<br>
            <strong>Punto:</strong> ${puntoRio}<br>
            <strong>ÍNDICE BMWP/Col.1:</strong> ${indiceBMWP}<br>
            <strong>Calidad según Shanon:</strong> ${calidadshanon}<br>
            <strong>Fecha:</strong> ${fecha}
        </div>
    `;
}

// Función para generar el contenido del popup para parámetros fisicoquímicos
function generarContenidoPopupFisicoquimicos(registro, fecha) {
    const nombreRio = registro['RIO'];
    const puntoRio = registro['PUNTO'];
    const clasificacion = registro['Clasificacion '];

    return `
        <div>
            <strong>Río:</strong> ${nombreRio}<br>
            <strong>Punto:</strong> ${puntoRio}<br>
            <strong>Clasificación de calidad del agua:</strong> ${clasificacion}<br>
            <strong>Fecha:</strong> ${fecha}
        </div>
    `;
}

// Función para generar gráficos comparativos utilizando D3.js
const valoresExcelentes = {
    'Temperatura': 25,
    'Ph': 8.5,
    'Oxigeno disuelto': 7,
    'Sólidos Totales Disueltos': 500,
    'Nitratos': 10,
    'Fosfatos': 0.1,
    'Turbiedad': 1,
    'DBO5': 3,
    'Coliformes Fecales': 200,
    'Calidad del Agua NSF': 100
};

const rangosEscalas = {
    'Temperatura': [5, 25],
    'Ph': [6.5, 8.5],
    'Oxigeno disuelto': [0, 7],
    'Sólidos Totales Disueltos': [0, 500],
    'Nitratos': [0, 10],
    'Fosfatos': [0, 0.5],
    'Turbiedad': [0, 1],
    'DBO5': [0, 3],
    'Coliformes Fecales': [0, 200],
    'Calidad del Agua NSF': [90, 100]
};
function generarGraficosFisicoquimicos(registro) {
      // Limpiar el área de información al cambiar de pestaña
      limpiarInfoArea();
    const parametros = {
        'Temperatura': 'Temperatura',
        'Ph': 'Ph',
        'Oxigeno disuelto': 'Oxigeno disuelto',
        'Sólidos Totales Disueltos': 'Sólidos Totales Disueltos',
        'Nitratos': 'Nitratos',
        'Fosfatos': 'Fosfatos',
        'Turbiedad': 'Turbiedad',
        'DBO5': 'DBO5'
    };

    const valoresExcelentes = {
        'Temperatura': 25,
        'Ph': 8.5,
        'Oxigeno disuelto': 7,
        'Sólidos Totales Disueltos': 500,
        'Nitratos': 10,
        'Fosfatos': 0.1,
        'Turbiedad': 1,
        'DBO5': 3
    };

    const rangosEscalas = {
        'Temperatura': [0, 40],
        'Ph': [0, 14],
        'Oxigeno disuelto': [0, 10],
        'Sólidos Totales Disueltos': [0, 1000],
        'Nitratos': [0, 20],
        'Fosfatos': [0, 1],
        'Turbiedad': [0, 5],
        'DBO5': [0, 10]
    };

    const infoArea = document.querySelector('.info-area');
    infoArea.innerHTML = '<h2><i class="fas fa-info-circle"></i> Información Adicional</h2>';

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    let filaDiv;
    let contador = 0;

    for (let parametro in parametros) {
        if (registro[parametro] !== undefined) {
            const valorRegistrado = parseFloat(registro[parametro]);
            const valorExcelente = valoresExcelentes[parametro];
            const rangoEscala = rangosEscalas[parametro];

            if (contador % 3 === 0) {
                filaDiv = document.createElement('div');
                filaDiv.className = 'fila-graficos';
                infoArea.appendChild(filaDiv);
            }

            const chartDiv = document.createElement('div');
            chartDiv.className = 'chart';
            filaDiv.appendChild(chartDiv);

            const data = [
                { name: 'Excelente', value: valorExcelente },
                { name: 'Registrado', value: valorRegistrado }
            ];

            const width = 400;
            const height = 300;
            const margin = { top: 20, right: 30, bottom: 40, left: 40 };

            const svg = d3.select(chartDiv).append('svg')
                .attr('width', width)
                .attr('height', height)
                .style("filter", "drop-shadow(3px 3px 3px rgba(0, 0, 0, 0.4))");

            const x = d3.scaleBand()
                .domain(data.map(d => d.name))
                .range([margin.left, width - margin.right])
                .padding(0.1);

            const y = d3.scaleLinear()
                .domain([0, rangoEscala[1]]).nice()
                .range([height - margin.bottom, margin.top]);

            const xAxis = g => g
                .attr('transform', `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).tickSizeOuter(0));

            const yAxis = g => g
                .attr('transform', `translate(${margin.left},0)`)
                .call(d3.axisLeft(y))
                .call(g => g.select('.domain').remove());

            svg.append('g')
                .selectAll('rect')
                .data(data)
                .enter().append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d.name))
                .attr('y', d => y(d.value))
                .attr('height', d => y(0) - y(d.value))
                .attr('width', x.bandwidth())
                .attr('fill', d => d.name === 'Excelente' ? 'green' : valorRegistrado <= valorExcelente ? 'blue' : 'red')
                .on('mouseover', function(event, d) {
                    tooltip.transition().duration(200).style('opacity', .9);
                    tooltip.html(d.value)
                        .style('left', (event.pageX) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', function(d) {
                    tooltip.transition().duration(500).style('opacity', 0);
                });

            svg.selectAll('rect')
                .each(function(d) {
                    d3.select(this.parentNode).append('text')
                        .attr('x', x(d.name) + x.bandwidth() / 2)
                        .attr('y', y(d.value) - 5)
                        .attr('text-anchor', 'middle')
                        .text(d.value);
                });

            svg.append('g').call(xAxis);
            svg.append('g').call(yAxis);

            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height - 5)
                .attr('text-anchor', 'middle')
                .text(parametro);

            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height + margin.bottom - 5)
                .attr('text-anchor', 'middle')
                .text('Valor');

            contador++;
        }
    }
}

// Función para generar la gráfica de barras con D3.js
function generarGraficoBarras(registro) {
    // Limpiar el área de información antes de añadir la nueva gráfica
    limpiarInfoArea();

    // Obtener el nombre del río y el punto
    const rio = registro['RIO']; // Asegúrate de que 'nombre_del_rio' es el nombre de la propiedad en tu registro
    const punto = registro['PUNTO']; // Asegúrate de que 'punto' es el nombre de la propiedad en tu registro

    // Datos para la gráfica
    const data = [
        { nivel: 'Nivel 10', valor: +registro['Nivel 10'] },
        { nivel: 'Nivel 9', valor: +registro['Nivel 9'] },
        { nivel: 'Nivel 8', valor: +registro['Nivel 8'] },
        { nivel: 'Nivel 7', valor: +registro['Nivel 7'] },
        { nivel: 'Nivel 6', valor: +registro['Nivel 6'] },
        { nivel: 'Nivel 5', valor: +registro['Nivel 5'] },
        { nivel: 'Nivel 4', valor: +registro['Nivel 4'] },
        { nivel: 'Nivel 3', valor: +registro['Nivel 3'] },
        { nivel: 'Nivel 2', valor: +registro['Nivel 2'] },
        { nivel: 'Nivel 1', valor: +registro['Nivel 1'] }
    ];

    // Crear contenedor para la gráfica
    const svgWidth = 500, svgHeight = 300;
    const margin = { top: 40, right: 30, bottom: 40, left: 50 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select('.info-area').append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    // Título del gráfico con nombre del río y punto
    svg.append('text')
        .attr('x', (svgWidth / 2))
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .text(`Comparación de los niveles de microorganismos en ${rio}, Punto ${punto}`);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Configurar escalas
    const x = d3.scaleBand()
        .domain(data.map(d => d.nivel))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.ceil(d.valor / 5) * 5)]) // Ajustar el dominio a múltiplos de 5
        .nice()
        .range([height, 0]);

    // Añadir ejes
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y));

    // Añadir barras
    g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.nivel))
        .attr('y', d => y(d.valor))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.valor))
        .attr('fill', 'steelblue');

    // Añadir valores dentro de las barras
    g.selectAll('.text')
        .data(data)
        .enter().append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.nivel) + x.bandwidth() / 2)
        .attr('y', d => y(d.valor) - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'black')
        .text(d => d.valor);
}
