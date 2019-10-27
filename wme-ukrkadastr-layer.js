// ==UserScript==
// @name           WME Ukrkadastr Layer
// @author         Andrei Pavlenko
// @version        0.4.4
// @include        /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor.*$/
// @exclude        https://www.waze.com/user/*editor/*
// @exclude        https://www.waze.com/*/user/*editor/*
// @grant          none
// @description    Adds kadastr layer
// @require        https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @namespace      https://greasyfork.org/users/182795
// ==/UserScript==

var kadastrLayer, markerLayer, markerIcon;
const markerIconURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABR5JREFUeNrsXF1uEzEQdtKkSX/TqDwUISCIV6TkGQklHACpPQHhBuEG2xOQnIDkBqk4AImQeC4Sz9DwQh9AZUtp0iZtmakcRMG760121/bujGStlLU93vlmxp/t3aSurq4YiTpJkwkIAAKAhAAgAEgIAAKAhAAgAEgIAAKAhAAgAEgIgERIxqTBHj57UoELlpJDlQMo+1tv3u2b8kwp3c8DwOh1uGxDqUEpSDazofSgdAGMNgHg3+gbcGnwUpizOwSjiQXA+EEAeBsfjW4FYHgREBaA0CQAnL2+C6Uasqo+pjRdokELAPjk2gvB692ioabDZJ1OoPEZ19XjupMLgCLjawWCshQED45cft+v8S9hvKPJBTsdj2/8vpzNsnxmgaVTqVnSUQXS0UHSFmJdP8a3z87Z0WjEzsD4Ivk+HF1fcwBCMZ9nhdyin0jo8gVeMlIQeD/SzLJM3ZPzMft0ZLPDk1+Oxv9bsA7WxTbYVlLKfEzxT0F+Ug8aEj1/rkQPkbC1uqJtKlIRAVZUxp+mLuxLMhVZsY4Avtg6isr4M0ZCMcpFWtQRUJfJ+R7Gx1TRgbID5SkvO/w32y0SJOeEepQGyegEAFLMr+7pAo3cqL7/KPLQbv/xI4ww3Ot5LmqMfT8sFryoap33Ea8UJJN+vp0O/9BJgbwAw7dldAEQaMTXonubS3l2a3lJmzQUZQqqeVU4dk49LVnjo/C6LZ86fI3VRAAqXvx9fHkpujWYkZ1YvO0NQR0S64lK4gA4nUycbrUdcr5XFGCbtk9dsQZgw+3mhdj7p1sW82x3+NElNVbjtyJEMnTwSvDkmffsndoOvSOAJQ6ApIo2AOQWFpwoZWnWPp3aOulKNAAui6N5KGHNp65YA9Bzu4kHKiFsDdR96pIaq6kAHLgD4LgrUoVUsj1D+sE2VZH3u+iSGmssIwDF5RSrDQat+DB+xWkNsLaYDWSsxgHADzoGbnU2nfdorg/QwbA1CePXmMtB/6b3PtAgykOZqCdh10VVNp1mxXzODYS3YOCuKCXhb3gP6zgZH/tGHfOMMWiJ+kAGaeFntzq4Jf3l+KfU+S/IB371PF/Gw/p762syDOhBbCOAP1jfi47eXlmRpYplGeP76LOflDNhKW+VSBdMti+8BjE24wEAD8MJsiNjuNLGOluVYy1CwbY+jN/hY0vEShhfQbdlUsedtVV2F4wowd1vrCmwDbaVTGU2H1PkovLVRHzgV37a4GEKHqyfTSb/Hd5gusplMtdeP0PqeqnquwGlr6cDCDjh3Ve8HYO8v6RKuerNuDpTL0rHoBQAPun1FQ6hr2Li1SkCVHug8ghUDgBf+LQUqG6p+iZAtwiYLoDsCPXZKhZd2gLA30KL0iAWfSUppqX4FkM5ZDUfwPgVXZ5Zt7ciGjHRYSYAnBLuhahiTzXt1D0CwvbQhm4Pqx0AnBruhtD1rg6004QIQGkGTEun/5jCCAB5Whpkumjo+Fc12tHQkGipVrTTlBQU5KTZ0PkBtQYgAFqqHe00LQLm9eCG7g+nPQBz0FItaaeJETClpQMf9Qe60k4jAZhht9TSlXYaRUMFtBQnVK8/9cNjxpopz2TaN2JWQHUIgDloqdtbdR3daafpETD1cNE+kW2a9xsJAKeWIobTNIF2xiECRLTUGNoZCwAEtNQY2mk0DXWgpcwk2vmvZJjZ0jB8/GZHQByE/qyDACAASAgAAoCEACAASAgAAoCEACAASAgAAoCEAEiG/BZgAIdH+4FfAgoVAAAAAElFTkSuQmCC';

(function bootstrap() {
  if (OpenLayers && WazeWrap.Ready) {
    initialize();
  } else {
    setTimeout(bootstrap, 1000);
  }
})();

function initialize() {
  polyfillOpenLayers();
  createMarkerIcon();
  addKadastrLayer();
  addMarkerLayer();
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
    markerLayer.setVisibility(checkboxState);
  });
}

function addKadastrLayer() {
  kadastrLayer = new OpenLayers.Layer.WMS(
    'Kadastr',
    'https://map.land.gov.ua/geowebcache/service/wms?tiled=true',
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

function addMarkerLayer() {
  markerLayer = new OpenLayers.Layer.Markers(
    'Karastr marker',
    {
      isBaseLayer: false,
      visibility: false
    }
  );
  W.map.addLayer(markerLayer);
}

function addEventHandlers() {
  W.map.events.register('click', null, e => {
    if (!kadastrLayer.getVisibility() || W.map.getZoom() > 4) return;
    let coordinates = W.map.getLonLatFromPixel(e.xy);
    drawMarker(coordinates);
    fetchAreaData(coordinates);
  });
  W.map.events.register('zoomend', null, e => {
    if (e.object.zoom > 4 && kadastrLayer.getVisibility()) {
      W.map.zoomTo(4);
    }
  });
}

function createMarkerIcon() {
  const size = new OpenLayers.Size(50, 50);
  const offset = new OpenLayers.Pixel(-(size.w/2), -size.h*0.8);
  markerIcon = new OpenLayers.Icon(markerIconURL, size, offset);
}

function drawMarker(coordinates) {
  let {lon, lat} = coordinates;
  let lonLat = new OpenLayers.LonLat(lon, lat);
  markerLayer.clearMarkers();
  markerLayer.addMarker(new OpenLayers.Marker(lonLat, markerIcon));
}

function fetchAreaData(coordinates) {
  $('#kadastr-area-data').html('<div class="decorated-bg"><div id="loader-thinking">🤔</div> Завантаження</div>');
  $.ajax({
    url: 'https://cors-anywhere.herokuapp.com/https://map.land.gov.ua/kadastrova-karta/getobjectinfo',
    type: 'POST',
    dataType : "json",
    data: {
      x: coordinates.lat,
      y: coordinates.lon,
      zoom: 15,
      actLayers: ['kadastr']
    },
    success: data => {
      if (data.dilanka) {
        showAreaData(data.dilanka);
        getLocalityName();
      } else {
        $('#kadastr-area-data').html('<div class="decorated-bg">😕 Ділянку не знайдено</div>');
      }
    },
    error: () => {
      $('#kadastr-area-data').html('<div class="decorated-bg">⛔ Помилка</div>');
    }
  });
}

function showAreaData(areaData) {
  areaData = areaData.replace(/hidden/g, '')
                     .replace(/\&nbsp\;/g, '')
                     .replace(/Кадастровий номер/ig, 'Ділянка');
  $('#kadastr-area-data').html(`<div class="decorated-bg">${areaData}</div>`);
  $(`#kadastr-area-data li`).each((idx, el) => {
    let item = $(el);
    let itemText = item.text();
    if (/Витяг/i.test(itemText)) {
      item.hide();
    } else if (/Площа/i.test(itemText)) {
      $('<li><br/></li>').insertAfter(item);
    }
  });
}

function getLocalityName() {
  var kadastrNumber = $('#kadastr-area-data ul li')[0];
  if (!kadastrNumber) return;
  var koatuu = /:(\d+):/.exec(kadastrNumber.innerText);
  var zoneNumber = /:\d+:(\d+):/.exec(kadastrNumber.innerText);
  if (!koatuu[1] || !zoneNumber[1]) return;
  fetch(`https://cors-anywhere.herokuapp.com/http://wazeukraine.ml:7979/locality?code=${koatuu[1]}&zone_number=${zoneNumber[1]}`)
    .then(response => response.json())
    .then(data => {
      if (data.name) {
        var localityName = data.name.toLowerCase().replace(/^./, data.name[0].toUpperCase());
        if (/\//.test(localityName)) {
          localityName = "Поза населеним пунктом";
        }
        $('#kadastr-area-data ul').prepend('<li><div class="label">Населений пункт:</div><span>'+localityName+'</span></li>');
      }
    });
}

function polyfillOpenLayers() {
  "use strict";OpenLayers.Icon=OpenLayers.Class({url:null,size:null,offset:null,calculateOffset:null,imageDiv:null,px:null,initialize:function initialize(a,b,c,d){this.url=a,this.size=b||{w:20,h:20},this.offset=c||{x:-(this.size.w/2),y:-(this.size.h/2)},this.calculateOffset=d;var e=OpenLayers.Util.createUniqueID("OL_Icon_");this.imageDiv=OpenLayers.Util.createAlphaImageDiv(e)},destroy:function destroy(){this.erase(),OpenLayers.Event.stopObservingElement(this.imageDiv.firstChild),this.imageDiv.innerHTML="",this.imageDiv=null},clone:function clone(){return new OpenLayers.Icon(this.url,this.size,this.offset,this.calculateOffset)},setSize:function setSize(a){null!=a&&(this.size=a),this.draw()},setUrl:function setUrl(a){null!=a&&(this.url=a),this.draw()},draw:function draw(a){return OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv,null,null,this.size,this.url,"absolute"),this.moveTo(a),this.imageDiv},erase:function erase(){null!=this.imageDiv&&null!=this.imageDiv.parentNode&&OpenLayers.Element.remove(this.imageDiv)},setOpacity:function setOpacity(a){OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv,null,null,null,null,null,null,null,a)},moveTo:function moveTo(a){null!=a&&(this.px=a),null!=this.imageDiv&&(null==this.px?this.display(!1):(this.calculateOffset&&(this.offset=this.calculateOffset(this.size)),OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv,null,{x:this.px.x+this.offset.x,y:this.px.y+this.offset.y})))},display:function display(a){this.imageDiv.style.display=a?"":"none"},isDrawn:function isDrawn(){var a=this.imageDiv&&this.imageDiv.parentNode&&11!=this.imageDiv.parentNode.nodeType;return a},CLASS_NAME:"OpenLayers.Icon"});
}
