/*********
* HELPER *
**********/

function initListeners(records) {
    // clicking outside search clears search box
    $(document).on('click', function(e) {
        if (isChildElement(e, 'search-box') || 
                isChildElement(e, 'suggestion-box') || 
                    isChildElement(e, 'popup')) {
            // do nothing
        } else {
            $('#suggestion-box').hide();
        }
    });

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
    });
}

function popupRecordDetails(record) {
    if (record) {
        $.ajax({
            type: "post",
            url: "/search",
            data: {
                q : {
                    name : record.facility_name,
                    location : {
                        location_1_location : record.location_1_location,
                        location_1_city : record.location_1_city
                    }
                }
            },
            
            success: function(results) {
                if (results.length > 0 ) {
                    $("#popupHeader").html(
                        "<h5 class='modal-title'>"+
                            record.facility_name + 
                            makeDotHTML(record.resource_code) +
                        "</h5>" +
                        addressString(record)
                    );
                    $("#popupTableRows").html(makeRecordDetailsHTML(results));
                    $('#popup').modal('show');
                }
            }
        });

    }
}

function isChildElement(e, targetId) {
    var obj = e.target;
    while (obj) {
        if (obj.id===targetId) {
            return true;
        }
        obj = obj.parentElement;
    }
    return false;
}

function showSuggestions(records) {
    $("#suggestion-box").show();
    $("#suggestion-box").html(makeSuggestionsHTML(records));
    $("#suggestion-box").off('click');

    $("#suggestion-box").on("click", "a", function() {
        popupRecordDetails(records[$(this).index()]);
    });
}

function clearSuggestions() {
    $("#suggestion-box").off('click');
    $("#suggestion-box").html("");
}

function makeSuggestionsHTML(records) {
    var html = "<div class='list-group'>";
    records.forEach(function(record) {
        html += "<a href='#' class='clickable list-group-item list-group-item-action rounded-0'>" + 
                    record.facility_name + makeDotHTML(record.resource_code) +
                    " <span class='location right'>" +  
                        addressString(record) + 
                    "</span>" + 
                "</a>";
    });
    html += "</div>";
    return html;
}

function makeRecordDetailsHTML(results) {
    var str = "";
    results.forEach(function(res) {
        var date = formatDate(res.activity_date);
        str += 
        "<tr>" +
            "<td>" + date + "</td>" +
            "<td>" + makeDotHTML(res.resource_code) + "</td>" +
            "<td>" + res.violation_description + "</td>" +
        "</tr>" 
    });
    return str;
}

function formatDate(str) {
    var yyyymmdd = str.split('T')[0];
    yyyymmdd = yyyymmdd.split('-');
    return yyyymmdd[1] + '-' + yyyymmdd[2] + '-' + yyyymmdd[0];
}

function safeString(val) {
    return val ? val : '';
}

function addressString(record) {
    var str = safeString(record.location_1_location) + ", " +
            safeString(record.location_1_city) + ", " +
            safeString(record.location_1_state) + " " +
            safeString(record.location_1_zip);
    return str;
}

function formToJSON(selector) {
    return $(selector).serializeArray().reduce(function(a, x) { a[x.name] = x.value; return a; }, {});
}

function makeDotHTML(resource_code) {
    if (resource_code === 'G') { 
        return "<span class='green dot'></span>"
    } else if (resource_code === 'Y') { 
        return "<span class='yellow dot'></span>"
    } else if (resource_code === 'R') { 
        return "<span class='red dot'></span>"
    } else {
        return '';
    }
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

function infoWindowContent(record) {
    var str = 
            '<strong>'+record.facility_name+'</strong>'+ makeDotHTML(record.resource_code) +
            '<br>' +
            addressString(record) + 
            '<hr>' +
            "<a class='clickable' id='mapTrigger'>View Inspection Records</a>"
    return str;
}

function makeMarker(map, record) {
    var icon = record.resource_code ? markerColors[record.resource_code] : markerColors['B'];
    var marker = new google.maps.Marker({
        position: {
            lat: record.location_1.coordinates[1], 
            lng: record.location_1.coordinates[0]
        },
        icon: "images/google-maps/markers/" + icon,
        map: map
    });
    return marker;
}

function panToDefaultPosition(map) {
    map.panTo({lat: 37.6903918, lng: -122.0923815});
    map.setZoom(10);
}

function createMap(records, markers) {
   var map = new google.maps.Map(document.getElementById('map'), {
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: true,
        rotateControl: false,
        fullscreenControl: false
   });
    panToDefaultPosition(map);

    var infowindow = new google.maps.InfoWindow();

    var marker, i;
    for (i=0; i<records.length; i++) {  
        marker = makeMarker(map, records[i]);
        markers.push(marker);

        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infowindow.setContent(infoWindowContent(records[i]));
                infowindow.open(map, marker);
                document.getElementById('mapTrigger').addEventListener('click', function() {
                    popupRecordDetails(records[i])
                })
            }
        })(marker, i));
    }

    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);

    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);
  
    return map;
}

function CenterControl(controlDiv, map) {
    // Set CSS for the control border.
    var controlUI = document.createElement('div');

    var icon = document.createElement('i');
    icon.className ="fas fa-crosshairs";
    controlUI.appendChild(icon);

    controlUI.style.padding = '6px';
    controlUI.style.color = '#4d4d4d';
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '1px';
    controlUI.style.boxShadow = '0 1px 1px rgba(0,0,0,.1)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginRight = '10px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to re-center the map';
    controlDiv.appendChild(controlUI);

    controlUI.addEventListener('click', function() {
        panToDefaultPosition(map);
    });
  }


