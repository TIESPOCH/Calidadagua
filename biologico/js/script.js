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
                const fields = results.meta.fields; // Extract the field names
                const riverData = data.filter(row => row['NOMBRE RIO'] === selectedRiver);

                console.log('Column names:', fields);
                console.log('Data for selected river:', riverData);
            },
            error: function(error) {
                console.error('Error al cargar el CSV:', error);
            }
        });
    }
});
