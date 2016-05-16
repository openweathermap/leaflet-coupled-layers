# Leaflet Coupled Layers

Leaflet plugin wich allows you to add an specific layers control with "coupled" layers.

When you choose a base-layer on default leaflet layers control, you activate a single base-layer from a single source. This plugin allows you to diplay on map composite information from different sources for every base-layer.

## Instalation

```
bower install leaflet-coupled-layers
```

In your html.
```html
  <link rel="stylesheet" type="text/css" href="bower_components/leaflet-coupled-layers/leaflet-coupled-layers.css">  
  <script type="text/javascript" src="bower_components/leaflet-coupled-layers/leaflet-coupled-layers.js"></script>
```

## Usage

```javascript

// init map as u default do it
var map = L.map('map', {minZoom: 1,maxZoom: 10})

//pass the map object to CoupledLayers constructor
var owm = new CoupledLayers(map);

```