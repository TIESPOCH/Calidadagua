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
    toggleBtn.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('collapsed');
        const content = document.querySelector('.content');
        content.classList.toggle('expanded');
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
}

function limpiarGrafico() {
    d3.select("#grafico1 svg").remove();
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

    const camposAMostrar = ['RIO', 'FECHA', 'Clasificacion ', 'CALIDAD AGUA NSF'];
    
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


function generarGrafico(data, puntoSeleccionado, contenedor) {
    // Convertir fechas y calidad del agua a números
    data.forEach(d => {
        d.FECHA = new Date(d.FECHA); // Convertir la fecha a un objeto de fecha
        d['CALIDAD AGUA NSF'] = +d['CALIDAD AGUA NSF']; // Asegurarse de que CALIDAD AGUA NSF es un número
    });

    // Ordenar los datos por fecha
    data.sort((a, b) => a.FECHA - b.FECHA);

    // Definir los colores para los rangos de calidad del agua
    const colorScale = d3.scaleThreshold()
        .domain([50.09, 68.25])
        .range(['#D32F2F', '#FBC02D', '#388E3C']); // Colores más oscuros

    // Encontrar el mínimo y máximo de CALIDAD AGUA NSF en los datos filtrados
    const minCalidadAgua = d3.min(data, d => d['CALIDAD AGUA NSF']);
    const maxCalidadAgua = d3.max(data, d => d['CALIDAD AGUA NSF']);

    // Definir el dominio del eje y extendido
    const yDomain = [minCalidadAgua, maxCalidadAgua + 3];

    const margin = { top: 20, right: 20, bottom: 70, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    const svg = d3.select(contenedor).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleTime()
        .domain([d3.min(data, d => d.FECHA), new Date(2025, 0, 1)]) // Extender hasta 2025
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain(yDomain)
        .range([height, 0]);

    const line = d3.line()
        .curve(d3.curveMonotoneX) // Aplicar la interpolación que pasa por los puntos
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

    // Agregar la línea con degradado de color
    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "line-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", y(yDomain[0]))
        .attr("x2", 0)
        .attr("y2", y(yDomain[1]));

    gradient.selectAll("stop")
        .data([
            { offset: "0%", color: '#D32F2F' },
            { offset: "50%", color: '#FBC02D' },
            { offset: "100%", color: '#388E3C' }
        ])
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "url(#line-gradient)")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    // Agregar puntos y eventos de interacción
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.FECHA))
        .attr("cy", d => y(d['CALIDAD AGUA NSF']))
        .attr("r", 3)
        .attr("fill", "black") // Puntos en color negro
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200).attr("r", 6);

            const tooltipGroup = svg.append("g")
                .attr("class", "tooltip-group")
                .attr("transform", `translate(${x(d.FECHA)},${y(d['CALIDAD AGUA NSF']) - 40})`);

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
        })
        .on("mouseout", function() {
            d3.select(this).transition().duration(200).attr("r", 3);
            svg.select(".tooltip-group").remove();
        });

    // Agregar título
    const titulo = "Calidad del Agua NSF en el " + data[0].RIO + " en el punto " + puntoSeleccionado;
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 3) // Mover el título hacia abajo para evitar que se vea tapado
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text(titulo);

        
// Agregar ícono de información
const infoIcon = svg.append("g")
    .attr("class", "info-icon")
    .attr("transform", `translate(${width - 80}, 20)`)
    .on("mouseover", function() {
        legendGroup.style("display", "block");
    })
    .on("mouseout", function() {
        legendGroup.style("display", "none");
    });

infoIcon.append("circle")
    .attr("r", 10)
    .attr("fill", "lightblue")
    .attr("stroke", "black");

infoIcon.append("text")
    .attr("x", 0)
    .attr("y", 4)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .text("i");

// Agregar contenedor de la leyenda (oculto por defecto)
const legendGroup = svg.append("g")
    .attr("class", "legend-group")
    .style("display", "none");

const legendBackground = legendGroup.append("rect")
    .attr("x", width - 200) // Ajustar la posición x del cuadro de la leyenda
    .attr("y", 60) // Ajustar la posición y del cuadro de la leyenda
    .attr("width", 180)
    .attr("height", 80)
    .attr("fill", "white")
    .attr("stroke", "black");

    const legendData = [
        { label: 'Buena (> 68.25)', color: '#388E3C' },
        { label: 'Regular (41.08 - 68.25)', color: '#FBC02D' },
        { label: 'Malo (< 41.08)', color: '#D32F2F' }
    ];


legendGroup.selectAll("rect.legend-item")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("x", width - 190) // Ajustar la posición x de los elementos de la leyenda
    .attr("y", (d, i) => 70 + i * 20) // Ajustar la posición y de los elementos de la leyenda
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", d => d.color);

legendGroup.selectAll("text.legend-item")
    .data(legendData)
    .enter()
    .append("text")
    .attr("class", "legend-item")
    .attr("x", width - 170) // Ajustar la posición x de los elementos de texto de la leyenda
    .attr("y", (d, i) => 79 + i * 20) // Ajustar la posición y de los elementos de texto de la leyenda
    .attr("dy", ".35em")
    .attr("font-size", "12px")
    .text(d => d.label);

    // Mostrar la leyenda al pasar el mouse sobre el ícono de información
    infoIcon.on("mouseover", function() {
        legendGroup.style("display", "block");
    });

    // Ocultar la leyenda cuando el mouse sale del ícono de información
    infoIcon.on("mouseout", function() {
        legendGroup.style("display", "none");
    });

    // Retornar el objeto SVG para poder modificarlo más tarde si es necesario
    return svg;
}
