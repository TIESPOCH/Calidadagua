let datosCSV = [];
let datosBiologicos = [];
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
        // Limpiar solo los gráficos, no la tabla
        limpiarGrafico();
        const nombreRioSeleccionado = selectRio.value;
        if (!nombreRioSeleccionado) {
            mostrarPopupError("Por favor, seleccione un río.");
            return;
        }
        const puntos = datosBiologicos
            .filter(dato => dato.RIO === nombreRioSeleccionado)
            .map(dato => dato.PUNTO)
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

    cargarDatosCSV('https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/tablabio.csv', 'tabla2');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');

    toggleBtn.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        const content = document.querySelector('.content');
        const icon = toggleBtn.querySelector('i');
    
        sidebar.classList.toggle('collapsed');
        content.classList.toggle('expanded');
    
        if (sidebar.classList.contains('collapsed')) {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
        } else {
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
        }
    });
});

function cargarDatosCSV(url, tablaId) {
    Papa.parse(url, {
        download: true,
        header: true,
        complete: function(results) {
            datosBiologicos = results.data;
            actualizarTabla(datosBiologicos, tablaId); // Actualizar la tabla después de cargar los datos
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

    let datosFiltrados = datosBiologicos.filter(dato => dato.RIO === nombreRioSeleccionado && dato.PUNTO === puntoSeleccionado);
    
    actualizarTabla(datosFiltrados, 'tabla2');
    
    // Limpiar cualquier gráfico previo
    limpiarGrafico();

    // Generar nuevos gráficos
    generarGrafico(datosFiltrados, puntoSeleccionado, '#grafico1');
    generarGraficoshanon(datosFiltrados, puntoSeleccionado, '#grafico2');
}

function limpiarGrafico() {
    d3.select("#grafico1 svg").remove();
    d3.select("#grafico2 svg").remove();
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

    const camposAMostrar = ['RIO','PUNTO','FECHA','ÍNDICE BMWP/Col.1','ÍNDICE BMWP/Col','DIVERSIDAD SEGÚN SHANNON','CALIDAD DEL AGUA SEGÚN SHANNON'];
    
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
    // Convertir fechas y el índice BMWP/Col a números
    data.forEach(d => {
        d.FECHA = new Date(d.FECHA); // Convertir la fecha a un objeto de fecha
        d['ÍNDICE BMWP/Col'] = +d['ÍNDICE BMWP/Col']; // Asegurarse de que ÍNDICE BMWP/Col es un número
    });

    // Encontrar la fecha mínima y máxima en los datos
    const minFecha = d3.min(data, d => d.FECHA);
    const maxFecha = d3.max(data, d => d.FECHA);

    // Filtrar los datos para empezar desde la fecha mínima encontrada
    data = data.filter(d => d.FECHA >= minFecha);

    // Ordenar los datos por fecha nuevamente
    data.sort((a, b) => a.FECHA - b.FECHA);

    // Ajustar el dominio del eje X dinámicamente según la densidad de las muestras
    let timeDiff = maxFecha - minFecha;
    let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    let ticksCount;

    if (daysDiff <= 180) {
        ticksCount = d3.timeMonth.every(1); // Si la diferencia es menor o igual a 6 meses
    } else if (daysDiff <= 365) {
        ticksCount = d3.timeMonth.every(3); // Si la diferencia es menor o igual a 1 año
    } else {
        ticksCount = d3.timeMonth.every(6); // Si la diferencia es mayor a 1 año
    }

    // Definir los colores para los rangos de calidad del agua (oscuros)
    const colorScale = d3.scaleThreshold()
        .domain([36, 49, 85])
        .range(['#D32F2F', '#FBC02D', '#228B22', '#00008B']);

    // Encontrar el mínimo y máximo de ÍNDICE BMWP/Col en los datos filtrados
    const minIndice = d3.min(data, d => d['ÍNDICE BMWP/Col']);
    const maxIndice = d3.max(data, d => d['ÍNDICE BMWP/Col']);

    // Definir el dominio del eje y extendido
    const yDomain = [minIndice, maxIndice + 3];

    const margin = { top: 50, right: 20, bottom: 70, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    const svg = d3.select(contenedor).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleTime()
        .domain([minFecha, maxFecha])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain(yDomain)
        .nice()
        .range([height, 0]);

    const line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => x(d.FECHA))
        .y(d => y(d['ÍNDICE BMWP/Col']));

    // Agregar ejes
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(ticksCount).tickFormat(d3.timeFormat("%b %Y")))
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
            { offset: "36%", color: '#FBC02D' },
            { offset: "49%", color: '#228B22' },
            { offset: "85%", color: '#00008B' }
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
        .attr("cy", d => y(d['ÍNDICE BMWP/Col']))
        .attr("r", 5)
        .attr("fill", "black")
        .attr("stroke", "white")
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200).attr("r", 8);

            const tooltipGroup = svg.append("g")
                .attr("class", "tooltip-group");

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
                .text("FECHA DE MUESTRA: " + d3.timeFormat("%d/%m/%Y")(d.FECHA));

            const text2 = tooltipGroup.append("text")
                .attr("x", 0)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .text("ÍNDICE BMWP/Col.: " + d['ÍNDICE BMWP/Col']);

            const text3 = tooltipGroup.append("text")
                .attr("x", 0)
                .attr("y", 18)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .text("Clasificación: " + d['ÍNDICE BMWP/Col.1']);

            const bbox = tooltipGroup.node().getBBox();
            background
                .attr("x", bbox.x - 10)
                .attr("y", bbox.y - 5)
                .attr("width", bbox.width + 20)
                .attr("height", bbox.height + 10);

            // Asegurar que el tooltip se muestre completamente dentro de los límites del gráfico
            let tooltipX = x(d.FECHA);
            let tooltipY = y(d['ÍNDICE BMWP/Col']) - 40;

            if (tooltipX + bbox.width / 2 + 10 > width) {
                tooltipX = width - bbox.width / 2 - 10;
            } else if (tooltipX - bbox.width / 2 - 10 < 0) {
                tooltipX = bbox.width / 2 + 10;
            }

            if (tooltipY - bbox.height - 10 < 0) {
                tooltipY = y(d['ÍNDICE BMWP/Col']) + bbox.height + 10;
            }

            tooltipGroup.attr("transform", `translate(${tooltipX},${tooltipY})`);
        })
        .on("mouseout", function() {
            d3.select(this).transition().duration(200).attr("r", 5);
            svg.select(".tooltip-group").remove();
        });

    // Agregar título
    const titulo = "Calidad del Agua con el ÍNDICE BMWP/Col.1 " + data[0].RIO + " en el punto " + puntoSeleccionado;
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text(titulo);

   // Agregar ícono de información
const infoIcon = svg.append("g")
.attr("class", "info-icon")
.attr("transform", `translate(730, -30)`)
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
.attr("x", 625)
.attr("y", 0)
.attr("width", 400)
.attr("height", 120)
.attr("fill", "white")
.attr("stroke", "black");

const legendData = [
{ label: 'Aguas muy limpias (≥ 86)', color: '#00008B' },
{ label: 'Aguas ligeramente contaminadas (60 - 85)', color: '#228B22' },
{ label: 'Aguas moderadamente contaminadas (37 - 49)', color: '#FBC02D' },
{ label: 'Aguas muy contaminadas (≤ 36)', color: '#D32F2F' }
];

legendGroup.selectAll("rect.legend-item")
.data(legendData)
.enter()
.append("rect")
.attr("class", "legend-item")
.attr("x", 630)
.attr("y", (d, i) => 20 + i * 20)
.attr("width", 18)
.attr("height", 18)
.attr("fill", d => d.color);

legendGroup.selectAll("text.legend-item")
.data(legendData)
.enter()
.append("text")
.attr("class", "legend-item")
.attr("x", 650)
.attr("y", (d, i) => 29 + i * 20)
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

    function generarGraficoshanon(data, puntoSeleccionado, contenedor) {
        // Convertir fechas y el índice DIVERSIDAD SEGÚN SHANNON a números
        data.forEach(d => {
            d.FECHA = new Date(d.FECHA); // Convertir la fecha a un objeto de fecha
            d['DIVERSIDAD SEGÚN SHANNON'] = +d['DIVERSIDAD SEGÚN SHANNON']; // Asegurarse de que DIVERSIDAD SEGÚN SHANNON es un número
        });
    
        // Encontrar la fecha mínima en los datos para definir el inicio del eje x
        const minFecha = d3.min(data, d => d.FECHA);
    
        // Filtrar los datos para empezar desde la fecha mínima encontrada
        data = data.filter(d => d.FECHA >= minFecha);
    
        // Ordenar los datos por fecha nuevamente
        data.sort((a, b) => a.FECHA - b.FECHA);
    
        // Definir el número de ticks en el eje x dependiendo de la cantidad de datos
        let ticksCount = data.length > 50 ? d3.timeMonth.every(3) : d3.timeMonth.every(6);
    
        // Encontrar el mínimo y máximo de DIVERSIDAD SEGÚN SHANNON en los datos filtrados
        const minIndice = d3.min(data, d => d['DIVERSIDAD SEGÚN SHANNON']);
        const maxIndice = d3.max(data, d => d['DIVERSIDAD SEGÚN SHANNON']);
    
        // Definir el dominio del eje y extendido
        const yDomain = [minIndice, maxIndice + 1];
    
        const margin = { top: 50, right: 20, bottom: 70, left: 50 },
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
    
        const svg = d3.select(contenedor).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        const x = d3.scaleTime()
            .domain([minFecha, d3.timeMonth.offset(new Date(2025, 0, 1), -6)]) // Ajustar el dominio de las fechas
            .range([0, width]);
    
        const y = d3.scaleLinear()
            .domain(yDomain)
            .nice() // Mejorar el aspecto del eje y extendido
            .range([height, 0]);
    
        const line = d3.line()
            .curve(d3.curveMonotoneX) // Aplicar la interpolación que pasa por los puntos
            .x(d => x(d.FECHA))
            .y(d => y(d['DIVERSIDAD SEGÚN SHANNON']));
    
        // Agregar ejes
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(ticksCount).tickFormat(d3.timeFormat("%b %Y")))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
    
        svg.append("g")
            .call(d3.axisLeft(y));
    
        // Agregar la línea
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#FBC02D")
            .attr("stroke-width", 1.5)
            .attr("d", line);
    
        // Agregar puntos y eventos de interacción
        svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", d => x(d.FECHA))
            .attr("cy", d => y(d['DIVERSIDAD SEGÚN SHANNON']))
            .attr("r", 5) // Aumentar el tamaño de los puntos para una mejor visualización
            .attr("fill", "black") // Puntos en color negro
            .attr("stroke", "white") // Borde blanco para destacar los puntos
            .on("mouseover", function(event, d) {
                d3.select(this).transition().duration(200).attr("r", 8); // Agrandar el punto al pasar el mouse
    
                const tooltipGroup = svg.append("g")
                    .attr("class", "tooltip-group");
    
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
                    .text("FECHA DE MUESTRA: " + d3.timeFormat("%d/%m/%Y")(d.FECHA));
    
                const text2 = tooltipGroup.append("text")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("text-anchor", "middle")
                    .style("font-size", "12px")
                    .text("DIVERSIDAD SEGÚN SHANNON: " + d['DIVERSIDAD SEGÚN SHANNON']);
    
                const text3 = tooltipGroup.append("text")
                    .attr("x", 0)
                    .attr("y", 18)
                    .attr("text-anchor", "middle")
                    .style("font-size", "12px")
                    .text("CALIDAD DEL AGUA SEGÚN SHANNON: " + d['CALIDAD DEL AGUA SEGÚN SHANNON']);
    
                const bbox = tooltipGroup.node().getBBox();
                background
                    .attr("x", bbox.x - 10)
                    .attr("y", bbox.y - 5)
                    .attr("width", bbox.width + 20)
                    .attr("height", bbox.height + 10);
    
                // Asegurar que el tooltip se muestre completamente dentro de los límites del gráfico
                let tooltipX = x(d.FECHA);
                let tooltipY = y(d['DIVERSIDAD SEGÚN SHANNON']) - 40;
    
                if (tooltipX + bbox.width / 2 + 10 > width) {
                    tooltipX = width - bbox.width / 2 - 10;
                } else if (tooltipX - bbox.width / 2 - 10 < 0) {
                    tooltipX = bbox.width / 2 + 10;
                }
    
                if (tooltipY - bbox.height - 10 < 0) {
                    tooltipY = y(d['DIVERSIDAD SEGÚN SHANNON']) + bbox.height + 10;
                }
    
                tooltipGroup.attr("transform", `translate(${tooltipX},${tooltipY})`);
            })
            .on("mouseout", function() {
                d3.select(this).transition().duration(200).attr("r", 5); // Restaurar tamaño original del punto
                svg.select(".tooltip-group").remove();
            });
    
        // Agregar título
        const titulo = "Diversidad Según Shannon en el río " + data[0].RIO + " en el punto " + puntoSeleccionado;
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2) // Mover el título hacia abajo para evitar que se vea tapado
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text(titulo);
    
     // Agregar ícono de información
const infoIcon = svg.append("g")
.attr("class", "info-icon")
.attr("transform", `translate(730, -30)`)
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
.attr("x", 625)
.attr("y", 0)
.attr("width", 400)
.attr("height", 120)
.attr("fill", "white")
.attr("stroke", "black");

 const legendData = [
            { label: 'CALIDAD DEL AGUA SEGÚN SHANNON', color: '#FBC02D' }
        ];
    
legendGroup.selectAll("rect.legend-item")
.data(legendData)
.enter()
.append("rect")
.attr("class", "legend-item")
.attr("x", 630)
.attr("y", (d, i) => 20 + i * 20)
.attr("width", 18)
.attr("height", 18)
.attr("fill", d => d.color);

legendGroup.selectAll("text.legend-item")
.data(legendData)
.enter()
.append("text")
.attr("class", "legend-item")
.attr("x", 650)
.attr("y", (d, i) => 29 + i * 20)
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
    