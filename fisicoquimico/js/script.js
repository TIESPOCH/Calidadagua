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
    "RIO EL CHURO", "RIO MACUMA", "RIO PANGUIETZA", "RIO PASTAZA", "RIO PALORA", "RIO TUNA",
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
        limpiarVisualizaciones();
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
    const buscarBtn = document.getElementById('buscar-btn');
    buscarBtn.addEventListener('click', buscarDatos);
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
    d3.select("#grafico svg").remove();

    // Generar nuevo gráfico
    generarGrafico(datosFiltrados, puntoSeleccionado);
}

function limpiarVisualizaciones() {
    // Limpiar tabla
    actualizarTabla([], 'tabla2');
    
    // Limpiar gráficos
    d3.select("#grafico svg").remove();
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

    const camposAMostrar = ['ID', 'RIO', 'PUNTO', 'FECHA', 'Clasificacion ', 'Clasificar'];
    
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


function generarGrafico(data, puntoSeleccionado) {
    // Convertir fechas y clasificar a números
    data.forEach(d => {
        d.FECHA = d3.timeParse("%d/%m/%Y")(d.FECHA);
        d.Clasificar = +d.Clasificar;
    });

    // Ordenar los datos por fecha
    data.sort((a, b) => a.FECHA - b.FECHA);

    const margin = { top: 20, right: 20, bottom: 70, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#grafico").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.FECHA))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([1, 3])
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15', 'P16', 'P17', 'P18'])
        .range(['red', 'green', 'pink', 'red', 'blue', 'black', 'yellow', 'brown', 'gray', 'aqua', 'magenta', 'orange', 'turquoise', 'cyan', 'melon', 'darkred', 'purple', 'purple']);

    const line = d3.line()
        .x(d => x(d.FECHA))
        .y(d => y(d.Clasificar));

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    svg.append("g")
        .call(d3.axisLeft(y).ticks(3).tickFormat(d => {
            switch (d) {
                case 1: return "Buena";
                case 2: return "Regular";
                case 3: return "Mala";
                default: return d;
            }
        }));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color(puntoSeleccionado))
        .attr("stroke-width", 1.5)
        .attr("d", line);

    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.FECHA))
        .attr("cy", d => y(d.Clasificar))
        .attr("r", 3)
        .attr("fill", color(puntoSeleccionado))
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200).attr("r", 6);
            svg.append("text")
                .attr("class", "tooltip")
                .attr("x", x(d.FECHA))
                .attr("y", y(d.Clasificar) - 10)
                .attr("text-anchor", "middle")
                .text(d3.timeFormat("%d/%m/%Y")(d.FECHA));
        })
        .on("mouseout", function() {
            d3.select(this).transition().duration(200).attr("r", 3);
            svg.select(".tooltip").remove();
        });

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Clasificación del Agua por Fecha");
}
