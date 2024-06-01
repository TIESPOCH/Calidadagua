function initMap() {
        var myLatLng = { lat: -2.278875, lng: -78.141926 };
		

			
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 8,
          center: myLatLng
        });
        var marker = new google.maps.Marker({
          position: myLatLng,
          map: map,
          title: '¡Estudio de la calidad de agua de la red hidrológica del cantón Morona!'
        });
      }