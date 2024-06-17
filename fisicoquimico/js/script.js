document.addEventListener('DOMContentLoaded', () => {
    const riverOptions = [
        "RIO HUASAGA", "RIO CHAPIZA", "RIO ZAMORA", "RIO UPANO", "RIO JURUMBAINO",
        "RIO KALAGLAS", "RIO YUQUIPA", "RIO PAN DE AZÚCAR", "RIO BLANCO", 
        "RIO TUTANANGOZA", "RIO INDANZA", "RIO MIRIUMI", "RIO YUNGANZA", 
        "RIO CUYES", "RIO ZAMORA", "RIO EL IDEAL", "RIO MORONA", "RIO MUCHINKIN", 
        "RIO NAMANGOZA", "RIO SANTIAGO", "RIO PASTAZA", "RIO CHIWIAS", 
        "RIO TUNA CHIGUAZA", "RÍO PALORA", "RIO LUSHIN", "RIO SANGAY", 
        "RIO NAMANGOZA", "RIO PAUTE", "RIO YAAPI", "RIO HUAMBIAZ", "RIO TZURIN", 
        "RIO MANGOSIZA", "RIO PUCHIMI", "RIO EL CHURO", "RIO MACUMA", 
        "RIO PANGUIETZA", "RIO PASTAZA", "RIO PALORA", "RIO TUNA", 
        "RIO WAWAIM GRANDE", "RIO LUSHIN"
    ];

    const riversSelect = document.getElementById('rivers');
    riverOptions.forEach(river => {
        const option = document.createElement('option');
        option.value = river;
        option.textContent = river;
        riversSelect.appendChild(option);
    });

    const generateGraphBtn = document.getElementById('generateGraphBtn');
    const histogramContainer = d3.select("#histogram");

    generateGraphBtn.addEventListener('click', () => {
        const selectedRiver = riversSelect.value;
        fetchCSVData(selectedRiver);
    });

    function fetchCSVData(selectedRiver) {
        const csvUrl = 'https://raw.githubusercontent.com/TIESPOCH/Calidadagua/EdisonFlores/Parametrosfisio.csv';
        
        Papa.parse(csvUrl, {
            download: true,
            header: true,
            complete: function(results) {
                const data = results.data;
                const riverData = data.filter(row => row['RIO'] === selectedRiver); // Cambiado a 'RIO'
                drawHistogram(riverData);
            },
            error: function(error) {
                console.error('Error al cargar el CSV:', error);
            }
        });
    }

    function drawHistogram(data) {
        // Limpiar el contenedor del histograma antes de dibujar uno nuevo
        histogramContainer.selectAll("*").remove();

        // Configuración del SVG
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = 960 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = histogramContainer.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Escala de colores por año
        const colorScale = d3.scaleOrdinal()
            .domain([2018, 2019, 2020, 2021, 2022, 2023])
            .range(d3.schemeCategory10);

        // Obtener los años únicos para el eje X
        const years = Array.from(new Set(data.map(d => new Date(d.FECHA).getFullYear())));

        // Escala X para los años
        const x = d3.scaleBand()
            .domain(years)
            .range([0, width])
            .padding(0.1);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // Escala Y para la clasificación (Buena, Regular, Mala)
        const y = d3.scalePoint()
            .domain(["Buena", "Regular", "Mala"])
            .range([height, 0])
            .padding(1);

        svg.append("g")
            .call(d3.axisLeft(y));

        // Añadir los puntos como círculos
        svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", d => x(new Date(d.FECHA).getFullYear())) // Usando FECHA para el eje X
            .attr("cy", d => y(d.Clasificacion))
            .attr("r", 5)
            .attr("fill", d => colorScale(new Date(d.FECHA).getFullYear())) // Color por año
            .append("title")
            .text(d => `${d.RIO} - ${d.PUNTO} (${d.FECHA})`); // Mostrar nombre del río, punto y fecha en el tooltip

        // Añadir líneas de tiempo agrupadas por río y punto
        const line = d3.line()
            .x(d => x(new Date(d.FECHA).getFullYear())) // Usando FECHA para el eje X
            .y(d => y(d.Clasificacion));

        const nestedData = d3.groups(data, d => d.RIO, d => d.PUNTO);

        nestedData.forEach(([river, points]) => {
            points.forEach(([point, values]) => {
                svg.append("path")
                    .datum(values)
                    .attr("fill", "none")
                    .attr("stroke", "#000")
                    .attr("stroke-width", 1.5)
                    .attr("d", line)
                    .append("title")
                    .text(`${river} - ${point}`);
            });
        });
    }
});
