// for setting the height of the map element, taking into account the height of the navbar
var contentHeight = "height:" + (window.innerHeight - 50) +"px";
document.getElementById('mapid').setAttribute("style",contentHeight);


var mymap = L.map('mapid', {zoomSnap: 0, minZoom: 1}).setView([16.9, -8.7], 2);

    mymap.createPane('labels');
	// This pane is above markers but below popups
	mymap.getPane('labels').style.zIndex = 650;

	// Layers in this pane are non-interactive and do not obscure mouse/touch events
	mymap.getPane('labels').style.pointerEvents = 'none';

	var cartodbAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>';

	var positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
		attribution: cartodbAttribution
	}).addTo(mymap);

	var positronLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
		attribution: cartodbAttribution,
		pane: 'labels'
	}).addTo(mymap);

// control that shows state info on hover
var info = L.control();

info.onAdd = function (mymap) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>All Shark and Ray Species Richness</h4>' +  (props ?
        props.Join_Count + ' species'
        : 'Hover over a cell');
};

info.addTo(mymap);

var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {

		var div = L.DomUtil.create('div', 'info legend'),
			grades = [0, 20, 40, 60, 80, 100, 120, 140],
			labels = [],
			from, to;

		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];

			labels.push(
				'<i style="background:' + getColor(from + 1) + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'));
		}

		div.innerHTML = labels.join('<br>');
		return div;
	};

	legend.addTo(mymap);




function getColor(d) {
    return d > 140 ? '#005824' :
           d > 120  ? '#238b45' :
           d > 100  ? '#41ae76' :
           d > 80  ? '#66c2a4' :
           d > 60   ? '#99d8c9' :
           d > 40   ? '#ccece6' :
           d > 20   ? '#e5f5f9' :
                      '#f7fcfd';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.Join_Count),
        weight: 2,
        color: getColor(feature.properties.Join_Count),
        opacity: 1,
        fillOpacity: 1
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

geojson = L.geoJson(speciesRichness, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(mymap);

