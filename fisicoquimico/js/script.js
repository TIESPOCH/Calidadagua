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

    riversSelect.addEventListener('change', () => {
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
                const riverData = data.filter(row => row['RIO'] === selectedRiver);
                if (riverData.length > 0) {
                    generateLineChart(riverData);
                } else {
                    console.log('No data available for the selected river.');
                }
            },
            error: function(error) {
                console.error('Error al cargar el CSV:', error);
                
            }
        });
    }

    function generateLineChart(data) {
        d3.select("#histogram").selectAll("*").remove(); // Limpiar el contenedor de gráficos
        
        const margin = {top: 20, right: 30, bottom: 50, left: 60};
        const width = 960 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select("#histogram")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const parseDate = d3.timeParse("%Y-%m-%d");

        data.forEach(d => {
            d.FECHA = parseDate(d.FECHA);
            if (d.Clasificacion === "Buena") {
                d.Clasificacion= 1;
            } else if (d.Clasificacion === "Regular") {
                d.Clasificacion= 2;
            } else if (d.Clasificacion === "Mala") {
                d.Clasificacion = 3;
            }
        });

        const x = d3.scaleTime()
            .domain([new Date(2018, 0, 1), new Date(2023, 11, 31)])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([1, 3])
            .nice()
            .range([height, 0]);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const line = d3.line()
            .x(d => x(d.FECHA))
            .y(d => y(d.Clasificacion));

        const points = [...new Set(data.map(d => d.PUNTO))];

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat("%Y")));

        svg.append("g")
            .call(d3.axisLeft(y).ticks(3).tickFormat(d => {
                if (d === 1) return "Buena";
                if (d === 2) return "Regular";
                if (d === 3) return "Mala";
            }));

        const pointData = d3.group(data, d => d.PUNTO);

        svg.selectAll(".line")
            .data(pointData)
            .join("path")
            .attr("fill", "none")
            .attr("stroke", d => color(d[0]))
            .attr("stroke-width", 2)
            .attr("d", d => line(d[1]));

        svg.selectAll(".dot")
            .data(data)
            .join("circle")
            .attr("cx", d => x(d.FECHA))
            .attr("cy", d => y(d.Clasificacion))
            .attr("r", 3)
            .attr("fill", d => color(d.PUNTO));

        svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "underline")  
            .text("Clasificación de Calidad del Agua por Fecha y Punto de Muestra");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom)
            .attr("text-anchor", "middle")
            .text("Fecha de Muestra");

        svg.append("text")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 15)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Clasificación de Calidad del Agua");
        
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 120},${margin.top})`);

        legend.selectAll("rect")
            .data(points)
            .join("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", color);

        legend.selectAll("text")
            .data(points)
            .join("text")
            .attr("x", 20)
            .attr("y", (d, i) => i * 20 + 10)
            .text(d => d);
    }
});
