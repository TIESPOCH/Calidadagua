let datosCSV = [];
let datosBiologicos = [];
let rios = [
  "RIO HUASAGA",
  "RIO CHAPIZA",
  "RIO ZAMORA",
  "RIO UPANO",
  "RIO JURUMBAINO",
  "RIO KALAGLAS",
  "RIO YUQUIPA",
  "RIO PAN DE AZÚCAR",
  "RIO BLANCO",
  "RIO TUTANANGOZA",
  "RIO INDANZA",
  "RIO MIRIUMI ",
  "RIO YUNGANZA",
  "RIO CUYES",
  "RIO ZAMORA",
  "RIO EL IDEAL",
  "RIO MORONA",
  "RIO MUCHINKIN",
  "RIO NAMANGOZA",
  "RIO SANTIAGO",
  "RIO PASTAZA",
  "RIO CHIWIAS",
  "RIO TUNA CHIGUAZA",
  "RÍO PALORA",
  "RIO LUSHIN",
  "RIO SANGAY",
  "RIO NAMANGOZA",
  "RIO PAUTE",
  "RIO YAAPI",
  "RIO HUAMBIAZ",
  "RIO TZURIN",
  "RIO MANGOSIZA",
  "RIO PUCHIMI",
  "RIO EL CHURO",
  "RIO MACUMA",
  "RIO PANGUIETZA",
  "RIO PASTAZA",
  "RIO PALORA",
  "RIO TUNA ",
  "RIO WAWAIM GRANDE",
  "RIO LUSHIN",
];

document.addEventListener("DOMContentLoaded", function () {
  const selectRio = document.getElementById("rio-select");
  const selectPuntos = document.getElementById("puntos-select");
  rios.forEach((rio) => {
    const option = document.createElement("option");
    option.value = rio;
    option.text = rio;
    selectRio.add(option);
  });

  selectRio.addEventListener("change", function () {
    // Limpiar solo los gráficos, no la tabla
    limpiarGrafico();
    const nombreRioSeleccionado = selectRio.value;
    if (!nombreRioSeleccionado) {
      mostrarPopupError("Por favor, seleccione un río.");
      return;
    }
    const puntos = datosBiologicos
      .filter((dato) => dato.RIO === nombreRioSeleccionado)
      .map((dato) => dato.PUNTO)
      .filter((v, i, a) => a.indexOf(v) === i); // Eliminar duplicados

    selectPuntos.innerHTML = '<option value="">Seleccione un punto</option>';
    puntos.forEach((punto) => {
      const option = document.createElement("option");
      option.value = punto;
      option.text = punto;
      selectPuntos.add(option);
    });
  });

  selectPuntos.addEventListener("change", function () {
    buscarDatos();
  });

  cargarDatosCSV(
    "https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/tablabio.csv",
    "tabla2"
  );
  const toggleBtn = document.getElementById("sidebar-toggle-btn");

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
    complete: function (results) {
      datosBiologicos = results.data;
      actualizarTabla(datosBiologicos, tablaId); // Actualizar la tabla después de cargar los datos
    },
    error: function (error) {
      mostrarPopupError("Error al cargar el archivo CSV: " + error.message);
    },
  });
}

function buscarDatos() {
  const selectRios = document.getElementById("rio-select");
  const selectPuntos = document.getElementById("puntos-select");
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

  let datosFiltrados = datosBiologicos.filter(
    (dato) =>
      dato.RIO === nombreRioSeleccionado && dato.PUNTO === puntoSeleccionado
  );

  actualizarTabla(datosFiltrados, "tabla2");

  // Limpiar cualquier gráfico previo
  limpiarGrafico();

  // Generar nuevos gráficos
  generarGrafico(datosFiltrados, puntoSeleccionado, "#grafico1");
  generarGraficoshanon(datosFiltrados, puntoSeleccionado, "#grafico2");
  generarGrafico3(datosFiltrados, '#grafico3');
  generarGrafico4(datosFiltrados, '#grafico4');
  generarGrafico5(datosFiltrados, '#grafico5');
}

function limpiarGrafico() {
  d3.select("#grafico1 svg").remove();
  d3.select("#grafico2 svg").remove();
  d3.select("#grafico3 svg").remove();
  d3.select("#grafico4 svg").remove();
  d3.select("#grafico5 svg").remove();
}

function mostrarPopupError(mensaje) {
  const popup = document.getElementById("error-popup");
  const popupText = document.getElementById("error-popup-text");
  popupText.textContent = mensaje;
  popup.style.display = "block";
}

function cerrarPopup() {
  const popup = document.getElementById("error-popup");
  popup.style.display = "none";
}

function actualizarTabla(datos, tablaId) {
  const tabla = document.getElementById(tablaId);
  const thead = tabla.querySelector("thead tr");
  const tbody = tabla.querySelector("tbody");

  // Limpiar tabla
  thead.innerHTML = "";
  tbody.innerHTML = "";

  if (datos.length === 0) return;

  const camposAMostrar = [
    "RIO",
    "PUNTO",
    "FECHA",
    "RIQUEZA ABSOLUTA",
    "ÍNDICE BMWP/Col.1",
    "ÍNDICE BMWP/Col",
    "DIVERSIDAD SEGÚN SHANNON",
    "CALIDAD DEL AGUA SEGÚN SHANNON",
  ];

  // Llenar encabezado
  camposAMostrar.forEach((campo) => {
    const th = document.createElement("th");
    th.textContent = campo;
    thead.appendChild(th);
  });

  // Llenar cuerpo
  datos.forEach((dato) => {
    const tr = document.createElement("tr");
    camposAMostrar.forEach((campo) => {
      const td = document.createElement("td");
      td.textContent = dato[campo];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}
function generarGrafico3(datos, contenedor) {
  // Transformar datos para Google Charts
  const datosGrafico = [['FECHA', 'Riqueza Absoluta']];
  
  datos.sort((a, b) => new Date(a.FECHA) - new Date(b.FECHA)); // Ordenar datos por fecha

  datos.forEach(dato => {
      datosGrafico.push([new Date(dato.FECHA), parseFloat(dato["RIQUEZA ABSOLUTA"])]);
  });

  // Cargar Google Charts
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
      const data = google.visualization.arrayToDataTable(datosGrafico);
      
      const containerElement = document.querySelector(contenedor);
      const width = containerElement.clientWidth;
      const height = containerElement.clientHeight || 400; // Altura predeterminada si no se establece

      const options = {
          title: 'Riqueza Absoluta a lo largo del tiempo',
          titleTextStyle: {
              fontSize: 16, // Tamaño de fuente del título
              bold: true,   // Hacer el título en negrita
              color: '#333', // Color del título
              italic: false // No usar cursiva
          },
          hAxis: {
              title: 'Fecha',
              format: 'yyyy', // Mostrar solo años
              gridlines: { count: 15 },
              slantedText: true, // Rotar las etiquetas si es necesario
              slantedTextAngle: 45 // Ángulo de rotación de las etiquetas
          },
          vAxis: {
              title: 'Riqueza Absoluta',
              viewWindow: {
                  min: Math.min(...datosGrafico.slice(1).map(d => d[1])),
                  max: Math.max(...datosGrafico.slice(1).map(d => d[1]))
              }
          },
          legend: { position: 'none' },
          width: width,
          height: height,
          pointSize: 5, // Tamaño de los puntos en el gráfico
          explorer: {
              actions: ['dragToZoom', 'rightClickToReset'], // Habilitar zoom y reinicio
              axis: 'horizontal', // Aplicar zoom en el eje horizontal
              keepInBounds: true // Mantener dentro de los límites del gráfico
          },
          areaOpacity: 0.4,
          colors: ['#1c91c0'], // Color del área
          lineWidth: 1, // Grosor de la línea
      };

      const chart = new google.visualization.AreaChart(containerElement);
      chart.draw(data, options);
  }
}
function generarGrafico4(datos, contenedor) {
  // Transformar datos para Google Charts
  const datosGrafico = [['Fecha', 'ÍNDICE BMWP/Col']];
  
  datos.sort((a, b) => new Date(a.FECHA) - new Date(b.FECHA)); // Ordenar datos por fecha

  datos.forEach(dato => {
      datosGrafico.push([new Date(dato.FECHA), parseFloat(dato["ÍNDICE BMWP/Col"])]);
  });

  // Cargar Google Charts
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
      const data = google.visualization.arrayToDataTable(datosGrafico);
      
      const containerElement = document.querySelector(contenedor);
      const width = containerElement.clientWidth;
      const height = containerElement.clientHeight || 400; // Altura predeterminada si no se establece

      const options = {
          title: 'ÍNDICE BMWP/Col a lo largo del tiempo',
          titleTextStyle: {
              fontSize: 16, // Tamaño de fuente del título
              bold: true,   // Hacer el título en negrita
              color: '#333', // Color del título
              italic: false // No usar cursiva
          },
          hAxis: {
              title: 'Fecha',
              format: 'yyyy', // Mostrar solo años
              gridlines: { count: 15 },
              slantedText: true, // Rotar las etiquetas si es necesario
              slantedTextAngle: 45 // Ángulo de rotación de las etiquetas
          },
          vAxis: {
              title: 'ÍNDICE BMWP/Col',
              viewWindow: {
                  min: Math.min(...datosGrafico.slice(1).map(d => d[1])),
                  max: Math.max(...datosGrafico.slice(1).map(d => d[1]))
              }
          },
          legend: { position: 'none' },
          width: width,
          height: height,
          pointSize: 5, // Tamaño de los puntos en el gráfico
          explorer: {
              actions: ['dragToZoom', 'rightClickToReset'], // Habilitar zoom y reinicio
              axis: 'horizontal', // Aplicar zoom en el eje horizontal
              keepInBounds: true // Mantener dentro de los límites del gráfico
          },
          lineWidth: 2, // Grosor de la línea
          colors: ['#e0440e'] // Color de la línea
      };

      const chart = new google.visualization.LineChart(containerElement);
      chart.draw(data, options);
  }
}
function generarGrafico5(datos, contenedor) {
  // Transformar datos para Google Charts
  const datosGrafico = [['Fecha', 'DIVERSIDAD SEGÚN SHANNON']];
  
  datos.sort((a, b) => new Date(a.FECHA) - new Date(b.FECHA)); // Ordenar datos por fecha

  datos.forEach(dato => {
      datosGrafico.push([new Date(dato.FECHA), parseFloat(dato["DIVERSIDAD SEGÚN SHANNON"])]);
  });

  // Cargar Google Charts
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
      const data = google.visualization.arrayToDataTable(datosGrafico);
      
      const containerElement = document.querySelector(contenedor);
      const width = containerElement.clientWidth;
      const height = containerElement.clientHeight || 400; // Altura predeterminada si no se establece

      const options = {
          title: 'DIVERSIDAD SEGÚN SHANNON a lo largo del tiempo',
          titleTextStyle: {
              fontSize: 16, // Tamaño de fuente del título
              bold: true,   // Hacer el título en negrita
              color: '#333', // Color del título
              italic: false // No usar cursiva
          },
          hAxis: {
              title: 'Fecha',
              format: 'yyyy', // Mostrar solo años
              gridlines: { count: 15 },
              slantedText: true, // Rotar las etiquetas si es necesario
              slantedTextAngle: 45 // Ángulo de rotación de las etiquetas
          },
          vAxis: {
              title: 'DIVERSIDAD SEGÚN SHANNON',
              viewWindow: {
                  min: Math.min(...datosGrafico.slice(1).map(d => d[1])),
                  max: Math.max(...datosGrafico.slice(1).map(d => d[1]))
              }
          },
          legend: { position: 'none' },
          width: width,
          height: height,
          explorer: {
              actions: ['dragToZoom', 'rightClickToReset'], // Habilitar zoom y reinicio
              axis: 'horizontal', // Aplicar zoom en el eje horizontal
              keepInBounds: true // Mantener dentro de los límites del gráfico
          },
          bar: { groupWidth: '80%' }, // Ajustar el grosor de las barras
          colors: ['#76A7FA'] // Color de las barras
      };

      const chart = new google.visualization.ColumnChart(containerElement);
      chart.draw(data, options);
  }
}
function generarGrafico(data, puntoSeleccionado, contenedor) {
  // Convertir fechas y el índice BMWP/Col a números
  data.forEach((d) => {
    d.FECHA = new Date(d.FECHA); // Convertir la fecha a un objeto de fecha
    d["ÍNDICE BMWP/Col"] = +d["ÍNDICE BMWP/Col"]; // Asegurarse de que ÍNDICE BMWP/Col es un número
  });

  // Encontrar la fecha mínima y máxima en los datos
  const minFecha = d3.min(data, (d) => d.FECHA);
  const maxFecha = new Date(2024, 0, 1); // Extender la fecha máxima hasta enero del 2024

  // Filtrar los datos para empezar desde la fecha mínima encontrada
  data = data.filter((d) => d.FECHA >= minFecha);

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

  const margin = { top: 50, right: 20, bottom: 70, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svg = d3
    .select(contenedor)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleTime().domain([minFecha, maxFecha]).range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([20, 130]) // Ajustar el dominio del eje Y con un máximo de 130
    .range([height, 0]);

  const line = d3
    .line()
    .curve(d3.curveMonotoneX)
    .x((d) => x(d.FECHA))
    .y((d) => y(d["ÍNDICE BMWP/Col"]));

  // Agregar ejes
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(ticksCount).tickFormat(d3.timeFormat("%b %Y")))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

  svg.append("g").call(d3.axisLeft(y).ticks(10)); // Ajustar los ticks del eje Y a intervalos de 10

  // Agregar líneas horizontales para los rangos de calidad del agua
  const yLines = d3.range(20, 135, 10);
  svg
    .selectAll("line.horizontal-grid")
    .data(yLines)
    .enter()
    .append("line")
    .attr("class", "horizontal-grid")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", (d) => {
      if (d <= 36) return "#D32F2F"; // Rojo para 0-35
      else if (d <= 49) return "#FBC02D"; // Amarillo para 36-49
      else if (d <= 85) return "#228B22"; // Verde para 50-84
      else return "#00008B"; // Azul para 85-100
    })
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "5,5"); // Línea entrecortada

  // Agregar la línea negra
  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  // Agregar puntos y eventos de interacción
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.FECHA))
    .attr("cy", (d) => y(d["ÍNDICE BMWP/Col"]))
    .attr("r", 5)
    .attr("fill", "black")
    .attr("stroke", "white")
    .on("mouseover", function(event, d) {
        d3.select(this).transition().duration(200).attr("r", 6);

        const tooltipGroup = svg.append("g")
            .attr("class", "tooltip-group")
            .attr("transform", `translate(${x(d.FECHA) + 50},${y(d['ÍNDICE BMWP/Col']) + 50})`);
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
            .text("CALIDAD DE AGUA NSF: " + d['ÍNDICE BMWP/Col']);

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
            .text("ÍNDICE BMWP/Col.1: " + d['ÍNDICE BMWP/Col.1']);

        const bbox = tooltipGroup.node().getBBox();
        background
            .attr("x", bbox.x - 10)
            .attr("y", bbox.y - 5)
            .attr("width", bbox.width + 20)
            .attr("height", bbox.height + 10);

        // Ajuste de la posición del tooltip para que no se salga del gráfico
        let tooltipX = x(d.FECHA);
        let tooltipY = y(d["ÍNDICE BMWP/Col"]) - 40;

        if (tooltipX + bbox.width / 2 + 10 > width) {
          tooltipX = width - bbox.width / 2 - 10;
        } else if (tooltipX - bbox.width / 2 - 10 < 0) {
          tooltipX = bbox.width / 2 + 10;
        }

        if (tooltipY - bbox.height - 10 < 0) {
          tooltipY = y(d["ÍNDICE BMWP/Col"]) + bbox.height + 10;
        }

        tooltipGroup.attr("transform", `translate(${tooltipX},${tooltipY})`);
    })
    .on("mouseout", function() {
        d3.select(this).transition().duration(200).attr("r", 5);
        svg.select(".tooltip-group").remove();
    });

  // Agregar título
  const titulo = "ÍNDICE BMWP/Col." + data[0].RIO + " en el punto " + puntoSeleccionado;
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2) // Mover el título hacia abajo para evitar que se vea tapado
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "bold")
    .text(titulo);

  // Agregar ícono de información
  const infoIcon = svg
    .append("g")
    .attr("class", "info-icon")
    .attr("transform", `translate(730, -30)`)
    .on("mouseover", function () {
      legendGroup.style("display", "block");
    })
    .on("mouseout", function () {
      legendGroup.style("display", "none");
    });

  infoIcon
    .append("circle")
    .attr("r", 10)
    .attr("fill", "lightblue")
    .attr("stroke", "black");

  infoIcon
    .append("text")
    .attr("x", 0)
    .attr("y", 4)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .text("i");

  // Agregar contenedor de la leyenda (oculto por defecto)
  const legendGroup = svg
    .append("g")
    .attr("class", "legend-group")
    .style("display", "none");

  const legendBackground = legendGroup
    .append("rect")
    .attr("x", 625)
    .attr("y", 0)
    .attr("width", 180)
    .attr("height", 120)
    .attr("fill", "white")
    .attr("stroke", "black");

  const legendData = [
    { color: "#D32F2F", label: "Calidad Mala (0-35)" },
    { color: "#FBC02D", label: "Calidad Aceptable (36-49)" },
    { color: "#228B22", label: "Calidad Buena (50-84)" },
    { color: "#00008B", label: "Calidad Excelente (85-100)" },
  ];

  legendGroup
    .selectAll("rect.legend-item")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("x", 630)
    .attr("y", (d, i) => 20 + i * 20)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", (d) => d.color);

  legendGroup
    .selectAll("text.legend-item")
    .data(legendData)
    .enter()
    .append("text")
    .attr("class", "legend-item")
    .attr("x", 650)
    .attr("y", (d, i) => 29 + i * 20)
    .attr("dy", ".35em")
    .attr("font-size", "12px")
    .text((d) => d.label);

  // Mostrar la leyenda al pasar el mouse sobre el ícono de información
  infoIcon.on("mouseover", function () {
    legendGroup.style("display", "block");
  });

  // Ocultar la leyenda cuando el mouse sale del ícono de información
  infoIcon.on("mouseout", function () {
    legendGroup.style("display", "none");
  });

  // Retornar el objeto SVG para poder modificarlo más tarde si es necesario
  return svg;
}




function generarGraficoshanon(data, puntoSeleccionado, contenedor) {
  // Convertir fechas y el índice DIVERSIDAD SEGÚN SHANNON a números
  data.forEach((d) => {
    d.FECHA = new Date(d.FECHA); // Convertir la fecha a un objeto de fecha
    d["DIVERSIDAD SEGÚN SHANNON"] = +d["DIVERSIDAD SEGÚN SHANNON"]; // Asegurarse de que DIVERSIDAD SEGÚN SHANNON es un número
  });

  // Encontrar la fecha mínima en los datos para definir el inicio del eje x
  const minFecha = d3.min(data, (d) => d.FECHA);

  // Filtrar los datos para empezar desde la fecha mínima encontrada
  data = data.filter((d) => d.FECHA >= minFecha);

  // Ordenar los datos por fecha nuevamente
  data.sort((a, b) => a.FECHA - b.FECHA);

  // Definir el número de ticks en el eje x dependiendo de la cantidad de datos
  let ticksCount =
    data.length > 50 ? d3.timeMonth.every(3) : d3.timeMonth.every(6);

  // Definir el dominio del eje y extendido
  const yDomain = [0, 5];

  // Obtener las dimensiones del contenedor
  const containerWidth = d3.select(contenedor).node().getBoundingClientRect().width;
  const containerHeight = d3.select(contenedor).node().getBoundingClientRect().height;

  const margin = { top: 50, right: 20, bottom: 70, left: 50 },
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;

  // Eliminar cualquier SVG existente dentro del contenedor
  d3.select(contenedor).selectAll("svg").remove();

  const svg = d3
    .select(contenedor)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3
    .scaleTime()
    .domain([minFecha, d3.timeMonth.offset(new Date(2024, 6, 1), -6)]) // Ajustar el dominio de las fechas
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain(yDomain)
    .nice() // Mejorar el aspecto del eje y extendido
    .range([height, 0]);

  const line = d3
    .line()
    .curve(d3.curveMonotoneX) // Aplicar la interpolación que pasa por los puntos
    .x((d) => x(d.FECHA))
    .y((d) => y(d["DIVERSIDAD SEGÚN SHANNON"]));

  // Agregar ejes
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(ticksCount).tickFormat(d3.timeFormat("%b %Y")))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

  svg.append("g").call(d3.axisLeft(y));

  // Definir la escala de colores
  const colorScale = d3.scaleLinear()
    .domain([0, 1.18, 2.46, 5])
    .range(["#ff5133", "#feef00", "#31a84f"]);

  // Agregar líneas entrecortadas de colores cada 0.5 unidades en la escala Y
  for (let i = 0; i <= 5; i += 0.5) {
    svg
      .append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(i))
      .attr("y2", y(i))
      .attr("stroke", colorScale(i))
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
  }

  // Agregar la línea de datos
  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  // Agregar puntos y eventos de interacción
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.FECHA))
    .attr("cy", (d) => y(d["DIVERSIDAD SEGÚN SHANNON"]))
    .attr("r", 5) // Aumentar el tamaño de los puntos para una mejor visualización
    .attr("fill", "black") // Puntos en color negro
    .attr("stroke", "white") // Borde blanco para destacar los puntos
    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration(200).attr("r", 8); // Agrandar el punto al pasar el mouse

      const tooltipGroup = svg.append("g").attr("class", "tooltip-group");

      const background = tooltipGroup
        .append("rect")
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("rx", 5)
        .attr("ry", 5);

      const text1 = tooltipGroup
        .append("text")
        .attr("x", 0)
        .attr("y", -18)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("FECHA DE MUESTRA: " + d3.timeFormat("%d/%m/%Y")(d.FECHA));

      const text2 = tooltipGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("DIVERSIDAD SEGÚN SHANNON: " + d["DIVERSIDAD SEGÚN SHANNON"]);

      const text3 = tooltipGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(
          "CALIDAD DEL AGUA SEGÚN SHANNON: " +
            d["CALIDAD DEL AGUA SEGÚN SHANNON"]
        );

      const bbox = tooltipGroup.node().getBBox();
      background
        .attr("x", bbox.x - 10)
        .attr("y", bbox.y - 5)
        .attr("width", bbox.width + 20)
        .attr("height", bbox.height + 10);

      // Asegurar que el tooltip se muestre completamente dentro de los límites del gráfico
      let tooltipX = x(d.FECHA);
      let tooltipY = y(d["DIVERSIDAD SEGÚN SHANNON"]) - 40;

      if (tooltipX + bbox.width / 2 + 10 > width) {
        tooltipX = width - bbox.width / 2 - 10;
      } else if (tooltipX - bbox.width / 2 - 10 < 0) {
        tooltipX = bbox.width / 2 + 10;
      }

      if (tooltipY - bbox.height - 10 < 0) {
        tooltipY = y(d["DIVERSIDAD SEGÚN SHANNON"]) + bbox.height + 10;
      }

      tooltipGroup.attr("transform", `translate(${tooltipX},${tooltipY})`);
    })
    .on("mouseout", function () {
      d3.select(this).transition().duration(200).attr("r", 5); // Restaurar tamaño original del punto
      svg.select(".tooltip-group").remove();
    });

  // Agregar título
  const titulo =
    "Diversidad Según Shannon en el río " +
    data[0].RIO +
    " en el punto " +
    puntoSeleccionado;
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2) // Mover el título hacia abajo para evitar que se vea tapado
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "bold")
    .text(titulo);

  // Agregar ícono de información
  const infoIcon = svg
    .append("g")
    .attr("class", "info-icon")
    .attr("transform", `translate(${width - 30}, -30)`)
    .on("mouseover", function () {
      legendGroup.style("display", "block");
    })
    .on("mouseout", function () {
      legendGroup.style("display", "none");
    });

  infoIcon
    .append("circle")
    .attr("r", 10)
    .attr("fill", "lightblue")
    .attr("stroke", "black");

  infoIcon
    .append("text")
    .attr("x", 0)
    .attr("y", 4)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .text("i");

  // Agregar contenedor de la leyenda (oculto por defecto)
  const legendGroup = svg
    .append("g")
    .attr("class", "legend-group")
    .style("display", "none");

  const legendBackground = legendGroup
    .append("rect")
    .attr("x", width - 235)
    .attr("y", 0)
    .attr("width", 235)
    .attr("height", 100)
    .attr("fill", "white")
    .attr("stroke", "black");

  const legendData = [
    { color: "#D32F2F", label: "Contaminación alta (0-1.18)" },
    { color: "#FBC02D", label: "Contaminación Moderada (1.19-2.46)" },
    { color: "#228B22", label: "Poca Contaminación (2.46-5)" },
  ];

  legendGroup
    .selectAll("rect.legend-item")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("x", width - 230)
    .attr("y", (d, i) => 20 + i * 20)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", (d) => d.color);

  legendGroup
    .selectAll("text.legend-item")
    .data(legendData)
    .enter()
    .append("text")
    .attr("class", "legend-item")
    .attr("x", width - 210)
    .attr("y", (d, i) => 29 + i * 20)
    .attr("dy", ".35em")
    .attr("font-size", "12px")
    .text((d) => d.label);

  // Mostrar la leyenda al pasar el mouse sobre el ícono de información
  infoIcon.on("mouseover", function () {
    legendGroup.style("display", "block");
  });

  // Ocultar la leyenda cuando el mouse sale del ícono de información
  infoIcon.on("mouseout", function () {
    legendGroup.style("display", "none");
  });

  // Retornar el objeto SVG para poder modificarlo más tarde si es necesario
  return svg;
}

