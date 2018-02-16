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

    $(".location").on("click", "a", function() {
        event.stopPropagation();
        alert(JSON.stringify(records[$(this).index()]));
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
                infowindow.setContent(
                    '<strong>'+records[i].facility_name+'</strong>'+
                    '<br>' +
                    addressString(records[i]) + 
                    '<hr>' +
                    "<a class='clickable' id='mapTrigger')>View Inspection Records</a>"
                );
                infowindow.open(map, marker);
                document.getElementById('mapTrigger').addEventListener('click', function() {
                    popupRecordDetails(records[i])
                })
            }
        })(marker, i));
    }

    return map;
}



