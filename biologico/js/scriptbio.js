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
}

function limpiarGrafico() {
  d3.select("#grafico1 svg").remove();
  d3.select("#grafico2 svg").remove();
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

  // Definir los colores para los rangos de calidad del agua (oscuros)
  const colorScale = d3
    .scaleThreshold()
    .domain([36, 49, 85])
    .range(["#D32F2F", "#FBC02D", "#228B22", "#00008B"]);

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

  // Agregar los rectángulos de colores según los rangos de calidad del agua
  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", y(36))
    .attr("width", width)
    .attr("height", height - y(36))
    .attr("fill", "#ff5133"); // Color de fondo rojo claro

  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", y(49))
    .attr("width", width)
    .attr("height", y(36) - y(49))
    .attr("fill", "#feef00"); // Color de fondo amarillo claro

  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", y(85))
    .attr("width", width)
    .attr("height", y(49) - y(85))
    .attr("fill", "#31a84f"); // Color de fondo verde claro

  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", y(130))
    .attr("width", width)
    .attr("height", y(85) - y(130))
    .attr("fill", "#3a48ba"); // Color de fondo azul

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

  // Agregar los rectángulos de colores para los rangos
  const ranges = [
    { min: 0, max: 1.18, color: "#ff5133" },
    { min: 1.18, max: 2.46, color: "#feef00" },
    { min: 2.46, max: 5, color: "#31a84f" },
  ];

  ranges.forEach((range) => {
    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", y(range.max))
      .attr("width", width)
      .attr("height", y(range.min) - y(range.max))
      .attr("fill", range.color)
      
  });

  // Agregar la línea
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
    .attr("width", 235)
    .attr("height", 100)
    .attr("fill", "white")
    .attr("stroke", "black");

  const legendData = [
    { color: "#D32F2F", label: "Contaminación alta (0-1,18)" },
    { color: "#FBC02D", label: "Contaminación Moderada (1,19-2,46)" },
    { color: "#228B22", label: "Poca Contaminación (2,46-5)" },
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
