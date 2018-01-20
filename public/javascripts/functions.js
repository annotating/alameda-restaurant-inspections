/*********
* HELPER *
**********/

$("document").ready(function() {
    $("#search-box").keyup(function() {
        var input = $("#search-box").val();
        if (input && input.length > 1) {
            $.ajax({
                type: "post",
                url: "/search",
                data: formToJSON("#search-form"),
                
                success: function(records) {
                    if (records.length > 0) {
                        showSuggestions(records);
                    } else {
                        $("#suggestion-box").hide(clearSuggestions);
                    }
                }
            });
        } else {
            $("#suggestion-box").hide(clearSuggestions);
        }
    })
});

function showSuggestions(records) {
    $("#suggestion-box").show();
    $("#suggestion-box").html(makeSuggestionsHTML(records));
    $("#suggestion-box").unbind('click');
    $("#suggestion-box").on("click", "a", function() {
        alert(JSON.stringify(records[$(this).index()]));
    });
}

function clearSuggestions() {
    $("#suggestion-box").unbind('click');
    $("#suggestion-box").html("");
}

function makeSuggestionsHTML(records) {
    var html = "<div class='list-group'>";
    records.forEach(function(record) {
        html += "<a href='#' class='list-group-item list-group-item-action rounded-0'>" + 
                    record.facility_name + 
                    " <span>" +
                        record.location_1_location + ", " +
                        record.location_1_city + ", " +
                        record.location_1_state + " " +
                        record.location_1_zip
                    "</span>" + 
                "</a>";
    });
    html += "</div>";
    return html;
}

function formToJSON(selector) {
    return $(selector).serializeArray().reduce(function(a, x) { a[x.name] = x.value; return a; }, {});
}

/************** 
* GOOGLE MAPS *
***************/

var markerColors = {
    'R' : 'red-dot.png',
    'G' : 'green-dot.png',
    'Y' : 'yellow-dot.png',
    'B' : 'blue-dot.png' // if no grade provided
} 

function createMap(records) {
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

    return map;
}



