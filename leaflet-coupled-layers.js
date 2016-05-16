(function() {
  // Define our constructor
  this.CoupledLayers = function(map) {
    var that = this;

    that.bindLayers = function (paramName, ifTrueLayer, ifFalseLayer) {
      map.on('baselayerchange', function (obj) {
        if (obj.layer.options[paramName]) {
          if (!map.hasLayer(ifTrueLayer)) map.addLayer(ifTrueLayer);
          if (map.hasLayer(ifFalseLayer)) map.removeLayer(ifFalseLayer);
        } else if (!obj.layer.options[paramName]) {
          if (map.hasLayer(ifTrueLayer)) map.removeLayer(ifTrueLayer);
          if (!map.hasLayer(ifFalseLayer)) map.addLayer(ifFalseLayer);
        } 
      });
    };   
  };


  this.CoupledLayers.prototype.getCustomLayersControl = function (baseLayers, overlays, options) {
    return new this.CustomLayersControl(baseLayers, overlays, options);
  };

  this.CoupledLayers.prototype.CustomLayersControl = L.Control.Layers.extend({
    options: {
      collapsed: true,
      position: 'topright',
      autoZIndex: true
    },

    initialize: function (baseLayers, overlays, options) {
      L.setOptions(this, options);

      this._layers = {};
      this._lastZIndex = 0;
      this._handlingClick = false;
      for (var i in baseLayers) {
        this._addLayer(baseLayers[i], i);
      }

      for (i in overlays) {
        this._addLayer(overlays[i], i, true);
      }
    },

    onAdd: function (map) {
      this._initLayout();
      this._update();

      map
        .on('layeradd', this._onLayerChange, this)
        .on('layerremove', this._onLayerChange, this);

      return this._container;
    },

    onRemove: function (map) {
      map
        .off('layeradd', this._onLayerChange, this)
        .off('layerremove', this._onLayerChange, this);
    },

    addBaseLayer: function (layer, name) {
      this._addLayer(layer, name);
      this._update();
      return this;
    },

    addOverlay: function (layer, name) {
      this._addLayer(layer, name, true);
      this._update();
      return this;
    },

    removeLayer: function (layer) {
      var id = L.stamp(layer);
      delete this._layers[id];
      this._update();
      return this;
    },

    _initLayout: function () {
      var className = 'control-coupled-layers',
          container = this._container = L.DomUtil.create('div', className);

      //Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
      container.setAttribute('aria-haspopup', true);

      if (!L.Browser.touch) {
        L.DomEvent
          .disableClickPropagation(container)
          .disableScrollPropagation(container);
      } else {
        L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
      }

      var form = this._form = L.DomUtil.create('div', className + '-list');

      if (this.options.collapsed) {

        var link = this._layersLink = L.DomUtil.create('div', className + '-toggle', container);
        link.innerText = 'Layers';
        
        if (!L.Browser.android) {
          L.DomEvent
              .on(link, 'click', this._toogle, this);
        }

        if (L.Browser.touch) {
          L.DomEvent
              .on(link, 'click', L.DomEvent.stop)
              .on(link, 'click', this._expand, this);
        }
        else {
          L.DomEvent.on(link, 'focus', this._expand, this);
        }
        //Work around for Firefox android issue https://github.com/Leaflet/Leaflet/issues/2033
        L.DomEvent.on(form, 'click', function () {
          setTimeout(L.bind(this._onInputClick, this), 0);
        }, this);

        this._map.on('click', this._collapse, this);
        // TODO keyboard accessibility
      } else {
        this._expand();
      }
      L.DomUtil.create('div', className + '-separator', form);
      this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
      this._separator = L.DomUtil.create('div', className + '-separator', form);
      this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

      container.appendChild(form);
    },

    _addLayer: function (layer, name, overlay) {
      var id = L.stamp(layer);

      this._layers[id] = {
        layer: layer,
        name: name,
        overlay: overlay
      };

      if (this.options.autoZIndex && layer.setZIndex) {
        this._lastZIndex++;
        layer.setZIndex(this._lastZIndex);
      }
    },

    _update: function () {
      if (!this._container) {
        return;
      }

      this._baseLayersList.innerHTML = '';
      this._overlaysList.innerHTML = '';

      var baseLayersPresent = false,
          overlaysPresent = false,
          i, obj;

      for (i in this._layers) {
        obj = this._layers[i];
        this._addItem(obj);
        overlaysPresent = overlaysPresent || obj.overlay;
        baseLayersPresent = baseLayersPresent || !obj.overlay;
      }

      this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
      
      if (overlaysPresent) this._overlaysList.className += ' control-coupled-layers-last';
      else this._baseLayersList.className += ' control-coupled-layers-last';
      // this._separator.className += (overlaysPresent && baseLayersPresent ? '' : ' separator-hidden');
    },

    _onLayerChange: function (e) {
      var obj = this._layers[L.stamp(e.layer)];

      if (!obj) { return; }

      if (!this._handlingClick) {
        this._update();
      }

      var type = obj.overlay ?
        (e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
        (e.type === 'layeradd' ? 'baselayerchange' : null);

      if (type) {
        this._map.fire(type, obj);
      }
    },

    // IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
    _createRadioElement: function (name, id, checked) {

      var radioHtml = '<input type="radio" id="' + id + '" class="control-coupled-layers-selector" name="' + name + '"';
      if (checked) {
        radioHtml += ' checked="checked"';
      }
      radioHtml += '/>';

      var radioFragment = document.createElement('div');
      radioFragment.innerHTML = radioHtml;

      return radioFragment.firstChild;
    },

    _addItem: function (obj) {
      var container = obj.overlay ? this._overlaysList : this._baseLayersList;

      var layerContainer = L.DomUtil.create('div', 'weather-layer-container', container);
      
      var label = document.createElement('label'),
          input,
          checked = this._map.hasLayer(obj.layer);

      label.htmlFor = obj.name;

      if (obj.overlay) {
        // input = this._createRadioElement('weather-base-layers', obj.name, checked);
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = obj.name;
        input.className = 'control-coupled-layers-selector';
        input.defaultChecked = checked;          
      } else {
        // input = document.createElement('input');
        // input.type = 'checkbox';
        // input.id = obj.name;
        // input.className = 'control-coupled-layers-selector';
        // input.defaultChecked = checked;  
        input = this._createRadioElement('weather-overlay-layers', obj.name, checked);    
      }

      input.layerId = L.stamp(obj.layer);

      L.DomEvent.on(input, 'click', this._onInputClick, this);

      var name = document.createElement('span');
      name.innerHTML = ' ' + obj.name;

      layerContainer.appendChild(input);
      label.appendChild(name);

      layerContainer.appendChild(label);

      return label;
    },

    _onInputClick: function () {
      var that = this;
      var i, input, obj,
          inputs = this._form.getElementsByTagName('input'),
          inputsLen = inputs.length;

      this._handlingClick = true;

      for (i = 0; i < inputsLen; i++) {
        input = inputs[i];
        obj = this._layers[input.layerId];

        if (input.checked && !this._map.hasLayer(obj.layer)) {  
          this._map.addLayer(obj.layer);  
        } else if (!input.checked && this._map.hasLayer(obj.layer)) {
          this._map.removeLayer(obj.layer);
        }
      }

      this._handlingClick = false;

      this._refocusOnMap();
    },

    _expand: function () {
      L.DomUtil.addClass(this._container, 'control-coupled-layers-expanded');
    },

    _collapse: function () {
      this._container.className = this._container.className.replace(' control-coupled-layers-expanded', '');
    },
    
    _toogle: function () {
      if (this._container.className.indexOf(" control-coupled-layers-expanded") > -1) {
        this._collapse();
      } else {
        this._expand();
      }    
    }  
  });
}());


