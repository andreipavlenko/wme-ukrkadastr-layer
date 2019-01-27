// ==UserScript==
// @name           WME Ukrkadastr Layer
// @author         Andrei Pavlenko
// @version        0.0.5
// @include        /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor.*$/
// @exclude        https://www.waze.com/user/*editor/*
// @exclude        https://www.waze.com/*/user/*editor/*
// @grant          none
// @description    Adds kadastr layer
// @require        https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @namespace      https://greasyfork.org/users/182795
// ==/UserScript==

var kadastrLayer;

(function bootstrap() {
  if (OpenLayers && WazeWrap.Ready) {
    initialize();
  } else {
    setTimeout(bootstrap, 1000);
  }
})();

function initialize() {
  addKadastrLayer();
  createTab();
  addEventHandlers();
}

function createTab() {
  const tabContent = `\
  <style>
    #kadastr-area-data ul {
      list-style: none;
      padding-inline-start: 0px;
    }
    #kadastr-area-data .label {
      color: black;
      padding: 0;
      padding-right: 6px;
      font-size: inherit;
    }
    #kadastr-tab .decorated-bg {
      border-radius: 6px;
      background: white;
      padding: 6px !important;
      margin-bottom: 8px;
      box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.09);
      box-sizing: border-box;
    }
    #kadastr-tab input, #kadastr-tab label {
      margin: 0;
    }
    #loader-thinking {
      display: inline-block;
      margin: 0;
      padding: 0;
      animation-name: spin;
      animation-duration: 5000ms;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
    }
    @keyframes spin {
      from {
          transform:rotate(0deg);
      }
      to {
          transform:rotate(360deg);
      }
    }
  </style>
  <div id="kadastr-tab">
    <div class="decorated-bg controls-container">
      <input type="checkbox" id="toggle-kadastr-map"/>
      <label for="toggle-kadastr-map" style="cursor: pointer">Кадастрова карта</label>
    </div>
    <div id="kadastr-area-data"></div>
  </div>
  `;
  new WazeWrap.Interface.Tab("Кадастр 🌍", tabContent);
  $('#toggle-kadastr-map').change(e => {
    let checkboxState = e.target.checked;
    let mapZoomLevel = W.map.getZoom();
    if (checkboxState && mapZoomLevel > 4) {
      W.map.zoomTo(4);
    }
    kadastrLayer.setVisibility(checkboxState);
  });
}

function addKadastrLayer() {
  kadastrLayer = new OpenLayers.Layer.WMS(
    'Kadastr',
    'http://map.land.gov.ua/geowebcache/service/wms?tiled=true',
    {
      'LAYERS': 'kadastr',
      'VERSION': '1.1.1',
      'FORMAT': 'image/png',
    },
    {
      isBaseLayer: false,
      visibility: false,
      displayOutsideMaxExtent: true
    }
  );
  W.map.addLayer(kadastrLayer);
}

function addEventHandlers() {
  W.map.events.register('click', null, e => {
    if (!kadastrLayer.getVisibility() || W.map.getZoom() > 4) return;
    let coordinates = W.map.getLonLatFromPixel(e.xy);
    fetchAreaData(new OpenLayers.Geometry.Point(coordinates.lat, coordinates.lon));
  });
  W.map.events.register('zoomend', null, e => {
    if (e.object.zoom > 4 && kadastrLayer.getVisibility()) {
      W.map.zoomTo(4);
    }
  });
}

function fetchAreaData(areaInCoordinates) {
  $('#kadastr-area-data').html('<div class="decorated-bg"><div id="loader-thinking">🤔</div> Завантаження</div>');
  $.ajax({
    url: 'https://map.land.gov.ua/kadastrova-karta/getobjectinfo',
    type: 'POST',
    dataType : "json",
    data: {
      x: areaInCoordinates.x,
        y: areaInCoordinates.y,
        zoom: 15,
        actLayers: ['kadastr']
    },
    success: data => {
      if (data.dilanka) {
        htmlString = data.dilanka;
        htmlString = htmlString.replace(/hidden/g, '').replace(/\&nbsp\;/g, '');
        $('#kadastr-area-data').html(`<div class="decorated-bg">${htmlString}</div>`);
        items = $(`#kadastr-area-data li`);
        items[items.length - 2].remove();
        items[items.length - 3].remove();
        $('<li><br/></li>').insertBefore(items[items.length - 1]);
      } else {
        $('#kadastr-area-data').html('<div class="decorated-bg">😕 Ділянку не знайдено</div>');
      }
    },
    error: () => {
      $('#kadastr-area-data').html('<div class="decorated-bg">⛔ Помилка</div>');
    }
  });
}
