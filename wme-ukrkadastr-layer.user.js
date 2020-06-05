// ==UserScript==
// @name           WME Ukrkadastr Layer
// @author         Andrei Pavlenko, Anton Shevchuk
// @version        0.7.6
// @include        /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor.*$/
// @exclude        https://www.waze.com/user/*editor/*
// @exclude        https://www.waze.com/*/user/*editor/*
// @grant          none
// @description    Adds kadastr layer
// @require        https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @require        https://greasyfork.org/scripts/389117-apihelper/code/APIHelper.js?version=812935
// @require        https://greasyfork.org/scripts/389577-apihelperui/code/APIHelperUI.js?version=812941
// @namespace      https://greasyfork.org/users/182795
// ==/UserScript==

/* jshint esversion: 8 */
/* global require */
/* global $ */
/* global W */
/* global WazeWrap */
/* global APIHelper */
/* global APIHelperUI */
/* global OpenLayers */
(function () {
  'use strict';

  const NAME = 'kadastr';

  let kadastrLayer, markerLayer, markerIcon;
  let helper, tab;
  let visibility = !!localStorage.getItem('kadastr-layer');
  const markerIconURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABR5JREFUeNrsXF1uEzEQdtKkSX/TqDwUISCIV6TkGQklHACpPQHhBuEG2xOQnIDkBqk4AImQeC4Sz9DwQh9AZUtp0iZtmakcRMG760121/bujGStlLU93vlmxp/t3aSurq4YiTpJkwkIAAKAhAAgAEgIAAKAhAAgAEgIAAKAhAAgAEgIgERIxqTBHj57UoELlpJDlQMo+1tv3u2b8kwp3c8DwOh1uGxDqUEpSDazofSgdAGMNgHg3+gbcGnwUpizOwSjiQXA+EEAeBsfjW4FYHgREBaA0CQAnL2+C6Uasqo+pjRdokELAPjk2gvB692ioabDZJ1OoPEZ19XjupMLgCLjawWCshQED45cft+v8S9hvKPJBTsdj2/8vpzNsnxmgaVTqVnSUQXS0UHSFmJdP8a3z87Z0WjEzsD4Ivk+HF1fcwBCMZ9nhdyin0jo8gVeMlIQeD/SzLJM3ZPzMft0ZLPDk1+Oxv9bsA7WxTbYVlLKfEzxT0F+Ug8aEj1/rkQPkbC1uqJtKlIRAVZUxp+mLuxLMhVZsY4Avtg6isr4M0ZCMcpFWtQRUJfJ+R7Gx1TRgbID5SkvO/w32y0SJOeEepQGyegEAFLMr+7pAo3cqL7/KPLQbv/xI4ww3Ot5LmqMfT8sFryoap33Ea8UJJN+vp0O/9BJgbwAw7dldAEQaMTXonubS3l2a3lJmzQUZQqqeVU4dk49LVnjo/C6LZ86fI3VRAAqXvx9fHkpujWYkZ1YvO0NQR0S64lK4gA4nUycbrUdcr5XFGCbtk9dsQZgw+3mhdj7p1sW82x3+NElNVbjtyJEMnTwSvDkmffsndoOvSOAJQ6ApIo2AOQWFpwoZWnWPp3aOulKNAAui6N5KGHNp65YA9Bzu4kHKiFsDdR96pIaq6kAHLgD4LgrUoVUsj1D+sE2VZH3u+iSGmssIwDF5RSrDQat+DB+xWkNsLaYDWSsxgHADzoGbnU2nfdorg/QwbA1CePXmMtB/6b3PtAgykOZqCdh10VVNp1mxXzODYS3YOCuKCXhb3gP6zgZH/tGHfOMMWiJ+kAGaeFntzq4Jf3l+KfU+S/IB371PF/Gw/p762syDOhBbCOAP1jfi47eXlmRpYplGeP76LOflDNhKW+VSBdMti+8BjE24wEAD8MJsiNjuNLGOluVYy1CwbY+jN/hY0vEShhfQbdlUsedtVV2F4wowd1vrCmwDbaVTGU2H1PkovLVRHzgV37a4GEKHqyfTSb/Hd5gusplMtdeP0PqeqnquwGlr6cDCDjh3Ve8HYO8v6RKuerNuDpTL0rHoBQAPun1FQ6hr2Li1SkCVHug8ghUDgBf+LQUqG6p+iZAtwiYLoDsCPXZKhZd2gLA30KL0iAWfSUppqX4FkM5ZDUfwPgVXZ5Zt7ciGjHRYSYAnBLuhahiTzXt1D0CwvbQhm4Pqx0AnBruhtD1rg6004QIQGkGTEun/5jCCAB5Whpkumjo+Fc12tHQkGipVrTTlBQU5KTZ0PkBtQYgAFqqHe00LQLm9eCG7g+nPQBz0FItaaeJETClpQMf9Qe60k4jAZhht9TSlXYaRUMFtBQnVK8/9cNjxpopz2TaN2JWQHUIgDloqdtbdR3daafpETD1cNE+kW2a9xsJAKeWIobTNIF2xiECRLTUGNoZCwAEtNQY2mk0DXWgpcwk2vmvZJjZ0jB8/GZHQByE/qyDACAASAgAAoCEACAASAgAAoCEACAASAgAAoCEAEiG/BZgAIdH+4FfAgoVAAAAAElFTkSuQmCC';

  APIHelper.bootstrap();
  APIHelper.addStyle(`
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
  `);

  $(document)
    .on('ready.apihelper', ready);

  function ready() {
    polyfillOpenLayers();
    createMarkerIcon();
    addKadastrLayer();
    addMarkerLayer();
    createSwitcher();
    createTab();
    addHandlers();
  }

  function createSwitcher() {
    let $ul = $('.collapsible-GROUP_DISPLAY');

    let checkbox = document.createElement("wz-checkbox");
    checkbox.id = 'layer-switcher-item_map_kadastr';
    checkbox.className = "hydrated";
    checkbox.checked = visibility;
    checkbox.appendChild(document.createTextNode("Кадастр"));

    $ul.append(checkbox);
  }

  function switchLayer(flag) {
    localStorage.setItem('kadastr-layer', flag ? '1' : '');
    visibility = flag;

    kadastrLayer.setVisibility(flag);
    markerLayer.setVisibility(flag);
    if (flag) {
      $('#kadastr').tab('show');
      $('.kadastr-area-data').html('Оберіть об\'єкт для отримання інформації');
    }
  }

  function createTab() {
    // Setup Tab with options
    helper = new APIHelperUI(NAME);
    tab = helper.createTab('Кадастр 🌍', '');
    let text = visibility
      ? 'Оберіть об\'єкт для отримання посилання'
      : 'Ввімкніть шар кадастру та оберіть об\'єкт для отримання інформації';
    tab.addText('area-data', text);
    tab.inject();
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
        resolutions: [4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135, 0.25],
        serverResolutions: [4.777314267158508, 2.388657133579254],
        isBaseLayer: false,
        visibility: visibility,
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
        visibility: visibility
      }
    );
    W.map.addLayer(markerLayer);
  }

  function addHandlers() {
    W.map.events.register('click', null, e => {
      if (!visibility) return false;
      let coordinates = W.map.getLonLatFromPixel(e.xy);
      drawMarker(coordinates);
      prepareLink(coordinates);
      //fetchAreaData(coordinates);
      $('#kadastr').tab('show');
    });

    $(document).on('click', '#layer-switcher-item_map_kadastr', e => {
      switchLayer(e.target.checked);
    });

    /* name, desc, group, title, shortcut, callback, scope */
    new WazeWrap.Interface.Shortcut(
      'Kadastr',
      'Відображення кадастру',
      'layers',
      'Кадастр',
      'S+K',
      function () {
        let checked = localStorage.getItem('kadastr-layer');
        switchLayer(!checked);
        $('#layer-switcher-item_map_kadastr').prop('checked', !checked);
      },
      null
    ).add();
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

  function prepareLink(coordinates) {
    // https://map.land.gov.ua/?cc=4036687.768852307,6463401.541891187&z=16&l=kadastr&bl=ortho10k_all
    let url = new URL('https://map.land.gov.ua/');
    url.searchParams.set('cc', coordinates.lon +','+ coordinates.lat);
    url.searchParams.set('z', '16');
    url.searchParams.set('l', 'kadastr');
    url.searchParams.set('bl', 'ortho10k_all');

    let $area = $('.kadastr-area-data');
    $area.html('');
    $area.html('<a href="'+ url.toString() +'" target="_blank">'+ url.hostname +'?cc='+ url.searchParams.get('cc') +'</a>');
  }

  function fetchAreaData(coordinates) {
    let $area = $('.kadastr-area-data');

    $area.html('<div id="loader-thinking">🤔</div> Завантаження');

    let params = new URLSearchParams();
        params.set('x', coordinates.lat);
        params.set('y', coordinates.lon);
        params.set('zoom', '13');
        params.set('actLayers[]', 'kadastr');

    fetch('https://waze.com.ua/kadastr_api', {
      method: 'POST',
      body: params
    }).then(data => data.json()).then(data => {
      let parcel = data.parcel;
      let district = data.district;
      if (!parcel) {
        $area.html('😕 Ділянку не знайдено');
        return;
      }
      parcel = parcel[0];

      $area.html('');
      $area.append(`
        <div><strong>Ділянка: </strong>${parcel.cadnum}</div>
        <div><strong>Область: </strong>${district.natoobl}</div>
        <div><strong>Населений пункт: </strong><span id="kadastr-locality-name">не визначено</span></div>
        <div><strong>Тип власності: </strong>${parcel.ownership}</div>
        <div><strong>Цільове призначення: </strong>${parcel.use}</div>
        <div><strong>Площа: </strong>${parcel.area+' '+parcel.unit_area}</div>
        <div style="margin-top: 10px;"><a target="_blank" style="color: #26bae8; padding: 5px 0;" href="${parcel.linkToOwnershipInfo}">Інформація про ділянку</a></div>
      `);
      getLocalityName(parcel.koatuu, data.ikk.zona);
    }).catch(err => {
      $area.html('⛔ Помилка');
      console.error(err);
    });
  }

  function getLocalityName(koatuu, zoneNumber) {
    fetch(`https://waze.com.ua/kadastr_locality?code=${koatuu}&zone_number=${zoneNumber}`)
      .then(response => response.json())
      .then(data => {
        if (data.name) {
          let localityName = data.name.toLowerCase().replace(/^./, data.name[0].toUpperCase());
          if (/\//.test(localityName)) return;
          $('#kadastr-locality-name').html(localityName);
        }
      });
  }

  /**
   * This polyfill is required for OpenLayers.Icon functionality
   * @link ?
   */
  function polyfillOpenLayers() {
    OpenLayers.Icon = OpenLayers.Class({
      url: null,
      size: null,
      offset: null,
      calculateOffset: null,
      imageDiv: null,
      px: null,
      initialize: function initialize(a, b, c, d) {
        this.url = a, this.size = b || {w: 20, h: 20}, this.offset = c || {
          x: -(this.size.w / 2),
          y: -(this.size.h / 2)
        }, this.calculateOffset = d;
        var e = OpenLayers.Util.createUniqueID("OL_Icon_");
        this.imageDiv = OpenLayers.Util.createAlphaImageDiv(e)
      },
      destroy: function destroy() {
        this.erase(), OpenLayers.Event.stopObservingElement(this.imageDiv.firstChild), this.imageDiv.innerHTML = "", this.imageDiv = null
      },
      clone: function clone() {
        return new OpenLayers.Icon(this.url, this.size, this.offset, this.calculateOffset)
      },
      setSize: function setSize(a) {
        null != a && (this.size = a), this.draw()
      },
      setUrl: function setUrl(a) {
        null != a && (this.url = a), this.draw()
      },
      draw: function draw(a) {
        return OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv, null, null, this.size, this.url, "absolute"), this.moveTo(a), this.imageDiv
      },
      erase: function erase() {
        null != this.imageDiv && null != this.imageDiv.parentNode && OpenLayers.Element.remove(this.imageDiv)
      },
      setOpacity: function setOpacity(a) {
        OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv, null, null, null, null, null, null, null, a)
      },
      moveTo: function moveTo(a) {
        null != a && (this.px = a), null != this.imageDiv && (null == this.px ? this.display(!1) : (this.calculateOffset && (this.offset = this.calculateOffset(this.size)), OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv, null, {
          x: this.px.x + this.offset.x,
          y: this.px.y + this.offset.y
        })))
      },
      display: function display(a) {
        this.imageDiv.style.display = a ? "" : "none"
      },
      isDrawn: function isDrawn() {
        return this.imageDiv && this.imageDiv.parentNode && 11 !== this.imageDiv.parentNode.nodeType;
      },
      CLASS_NAME: "OpenLayers.Icon"
    });
  }
})();
