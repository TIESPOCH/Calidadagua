let datosCSV = [];
let datosFisicoquimicos = [];
let rios = [
    "RIO HUASAGA", "RIO CHAPIZA", "RIO ZAMORA", "RIO UPANO", "RIO JURUMBAINO",
    "RIO KALAGLAS", "RIO YUQUIPA", "RIO PAN DE AZÚCAR",
    "RIO BLANCO", "RIO TUTANANGOZA", "RIO INDANZA", "RIO MIRIUMI ",
    "RIO YUNGANZA", "RIO CUYES", "RIO ZAMORA", "RIO EL IDEAL", "RIO MORONA",
    "RIO MUCHINKIN", "RIO NAMANGOZA", "RIO SANTIAGO", "RIO PASTAZA", "RIO CHIWIAS",
    "RIO TUNA CHIGUAZA", "RÍO PALORA", "RIO LUSHIN", "RIO SANGAY", "RIO NAMANGOZA",
    "RIO PAUTE", "RIO YAAPI", "RIO HUAMBIAZ", "RIO TZURIN", "RIO MANGOSIZA", "RIO PUCHIMI",
    "RIO EL CHURO", "RIO MACUMA", "RIO PANGUIETZA", "RIO PASTAZA", "RIO PALORA", "RIO TUNA ",
    "RIO WAWAIM GRANDE", "RIO LUSHIN"
];

document.addEventListener("DOMContentLoaded", function () {
    const selectRio = document.getElementById('rio-select');
    const selectPuntos = document.getElementById('puntos-select');
    rios.forEach(rio => {
        const option = document.createElement('option');
        option.value = rio;
        option.text = rio;
        selectRio.add(option);
    });

    selectRio.addEventListener('change', function() {
        limpiarGrafico(); // Solo limpiar gráficos, no la tabla
        const nombreRioSeleccionado = selectRio.value;
        if (!nombreRioSeleccionado) {
            mostrarPopupError("Por favor, seleccione un río.");
            return;
        }
        const puntos = datosFisicoquimicos
            .filter(dato => dato.RIO === nombreRioSeleccionado)
            .map(dato => dato.PUNTO) // Cambia 'PUNTO' por el nombre de la columna que tiene los puntos
            .filter((v, i, a) => a.indexOf(v) === i); // Eliminar duplicados

        selectPuntos.innerHTML = '<option value="">Seleccione un punto</option>';
        puntos.forEach(punto => {
            const option = document.createElement('option');
            option.value = punto;
            option.text = punto;
            selectPuntos.add(option);
        });
    });

    selectPuntos.addEventListener('change', function() {
        buscarDatos();
    });

    cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/Parametrosfisio.csv', 'tabla2');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    toggleBtn.addEventListener("click", function () {
        const sidebar = document.querySelector(".sidebar");
        const content = document.querySelector(".content");
        const icon = toggleBtn.querySelector("i");
    
        sidebar.classList.toggle("collapsed");
        content.classList.toggle("expanded");
    
        if (sidebar.classList.contains("collapsed")) {
          icon.classList.remove("fa-chevron-right");
          icon.classList.add("fa-chevron-left");
        } else {
          icon.classList.remove("fa-chevron-left");
          icon.classList.add("fa-chevron-right");
        }
      });
});

function cargarDatosCSV(url, tablaId) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: function(results) {
            datosFisicoquimicos = results.data;
            actualizarTabla(datosFisicoquimicos, tablaId); // Actualizar la tabla después de cargar los datos
        },
        error: function(error) {
            mostrarPopupError("Error al cargar el archivo CSV: " + error.message);
        }
    });
}

function buscarDatos() {
    const selectRios = document.getElementById('rio-select');
    const selectPuntos = document.getElementById('puntos-select');
    const nombreRioSeleccionado = selectRios.value;
    const puntoSeleccionado = selectPuntos.value;

    if (!nombreRioSeleccionado) {
        mostrarPopupError("Por favor, seleccione un río.");
        return;
    }

    if (!puntoSeleccionado) {
        mostrarPopupError("Por favor, seleccione un punto.");
        return;
    }

    let datosFiltrados = datosFisicoquimicos.filter(dato => dato.RIO === nombreRioSeleccionado && dato.PUNTO === puntoSeleccionado);
    
    actualizarTabla(datosFiltrados, 'tabla2');
    
    // Limpiar cualquier gráfico previo
    limpiarGrafico();

    // Generar nuevo gráfico
    generarGrafico(datosFiltrados, puntoSeleccionado, '#grafico1');
    generarGrafico2(datosFiltrados, '#grafico2');
    generarGrafico3(datosFiltrados, '#grafico3');
    generarGrafico4(datosFiltrados, '#grafico4');
    generarGrafico5(datosFiltrados, '#grafico5');
    generarGrafico6(datosFiltrados, '#grafico6');
    generarGrafico7(datosFiltrados, '#grafico7');
    generarGrafico8(datosFiltrados, '#grafico8');
    generarGrafico9(datosFiltrados, '#grafico9');
}

function limpiarGrafico() {
    d3.select("#grafico1 svg").remove();
    d3.select("#grafico2 svg").remove();
    d3.select("#grafico3 svg").remove();
    d3.select("#grafico4 svg").remove();
    d3.select("#grafico5 svg").remove();
    d3.select("#grafico6 svg").remove();
    d3.select("#grafico7 svg").remove();
    d3.select("#grafico8 svg").remove();
    d3.select("#grafico9 svg").remove();
}

function mostrarPopupError(mensaje) {
    const popup = document.getElementById('error-popup');
    const popupText = document.getElementById('error-popup-text');
    popupText.textContent = mensaje;
    popup.style.display = 'block';
}

function cerrarPopup() {
    const popup = document.getElementById('error-popup');
    popup.style.display = 'none';
}

function actualizarTabla(datos, tablaId) {
    const tabla = document.getElementById(tablaId);
    const thead = tabla.querySelector('thead tr');
    const tbody = tabla.querySelector('tbody');
    
    // Limpiar tabla
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    if (datos.length === 0) return;

    const camposAMostrar = ['RIO', 'FECHA', 'Clasificacion ','Temperatura','Ph','Oxigeno disuelto','Nitratos','Fosfatos','DBO5', 'CALIDAD AGUA NSF'];
    
    // Llenar encabezado
    camposAMostrar.forEach(campo => {
        const th = document.createElement('th');
        th.textContent = campo;
        thead.appendChild(th);
    });
    
    // Llenar cuerpo
    datos.forEach(dato => {
        const tr = document.createElement('tr');
        camposAMostrar.forEach(campo => {
            const td = document.createElement('td');
            td.textContent = dato[campo];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}
function generarGrafico2(datos, contenedor) {
    // Transformar datos para Google Charts
    const datosGrafico = [['Fecha', 'Temperatura']];
    datos.forEach(dato => {
        datosGrafico.push([new Date(dato.FECHA), parseFloat(dato.Temperatura)]);
    });

    // Cargar Google Charts
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico);
        
        const containerElement = document.querySelector(contenedor);
        
        function draw() {
            const width = containerElement.clientWidth;
            const height = containerElement.clientHeight || 400; // Altura predeterminada si no se establece

            const options = {
                title: 'Temperatura a lo largo del tiempo',
                titleTextStyle: {
                    fontSize: 16, 
                    bold: true,   
                    color: 'black',
                    italic: false ,
                     color: 'black'
                },
                hAxis: {
                    title: 'Fecha',
                    format: 'yyyy',
                    gridlines: { count: 15 },
                    slantedText: true,
                    slantedTextAngle: 45,
                     color: 'black'
                },
                vAxis: {
                    title: 'Temperatura (°C)',
                    viewWindow: {
                        min: Math.min(...datosGrafico.slice(1).map(d => d[1])),
                        max: Math.max(...datosGrafico.slice(1).map(d => d[1]))
                    }
                },
                legend: { position: 'none' },
                width: width,
                height: height,
                bar: { groupWidth: '80%' },
                explorer: {
                    actions: ['dragToZoom', 'rightClickToReset'],
                    axis: 'horizontal',
                    keepInBounds: true
                }
            };

            const chart = new google.visualization.ColumnChart(containerElement);
            chart.draw(data, options);
        }

        draw(); // Dibujar gráfico inicialmente

        // Redibujar gráfico cuando la ventana cambia de tamaño
        window.addEventListener('resize', draw);
    }
}



function generarGrafico3(datos, contenedor) {
    // Transformar datos para Google Charts
    const datosGrafico = [['Fecha', 'pH']];
    datos.forEach(dato => {
        datosGrafico.push([new Date(dato.FECHA), parseFloat(dato.Ph)]);
    });

    // Cargar Google Charts
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico);
        
        const containerElement = document.querySelector(contenedor);
        
        function draw() {
            const width = containerElement.clientWidth;
            const height = containerElement.clientHeight || 400; // Altura predeterminada si no se establece

            const options = {
                title: 'pH a lo largo del tiempo',
                titleTextStyle: {
                    fontSize: 16, // Tamaño de fuente del título
                    bold: true,   // Hacer el título en negrita
                    color: 'black', // Color del título
                    italic: false // No usar cursiva
                },
                hAxis: {
                    title: 'Fecha',
                    format: 'yyyy', // Mostrar solo años
                    gridlines: { count: 15 },
                    slantedText: true, // Rotar las etiquetas si es necesario
                    color: 'black', // Color del título
                    slantedTextAngle: 45 // Ángulo de rotación de las etiquetas
                },
                vAxis: {
                    title: 'pH',
                    viewWindow: {
                        min: Math.min(...datosGrafico.slice(1).map(d => d[1])),
                        max: Math.max(...datosGrafico.slice(1).map(d => d[1]))
                    }
                },
                legend: { position: 'none' },
                areaOpacity: 0.3, // Transparencia del área
                curveType: 'function', // Suavizar las líneas
                pointSize: 5, // Tamaño de los puntos en el gráfico
                width: width,
                height: height,
                explorer: {
                    actions: ['dragToZoom', 'rightClickToReset'], // Habilitar zoom y reinicio
                    axis: 'horizontal', // Aplicar zoom en el eje horizontal
                    keepInBounds: true // Mantener dentro de los límites del gráfico
                }
            };

            const chart = new google.visualization.AreaChart(containerElement);
            chart.draw(data, options);
        }

        draw(); // Dibujar gráfico inicialmente

        // Redibujar gráfico cuando la ventana cambia de tamaño
        window.addEventListener('resize', draw);
    }
}

function generarGrafico4(datos, contenedor) {
    // Transformar datos para Google Charts
    const datosGrafico = [['Año', 'Oxígeno Disuelto']];

    // Extraer y procesar datos
    datos.forEach(dato => {
        const fecha = new Date(dato.FECHA);
        const oxigenoDisuelto = parseFloat(dato['Oxigeno disuelto']);
        datosGrafico.push([fecha, oxigenoDisuelto]);
    });

    // Cargar Google Charts
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico);

        const containerElement = document.querySelector(contenedor);
        
        function draw() {
            const width = containerElement.clientWidth;
            const height = containerElement.clientHeight || 400; // Altura predeterminada si no se establece

            const options = {
                title: 'Oxígeno Disuelto a lo largo del tiempo',
                titleTextStyle: {
                    fontSize: 16, // Tamaño de fuente del título
                    bold: true,   // Hacer el título en negrita
                    color: '#333', // Color del título
                    italic: false // No usar cursiva
                },
                hAxis: {
                    title: 'Año',
                    format: 'yyyy', // Mostrar solo el año como texto
                    gridlines: { count: 6 }, // Controlar el número de líneas de cuadrícula
                    ticks: Array.from(new Set(datosGrafico.slice(1).map(d => d[0]))) // Crear ticks únicos para los años
                },
                vAxis: {
                    title: 'Oxígeno Disuelto',
                    viewWindow: {
                        min: Math.min(...datosGrafico.slice(1).map(d => d[1])),
                        max: Math.max(...datosGrafico.slice(1).map(d => d[1]))
                    }
                },
                legend: { position: 'none' },
                areaOpacity: 0.3, // Transparencia del área
                curveType: 'function', // Suavizar las líneas
                pointSize: 5, // Tamaño de los puntos en el gráfico
                width: width,
                height: height,
                explorer: {
                    actions: ['dragToZoom', 'rightClickToReset'], // Habilitar zoom y reinicio
                    axis: 'horizontal', // Aplicar zoom en el eje horizontal
                    keepInBounds: true // Mantener dentro de los límites del gráfico
                }
            };

            const chart = new google.visualization.AreaChart(containerElement);
            chart.draw(data, options);
        }

        draw(); // Dibujar gráfico inicialmente

        // Redibujar gráfico cuando la ventana cambia de tamaño
        window.addEventListener('resize', draw);
    }
}


function generarGrafico5(datos, contenedor) {
    // Transformar datos para Google Charts
    const datosGrafico = [['Fecha', 'Nitratos', { role: 'tooltip', type: 'string', p: { html: true } }]];
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    // Extraer y procesar datos
    datos.forEach(dato => {
        const fecha = new Date(dato.FECHA);
        const año = fecha.getFullYear().toString();
        const mes = meses[fecha.getMonth()];
        const dia = fecha.getDate();
        const nitratos = parseFloat(dato['Nitratos']);
        const fechaFormateada = `${mes} ${dia}, ${fecha.getFullYear()}`;
        
        datosGrafico.push([año, nitratos, ` ${fechaFormateada}<br>Nitratos: ${nitratos}`]);
    });

    // Cargar Google Charts
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico);

        const containerElement = document.querySelector(contenedor);
        
        function draw() {
            const width = containerElement.clientWidth;
            const height = containerElement.clientHeight || 400;

            const options = {
                title: 'Comparación de Nitratos por Fecha',
                titleTextStyle: {
                    fontSize: 16, // Tamaño de fuente del título
                    bold: true,   // Hacer el título en negrita
                    color: 'black', // Color del título
                    italic: false // No usar cursiva
                },
                hAxis: {
                    title: 'Nitratos',
                    titleTextStyle: { color: 'black' }
                },
                vAxis: {
                    title: 'Fecha',
                    titleTextStyle: {  color: 'black' },
                    gridlines: { count: -1 } // Ajustar líneas de cuadrícula
                },
                legend: { position: 'none' },
                tooltip: { isHtml: true }, // Permitir HTML en tooltips para mantener el formato de fecha y nitratos
                width: width,
                height: height,
                explorer: {
                    actions: ['dragToZoom', 'rightClickToReset'], // Habilitar zoom y reinicio
                    axis: 'horizontal', // Aplicar zoom en el eje horizontal
                    keepInBounds: true // Mantener dentro de los límites del gráfico
                }
            };

            const chart = new google.visualization.BarChart(containerElement);
            chart.draw(data, options);
        }

        draw(); // Dibujar gráfico inicialmente

        // Redibujar gráfico cuando la ventana cambia de tamaño
        window.addEventListener('resize', draw);
    }
}

function generarGrafico6(datos, contenedor) {
    // Transformar datos para Google Charts
    const datosGrafico = [['Fecha', 'Fosfatos', { role: 'tooltip', type: 'string', p: { html: true } }]];
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    // Extraer y procesar datos
    datos.forEach(dato => {
        const fecha = new Date(dato.FECHA);
        const año = fecha.getFullYear().toString();
        const mes = meses[fecha.getMonth()];
        const dia = fecha.getDate();
        const fosfatos = parseFloat(dato['Fosfatos']);
        const fechaFormateada = `${mes} ${dia}, ${fecha.getFullYear()}`;
        
        datosGrafico.push([año, fosfatos, `<div><b>Fecha:</b> ${fechaFormateada}<br><b>Fosfatos:</b> ${fosfatos}</div>`]);
    });

    // Cargar Google Charts
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico);

        const containerElement = document.querySelector(contenedor);

        function draw() {
            const width = containerElement.clientWidth;
            const height = containerElement.clientHeight || 400;

            const options = {
                title: 'Comparación de Fosfatos por Fecha',
                titleTextStyle: {
                    fontSize: 16, // Tamaño de fuente del título
                    bold: true,   // Hacer el título en negrita
                    color: '#333', // Color del título
                    italic: false // No usar cursiva
                },
                hAxis: {
                    title: 'Fosfatos',
                    titleTextStyle: { color: '#333' },
                    minValue: 0 // Asegura que la escala comience en 0
                },
                vAxis: {
                    title: 'Año',
                    titleTextStyle: { color: '#333' }
                },
                legend: { position: 'none' },
                tooltip: { isHtml: true }, // Permitir HTML en tooltips para mantener el formato de fecha y fosfatos
                width: width,
                height: height,
                explorer: {
                    actions: ['dragToZoom', 'rightClickToReset'], // Habilitar zoom y reinicio
                    axis: 'horizontal', // Aplicar zoom en el eje horizontal
                    keepInBounds: true // Mantener dentro de los límites del gráfico
                }
            };

            const chart = new google.visualization.BarChart(containerElement);
            chart.draw(data, options);
        }

        draw(); // Dibujar gráfico inicialmente

        // Redibujar gráfico cuando la ventana cambia de tamaño
        window.addEventListener('resize', draw);
    }
}

function generarGrafico7(datos, contenedor) {
    // Transformar datos para Google Charts
    const datosGrafico = [['Fecha', 'Turbiedad']];

    // Extraer y procesar datos
    datos.forEach(dato => {
        const fecha = new Date(dato.FECHA);
        const turbiedad = parseFloat(dato['Turbiedad']);
        datosGrafico.push([fecha, turbiedad]); // Añadir fecha y turbiedad
    });

    // Cargar Google Charts
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico);

        const containerElement = document.querySelector(contenedor);

        function draw() {
            const width = containerElement.clientWidth;
            const height = containerElement.clientHeight || 400; // Altura por defecto si no se establece ninguna

            const options = {
                title: 'Turbiedad a lo largo del tiempo',
                titleTextStyle: {
                    fontSize: 16, // Tamaño de fuente del título
                    bold: true,   // Hacer el título en negrita
                    color: '#333', // Color del título
                    italic: false // No usar cursiva
                },
                hAxis: {
                    title: 'Fecha',
                    format: 'yyyy', // Formato de fecha en el eje X
                    slantedText: true, // Inclinar el texto para mejor legibilidad
                    slantedTextAngle: 45 // Ángulo de inclinación del texto
                },
                vAxis: {
                    title: 'Turbiedad',
                    titleTextStyle: { color: '#333' }
                },
                legend: { position: 'none' },
                width: width,
                height: height,
                explorer: {
                    actions: ['dragToZoom', 'rightClickToReset'], // Habilitar zoom y reinicio
                    axis: 'horizontal', // Aplicar zoom en el eje horizontal
                    keepInBounds: true // Mantener dentro de los límites del gráfico
                }
            };

            const chart = new google.visualization.ColumnChart(containerElement);
            chart.draw(data, options);
        }

        draw(); // Dibujar gráfico inicialmente

        // Redibujar gráfico cuando la ventana cambia de tamaño
        window.addEventListener('resize', draw);
    }
}


function generarGrafico8(datos, contenedor) {
    // Transformar datos para Google Charts
    const datosGrafico = [['Fecha', 'DBO5']];

    // Extraer y procesar datos
    datos.forEach(dato => {
        const fecha = new Date(dato.FECHA);
        const dbo5 = parseFloat(dato['DBO5']);
        datosGrafico.push([fecha, dbo5]); // Añadir fecha y DBO5
    });

    // Cargar Google Charts
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico);

        const containerElement = document.querySelector(contenedor);

        function draw() {
            const width = containerElement.clientWidth;
            const height = containerElement.clientHeight || 400; // Altura por defecto si no se establece ninguna

            const options = {
                title: 'DBO5 a lo largo del tiempo',
                titleTextStyle: {
                    fontSize: 16, // Tamaño de fuente del título
                    bold: true,   // Hacer el título en negrita
                    color: '#333', // Color del título
                    italic: false // No usar cursiva
                },
                hAxis: {
                    title: 'Fecha',
                    format: 'yyyy', // Formato de fecha en el eje X
                    slantedText: true, // Inclinar el texto para mejor legibilidad
                    slantedTextAngle: 45 // Ángulo de inclinación del texto
                },
                vAxis: {
                    title: 'DBO5',
                    titleTextStyle: { color: '#333' }
                },
                legend: { position: 'none' },
                width: width,
                height: height,
                curveType: 'function', // Suavizar las líneas
                explorer: {
                    actions: ['dragToZoom', 'rightClickToReset'], // Habilitar zoom y reinicio
                    axis: 'horizontal', // Aplicar zoom en el eje horizontal
                    keepInBounds: true // Mantener dentro de los límites del gráfico
                },
                pointSize: 5 // Tamaño de los puntos en el gráfico
            };

            const chart = new google.visualization.LineChart(containerElement);
            chart.draw(data, options);
        }

        draw(); // Dibujar gráfico inicialmente

        // Redibujar gráfico cuando la ventana cambia de tamaño
        window.addEventListener('resize', draw);
    }
}

function generarGrafico9(datos, contenedor) {
    // Transformar datos para Google Charts
    const datosGrafico = [['Clasificación', 'Cantidad']];

    // Contar la cantidad de cada clasificación
    const clasificacionesCount = {};
    datos.forEach(dato => {
        const clasificacion = dato['Clasificacion ']; // Usar el nombre exacto de la columna
        if (clasificacionesCount[clasificacion]) {
            clasificacionesCount[clasificacion]++;
        } else {
            clasificacionesCount[clasificacion] = 1;
        }
    });

    // Preparar datos para el gráfico
    Object.keys(clasificacionesCount).forEach(clasificacion => {
        datosGrafico.push([clasificacion, clasificacionesCount[clasificacion]]);
    });

    // Cargar Google Charts
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        const data = google.visualization.arrayToDataTable(datosGrafico);

        const containerElement = document.querySelector(contenedor);

        function draw() {
            const width = containerElement.clientWidth;
            const height = containerElement.clientHeight || 400; // Altura por defecto si no se establece ninguna

            // Mapear clasificaciones a colores
            const colores = {
                'Buena': '#4CAF50',   // Verde
                'Regular': '#FF9800', // Naranja
                'Mala': '#F44336'     // Rojo
            };

            // Crear un array de colores según el orden de las clasificaciones en los datos
            const colorArray = datosGrafico.slice(1).map(row => colores[row[0]] || '#000000'); // Default color (black) in case of unexpected value

            const options = {
                title: 'Distribución de Clasificaciones',
                titleTextStyle: {
                    fontSize: 16, // Tamaño de fuente del título
                    bold: true,   // Hacer el título en negrita
                    color: '#333', // Color del título
                    italic: false // No usar cursiva
                },
                pieSliceText: 'label', // Mostrar etiquetas en las rebanadas
                legend: { position: 'right' },
                pieStartAngle: 100, // Ajustar el ángulo de inicio de la gráfica
                width: width,
                height: height,
                colors: colorArray // Aplicar colores a los segmentos del gráfico
            };

            const chart = new google.visualization.PieChart(containerElement);
            chart.draw(data, options);
        }

        draw(); // Dibujar gráfico inicialmente

        // Redibujar gráfico cuando la ventana cambia de tamaño
        window.addEventListener('resize', draw);
    }
}


function generarGrafico(data, puntoSeleccionado, contenedor) {
    // Convertir fechas y calidad del agua a números
    data.forEach(d => {
        d.FECHA = new Date(d.FECHA);
        d['CALIDAD AGUA NSF'] = +d['CALIDAD AGUA NSF'];
    });

    // Ordenar los datos por fecha
    data.sort((a, b) => a.FECHA - b.FECHA);

    // Definir los colores para los rangos de calidad del agua
    const colorScale = d3.scaleThreshold()
        .domain([50.09, 68.25])
        .range(['#D32F2F', '#FBC02D', '#388E3C']); 

    // Encontrar el mínimo y máximo de CALIDAD AGUA NSF en los datos filtrados
    const minCalidadAgua = d3.min(data, d => d['CALIDAD AGUA NSF']);
    const maxCalidadAgua = d3.max(data, d => d['CALIDAD AGUA NSF']);

    // Definir el dominio del eje y extendido
    const yDomain = [Math.min(40, minCalidadAgua), Math.max(75, maxCalidadAgua)];

    // Obtener las dimensiones del contenedor
    const containerWidth = d3.select(contenedor).node().clientWidth;
    const containerHeight = d3.select(contenedor).node().clientHeight;

    const margin = { top: 20, right: 20, bottom: 70, left: 50 },
        width = containerWidth - margin.left - margin.right,
        height = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(contenedor).append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleTime()
        .domain([d3.min(data, d => d.FECHA), new Date(2024, 0, 1)]) // Extender hasta 2024
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain(yDomain)
        .range([height, 0]);

    // Añadir líneas entrecortadas cada 5 unidades en el eje Y con colores de rango
    const yTickValues = d3.range(Math.floor(yDomain[0] / 5) * 5, Math.ceil(yDomain[1] / 5) * 5 + 5, 5);

    yTickValues.forEach(tickValue => {
        const color = colorScale(tickValue);
        svg.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(tickValue))
            .attr("y2", y(tickValue))
            .attr("stroke", color)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5");
    });

    const line = d3.line()
        .curve(d3.curveMonotoneX) 
        .x(d => x(d.FECHA))
        .y(d => y(d['CALIDAD AGUA NSF']));

    // Agregar ejes
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    svg.append("g")
        .call(d3.axisLeft(y));

    // Agregar la línea negra
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    // Agregar puntos y eventos de interacción
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.FECHA))
        .attr("cy", d => y(d['CALIDAD AGUA NSF']))
        .attr("r", 5)
        .attr("fill", "black")
        .attr("stroke", "white")
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200).attr("r", 6);

            const tooltipGroup = svg.append("g")
                .attr("class", "tooltip-group")
                .attr("transform", `translate(${x(d.FECHA)+50},${y(d['CALIDAD AGUA NSF']) +50})`);

            const background = tooltipGroup.append("rect")
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("rx", 5)
                .attr("ry", 5);

            const text1 = tooltipGroup.append("text")
                .attr("x", 0)
                .attr("y", -18)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .text("CALIDAD DE AGUA NSF: " + d['CALIDAD AGUA NSF']);

            const text2 = tooltipGroup.append("text")
                .attr("x", 0)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .text("FECHA DE MUESTRA: " + d3.timeFormat("%d/%m/%Y")(d.FECHA));

            const text3 = tooltipGroup.append("text")
                .attr("x", 0)
                .attr("y", 18)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .text("Clasificación: " + d['Clasificacion ']);

            const bbox = tooltipGroup.node().getBBox();
            background
                .attr("x", bbox.x - 10)
                .attr("y", bbox.y - 5)
                .attr("width", bbox.width + 20)
                .attr("height", bbox.height + 10);

            // Ajuste de la posición del tooltip para que no se salga del gráfico
            let tooltipX = x(d.FECHA);
            let tooltipY = y(d["CALIDAD AGUA NSF"]) - 40;

            if (tooltipX + bbox.width / 2 + 10 > width) {
                tooltipX = width - bbox.width / 2 - 10;
            } else if (tooltipX - bbox.width / 2 - 10 < 0) {
                tooltipX = bbox.width / 2 + 10;
            }

            if (tooltipY - bbox.height - 10 < 0) {
                tooltipY = y(d["CALIDAD AGUA NSF"]) + bbox.height + 10;
            }

            tooltipGroup.attr("transform", `translate(${tooltipX},${tooltipY})`);
        })
        .on("mouseout", function() {
            d3.select(this).transition().duration(200).attr("r", 5);
            svg.select(".tooltip-group").remove();
        });

    // Agregar título
    const titulo = "Calidad del Agua NSF en el " + data[0].RIO + " en el punto " + puntoSeleccionado;
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 3)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text(titulo);

    // Agregar ícono de información y leyenda (igual que antes)

    // Manejar el redimensionamiento del gráfico cuando la ventana cambia de tamaño
    window.addEventListener('resize', () => {
        // Eliminar el SVG existente
        d3.select(contenedor).select("svg").remove();
        // Generar de nuevo el gráfico con las nuevas dimensiones
        generarGrafico(data, puntoSeleccionado, contenedor);
    });

    return svg;
}
