
/*********
* HELPER *
**********/

/************** 
* GOOGLE MAPS *
***************/

var markerColors = {
    'R' : 'red-dot.png',
    'G' : 'green-dot.png',
    'Y' : 'yellow-dot.png',
    'B' : 'blue-dot.png' // if no grade provided
} 

function initMap(records) {
   var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: {lat: 37.6803918, lng: -122.2023815}
    });

    var infowindow = new google.maps.InfoWindow();

    var marker, i;
    for (i=0; i<records.length; i++) {  
        var icon = records[i].resource_code ? markerColors[records[i].resource_code] : markerColors['B'];
        marker = new google.maps.Marker({
            position: {
                lat: records[i].location_1.coordinates[1], 
                lng: records[i].location_1.coordinates[0]
            },
            icon: "images/google-maps/markers/" + icon,
            map: map
        });

        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infowindow.setContent(records[i].facility_name);
                infowindow.open(map, marker);
            }
        })(marker, i));
    }
}



