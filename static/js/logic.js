var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

function createMap(earthquakes) {

  // Create the base layers
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create the map with topo and earthquake layers
  var myMap = L.map("map", {
    center: [
      30.09, -45.71
    ],
    zoom: 3,
    layers: [topo, earthquakes]
  });

  // Create a layer control and pass to baseMaps and overlayMaps
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Adding the legend for fillColor
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<p><strong>Depth Scale<strong></p>";
    div.innerHTML += '<i style="background: #fa6a67"></i><span>250+</span><br>';
    div.innerHTML += '<i style="background: #fca469"></i><span>100-250</span><br>';
    div.innerHTML += '<i style="background: #fedb6b"></i><span>50-100</span><br>';
    div.innerHTML += '<i style="background: #eefe99"></i><span>5-50</span><br>';
    div.innerHTML += '<i style="background: #cdfd98"></i><span>0.5-5</span><br>';
    div.innerHTML += '<i style="background: #95fc91"></i><span><0.5</span><br>';
    return div;
  };

  legend.addTo(myMap);
};

// Functions to getRadius and fillColor
function getRadius(magnitude) {
  if (magnitude === 0) {
    return 1;
  };
  return magnitude * 6;
};

function fillColor(depth) {
  switch (true) {
    case depth > 250:
      return "#fa6a67";
    case depth > 100:
      return "#fca469";
    case depth > 50:
      return "#fedb6b";
    case depth > 5:
      return "#eefe99";
    case depth > 0.5:
      return "#cdfd98";
    default:
      return "#95fc91";
  };
};

// Function for creating features
function createFeatures(earthquakeData) {

  // Pop up with all pertaining information
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><h3>Magnitude: ${feature.properties.mag}, Depth: ${feature.geometry.coordinates[2]}</h3>`);
  };

  // Add the circle markers with radius and depth
  function pointToLayer(feature, latlng) {
    return L.circleMarker(latlng, {
      radius: getRadius(feature.properties.mag),
      fillColor: fillColor(feature.geometry.coordinates[2]),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });
  };

  // Create a GeoJSON layer with the earthquake data and nested feature functions
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: pointToLayer,
    onEachFeature: onEachFeature
  });

  // Create the map with earthquake features
  createMap(earthquakes);
};

// GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Send data to createFeatures
  createFeatures(data.features);
});



