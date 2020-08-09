
var map;
var markers = [];
var isFetching = true;

var distance_circle;

var R = 2000000;

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: new google.maps.LatLng(39,-77),
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        mapTypeControl: false,
        streetViewControl: false,
        styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{color: '#d59563'}]
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{color: '#d59563'}]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{color: '#263c3f'}]
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{color: '#6b9a76'}]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{color: '#38414e'}]
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{color: '#212a37'}]
            },
            {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{color: '#9ca5b3'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{color: '#746855'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{color: '#1f2835'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{color: '#f3d19c'}]
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{color: '#2f3948'}]
            },
            {
                featureType: 'transit.station',
                elementType: 'labels.text.fill',
                stylers: [{color: '#d59563'}]
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{color: '#17263c'}]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{color: '#515c6d'}]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [{color: '#17263c'}]
            }
        ]
    });

    var opt = { minZoom: 2 };
    map.setOptions(opt);

    var markerCluster = new MarkerClusterer(map, markers,
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

    $("#keywords").on('input', function() {
        markerCluster.removeMarkers(markers);
        clear();
        var keyword = "";
        $("#keywords-selector option:selected").each(function () {
           var $this = $(this);
           if ($this.length) {
            keyword += " "+$this.text();
            console.log(keyword);
           }
        });
        $('#searchbox').val(keyword);
        var size = $("#size-input").val();

        $.ajax({
            type: "POST",
            url: '/ajax/search/',
            data: {'keyword':keyword,'size':size},
            dataType: "json",
            success: function(data) {
//                iter(data);
                for (var i in data) {
                    var currTweet = data[i]["_source"];
                    if (currTweet == null) {
                        continue;
                    }
                    var currName = currTweet.name;
                    if (currName == null) {
                        continue;
                    }
                    var currLoc = currTweet.location;

                    var currLatLng = new google.maps.LatLng(currLoc.lat, currLoc.lon);
                    var currMarker = new google.maps.Marker({
                        position: currLatLng,
                        map: map,
                        draggable: false,
                    });

                    attachMessage(currMarker, currTweet);
                    markers.push(currMarker);
                    markerCluster.addMarker(currMarker);
                }
            },
            error: function(data) {
                console.log("error: " + data);
            }
        });
    });

    $("#distance-selection").on('input', function() {
        var distance = $("#radius-input").val();
        R= distance * 1000;
        circle.setRadius(parseFloat(R));
    });

    $("#distance-selection").submit(function(e) {
        e.preventDefault();
    });



    circle = new google.maps.Circle({
        strokeColor: '#48eaee',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#ffffff',
        fillOpacity: 0.35,
        map: map,
        center: new google.maps.LatLng(0, 0),
        radius: R
    });
    circle.setVisible(false);

    map.addListener('click', function(e) {
        isFetching = false;
        markerCluster.removeMarkers(markers);
        clear();

        circle.setCenter(e.latLng);
        circle.setVisible(true);

        var size = $("#size-input").val();
        var location = e.latLng.lat().toString() + "," + e.latLng.lng().toString();
        var distance = R / 1000;

        var keywords = $("#searchbox").val();

        $.ajax({
            type: "POST",
            url: '/ajax/geosearch/',
            data: {'location':location, 'distance':distance, 'size':size, 'keywords':keywords},
            dataType: "json",
            success: function(data) {

                for (var i in data) {
                    var tweet = data[i]["_source"];
                    if (tweet == null) {
                        continue;
                    }
                    var name = tweet.name;
                    if (name == null) {
                        continue;
                    }
                    var loc = tweet.location;

                    var latLng = new google.maps.LatLng(loc.lat, loc.lon);
                    var marker = new google.maps.Marker({
                        position: latLng,
                        map: map,
                        draggable: false,
                    });

                    attachMessage(marker, tweet);
                    markers.push(marker);
                    markerCluster.addMarker(marker);
                }
            },
            error: function(data) {
                console.log("error: " + data);
            }
        });
        event.preventDefault();
    });

    $("#reset-btn").click(function() {
        markerCluster.removeMarkers(markers);
        clear();
    });

}

function attachMessage(marker, message) {
    var profile_url = "https://twitter.com/" + message.name;
    contentStr = '<div class="panel panel-default">' +
        '<div class="panel-heading">' +
        '<div id="user-name"><a target="_blank" href="' + profile_url + '"' + '<b>' + message.name +
        '</b>' + '</a></div>' +
        '</div>' +
        '<div class="panel-body">' +
        '<p>' + message.text + '</p>' +
        '</div>' +
        '</div>';


    var infowindow = new google.maps.InfoWindow({
        content: contentStr,
    });
    marker.addListener('click', function() {
        infowindow.open(marker.get('map'), this);
        this.get('map').addListener('click', function() {
            infowindow.close();
        });
    });
}

function clear() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    circle.setVisible(false);
}

function iter(data) {
    for (var i in data) {
        var currTweet = data[i]["_source"];
        if (currTweet == null) {
            continue;
        }
        var currName = currTweet.name;
        if (currName == null) {
            continue;
        }
        var currLoc = currTweet.location;

        var currLatLng = new google.maps.LatLng(currLoc.lat, currLoc.lon);
        var currMarker = new google.maps.Marker({
            position: currLatLng,
            map: map,
            draggable: false,
        });

        attachMessage(currMarker, currTweet);
        markers.push(currMarker);
        markerCluster.addMarker(currMarker);
    }
}


