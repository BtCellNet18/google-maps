var directionsDisplay;

function initMap() {	
	var div = document.getElementById('map');	
    var map = new google.maps.Map(div, {
        center: {
            lat: 52.67,
            lng: -8.63
        },
        zoom: 13
    });
	// Set directions panel
    directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions'));
	// Hide drop downs
	hide('loader');
	hide('ddlTransitModes');
	hide('ddlRoutingPreference');
    // Get inputs
    var from = document.getElementById('txtFrom');
    var to = document.getElementById('txtTo');
	// Set defaults
    from.value = 'San Francisco';
    to.value = 'New York';
	// Enable Google Places Autocomplete 
    fromAutoComplete = new google.maps.places.Autocomplete(from);
    toAutoComplete = new google.maps.places.Autocomplete(to);
}

function getOrigin() {
    var txtFrom = document.getElementById('txtFrom');
	return txtFrom.value;
}

function getDestination() {
    var txtTo = document.getElementById('txtTo');
	return txtTo.value;
}

function getTravelMode() {
    var ddlModes = document.getElementById('ddlModes');
    return ddlModes.options[ddlModes.selectedIndex].value;
}

function getTransitMode() {
    var ddlTransitModes = document.getElementById('ddlTransitModes');
    return ddlTransitModes.options[ddlTransitModes.selectedIndex].value;
}

function getRoutingPreference() {
    var ddlRoutingPreference = document.getElementById('ddlRoutingPreference');
    return ddlRoutingPreference.options[ddlRoutingPreference.selectedIndex].value;
}

function getDirectionRequest() {
    if (getTravelMode() == 'TRANSIT') {
        return {
            origin: getOrigin(),
            destination: getDestination(),
            travelMode: getTravelMode(),
            transitOptions: {
                modes: [getTransitMode()],
                routingPreference: getRoutingPreference()
            }
        };
    } else {
        return {
            origin: getOrigin(),
            destination: getDestination(),
            travelMode: getTravelMode()
        };
    }
}

function getDistanceMatrixRequest() {
    if (getTravelMode() == 'TRANSIT') {
        return {
			origins: [getOrigin()],
			destinations: [getDestination()],
            travelMode: getTravelMode(),
            transitOptions: {
                modes: [getTransitMode()],
                routingPreference: getRoutingPreference()
            }
        };
    } else {
        return {
			origins: [getOrigin()],
			destinations: [getDestination()],
            travelMode: getTravelMode()
        };
    }
}

function onSearch() {
	var txtFrom = document.getElementById('txtFrom');
	var txtTo = document.getElementById('txtTo');
	
	if (txtFrom.value && txtTo.value) {
		startSearch();
		calculateAndDisplayRoute();
		calculateDistanceAndDuration();		
		setTimeout(stopSearch, 3000);
	} else {
		alert('From and To fields are required.');
	}
}

function onModeSelected() {
    var selectedMode = getTravelMode();

    if (selectedMode == 'TRANSIT') {
        show('ddlTransitModes');
        show('ddlRoutingPreference');
    } else {
        hide('ddlTransitModes');
        hide('ddlRoutingPreference');
    }
}

function startSearch() {
	show('loader');
	disable('btnSearch');	
}

function stopSearch() {
	hide('loader');
	enable('btnSearch');	
}

function enable(id) {
	document.getElementById(id).removeAttribute('disabled');
}

function disable(id) {
	document.getElementById(id).setAttribute('disabled', '');
}

function show(id) {
    document.getElementById(id).style.visibility = 'visible';
}

function hide(id) {
    document.getElementById(id).style.visibility = 'hidden';
}

function calculateAndDisplayRoute() {
    var request = getDirectionRequest();

    console.log(JSON.stringify(request));

    var service = new google.maps.DirectionsService();
    service.route(request, function(response, status) {
        if (status == 'OK') {
            //console.log(JSON.stringify(response));
            directionsDisplay.setDirections(response);
        } else {
            directionsDisplay.set('directions', null);
            console.log('Directions request failed due to ' + status);
        }
    });
}

function calculateDistanceAndDuration() {
	var request = getDistanceMatrixRequest();
    var service = new google.maps.DistanceMatrixService();
	
    service.getDistanceMatrix(request, function(response, status) {
        if (status == 'OK') {
            //console.log(JSON.stringify(response));
            var origins = response.originAddresses;
            var destinations = response.destinationAddresses;
            var output = document.getElementById('output');
            var result = response.rows[0].elements[0];

            if (result.status == 'OK') {
                output.innerHTML = getOrigin() + ' to ' + getDestination() + ' ' +
                    result.distance.text + ' in ' + result.duration.text + '<br>';
            } else {
                output.innerHTML = 'Distance request failed due to ' + result.status;
            }
        } else {
            console.log('Error was: ' + status);
        }
    });
}	