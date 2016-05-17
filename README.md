# Leaflet Coupled Layers

Leaflet plugin wich allows you to add an specific layers control with "coupled" layers.

When you choose a base-layer on default leaflet layers control, you activate a single base-layer from a single source. This plugin allows you to diplay on map composite information from different sources for every base-layer.

## Instalation

Install with Bower.
```
bower install leaflet-coupled-layers
```

Include script and css file in your index.html.
```html
  <link rel="stylesheet" type="text/css" href="bower_components/leaflet-coupled-layers/leaflet-coupled-layers.css">  
  <script type="text/javascript" src="bower_components/leaflet-coupled-layers/leaflet-coupled-layers.js"></script>
```

## Usage

You can use it as default layers control.

```javascript
// init map as you do it default
var map = L.map('map', {minZoom: 1,maxZoom: 10})

// pass the map object to CoupledLayers constructor
var cl = new CoupledLayers(map);

// define your layers
var owm = new L.tileLayer('http://{s}.maps.owm.io:8088/BASE_MAP/{z}/{x}/{y}');
var osm = new L.tileLayer('http://{s}.somedomain.com/blabla/{z}/{x}/{y}.png').addTo(map);

// set overlays and base-layers
var overlays = {
};

var baseLayers = {
  'OWM': owm,
  'OSM': osm 
};

// pass overlays and base-layers to layers control constructor
var control = cl.getCustomLayersControl(baseLayers, overlays);

// add layers control to map
map.addControl(control);
```

If you need to display an information from several sources by picking single base-layer, when you define this base layer you should specify a specific boolean param.

```javascript
var owm = new L.tileLayer('http://{s}.maps.owm.io:8088/BASE_MAP/{z}/{x}/{y}', {
  YourParamName: true, // You can choose any name you whant for this param.
  attribution: "OpenWeatherMap",
  zIndex: 10
}).addTo(map);
```

Next you should to define an layer which u whant to combine whith your base-layer. Z-index will help you to position this layer top or bottom relative to base-layer.

```javascript
var positronLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
  attribution: '©OpenStreetMap, ©CartoDB',
  zIndex: 20
});
```

Finaly you need to bind your sub-layer with param YourParamName.

```javascript
  cl.bindLayers('YourParamName', positronLabels);
```
Now after you choose a base-layer with notFalse param 'YourParamName', layer 'positronLabels' will be added automatically.

Result exemple:

```javascript
var map = L.map('map', {minZoom: 1,maxZoom: 10})

var cl = new CoupledLayers(map);

var owm = new L.tileLayer('http://{s}.maps.owm.io:8088/BASE_MAP/{z}/{x}/{y}', {
  YourParamName: true, // You can choose any name you whant for this param.
  attribution: "OpenWeatherMap",
  zIndex: 10
});

var positronLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
  attribution: '©OpenStreetMap, ©CartoDB',
  zIndex: 20
});

var osm = new L.tileLayer('http://{s}.somedomain.com/blabla/{z}/{x}/{y}.png').addTo(map);

var overlays = {
};

var baseLayers = {
  'OWM': owm,
  'OSM': osm 
};

var control = cl.getCustomLayersControl(baseLayers, overlays);
map.addControl(control);

cl.bindLayers('YourParamName', positronLabels);
```