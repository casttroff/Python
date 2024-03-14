/*===================================================
                      OSM  LAYER               
===================================================*/
var overallBounds = L.latLngBounds();
var map = L.map('map').setView([-31.1228499839105,-64.1473438921363], 8);
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm.addTo(map);

/*===================================================
                      MARKER               
===================================================*/

var singleMarker = L.marker([28.25255,83.97669]);
singleMarker.addTo(map);
var popup = singleMarker.bindPopup('This is a popup')
popup.addTo(map);

/*===================================================
                     TILE LAYER               
===================================================*/

var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
subdomains: 'abcd',
	maxZoom: 19
});
CartoDB_DarkMatter.addTo(map);

// Google Map Layer

googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
 });
googleStreets.addTo(map);

 // Satelite Layer
googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
   maxZoom: 20,
   subdomains:['mt0','mt1','mt2','mt3']
 });
googleSat.addTo(map);


/*===================================================
                      GEOJSON               
===================================================*/

var linedata = L.geoJSON(lineJSON).addTo(map);
var pointdata = L.geoJSON(pointJSON).addTo(map);
var nepalData = L.geoJSON(nepaldataa).addTo(map);
var polygondata = L.geoJSON(polygonJSON,{
    onEachFeature: function(feature,layer){
        layer.bindPopup('<b>This is a </b>' + feature.properties.name)
    },
    style:{
        fillColor: 'red',
        fillOpacity:1,
        color: 'green'
    }
}).addTo(map);




/*===================================================
                      LAYER CONTROL               
===================================================*/


var baseLayers = {
    "Satellite":googleSat,
    "Google Map":googleStreets,
    "OpenStreetMap": osm,
};


var overlays = {
    "Marker": singleMarker,
    "PointData":pointdata,
    "LineData":linedata,
    "PolygonData":polygondata
};


/*===================================================
                      SEARCH BUTTON               
===================================================*/

L.Control.geocoder().addTo(map);


/*===================================================
                      Choropleth Map               
===================================================*/

function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.density),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function style2(feature) {
    return {
        fillColor: '#800026',
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function highlightFeature(e) {
    var layer = e.target;
    console.log("GetBounds", e.target.getBounds());
    console.log("Target", e.target.feature.geometry.coordinates);
    console.log("Map", map)

    //geoJsonLayers.forEach(function(layer, index) {
    //    console.log(`Contenido de la capa ${index + 1}:`, layer);
    //});

    layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

var geojson;

async function get_ubication(lat, lng) {
    const url = `https://apis.datos.gob.ar/georef/api/ubicacion?lat=${lat}&lon=${lng}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('No se pudo obtener la ubicación.');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener la ubicación:', error);
        return null;
    }
}

async function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
    if('categoria' in e.target.feature.properties){
        type = e.target.feature.properties.categoria;
        coordsLat = e.latlng['lat'];
        coordsLng = e.latlng['lng'];

        const data = await get_ubication(coordsLat, coordsLng);

        if(data){

            const { departamento, municipio, provincia } = data.ubicacion;
            const dptoId = departamento.id;
            const dptoName = departamento.nombre;
            const muniId = municipio.id;
            const muniName = municipio.nombre;
            const provId = provincia.id;
            const provName = provincia.nombre;
            var geoJsonLayers = [];

            map.eachLayer(function(layer) {
                if (layer instanceof L.GeoJSON) {
                    for (const key in layer['_layers']) {
                        if (layer['_layers'].hasOwnProperty(key)) {
                            const value = layer['_layers'][key];
                            if('prov_id' in value.feature.properties && !('categoria' in value.feature.properties)){
                                if(value.feature.properties.prov_id == provId && value.feature.properties.id == dptoId){
                                    console.log("coords", value.feature.geometry.coordinates);
                                    L.geoJSON(value.feature.geometry, {
                                        style: {
                                            weight: 6,
                                            fillColor: "#aaa",
                                            fillOpacity: 1,
                                            color: "#444"
                                        }
                                    }).addTo(map);
                                    L.geoJSON(e.target.feature.geometry, {
                                        style: {
                                            weight: 6,
                                            fillColor: "#aaa",
                                            fillOpacity: 1,
                                            color: "#444"
                                        }
                                    }).addTo(map);
                                }
                            }
                        }
                    }
                }
            });
            console.log(`dptoId ${dptoId} dptoname ${dptoName} muniId ${muniId} muniname ${muniName} provId ${provId} provname ${provName} `)
        }
    }
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

geojson = L.geoJson(null, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>US Population Density</h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
        : 'Hover over a state');
};

info.addTo(map);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);

class StateMapDrawer {
    constructor(provincesArr) {
        this.provincesArr = provincesArr;
        this.overlays = {};
    }

    InitializeMap(){
        const mapProvincesArr = this.provincesArr;
        // Usa Promise.all para manejar múltiples llamadas asíncronas al mismo tiempo
        const convertedGeoJsonPromises = mapProvincesArr.map(province => this.getRoutes(province));
    }

    async getRoutes(province) {
        const mapObjectArr = ['provincias', 'departamentos', 'rutas'];
        const municipalitiestArr = municipalitiesJson;

        for(let i=0; i<mapObjectArr.length; i++){

            if(mapObjectArr[i] != 'calles' && mapObjectArr[i] != 'rutas'){
                const shpFilePath = `./provincias/${province}/${mapObjectArr[i]}.shp`;
                const convertedGeoJsonLayer = await this.convertToGeoJson(shpFilePath);
                this.overlays[mapObjectArr] = convertedGeoJsonLayer;
            }
            else{
                for(let j=0; j<municipalitiestArr.length; j++){
                    if(municipalitiestArr[j]['provincia'] == province){
                        const shpFilePath = `./provincias/${province}/${mapObjectArr[i]}/municipio-${municipalitiestArr[j]['municipalidad_nombre']}/calles.shp`;
                        const convertedGeoJsonLayer = await this.convertToGeoJson(shpFilePath);
                    }
                }
            }
        }
    }

    async convertToGeoJson(url){
        const shpBuffer = await fetch(url).then(response => response.arrayBuffer());
        const shxBuffer = await fetch(`${url.slice(0, -3)}shx`).then(response => response.arrayBuffer());
        const dbfBuffer = await fetch(`${url.slice(0, -3)}dbf`).then(response => response.arrayBuffer());
        const source = await shapefile.open(shpBuffer, dbfBuffer, shxBuffer);
        const geoJsonFeatures = [];
        let result = await source.read();

        while (!result.done) {
            geoJsonFeatures.push(result.value);
            result = await source.read();
        }

        L.geoJSON(geoJsonFeatures).addTo(map);
        // geojson = L.geoJson(geoJsonFeatures, {style: style}).addTo(map);
        geojson = L.geoJson(geoJsonFeatures, {
            style: style2,
            onEachFeature: onEachFeature
        }).addTo(map);
    }

}

const provincesArr = ['cordoba'];
var mapDrawed = new StateMapDrawer(provincesArr);
mapDrawed.InitializeMap();


class StateMapDrawer {
    constructor(target, provinceSlug, static_path) {
        this.target = target;
        this.provinceSlug = provinceSlug;
        this.isMobile = L.Browser.mobile;
        this.map = null;
        this.drawnItems = null;
        this.static_path = static_path;
        this.intersectionPopup = null; // Para debug de coord
        this.mouseCoords = null; // Para debug de coord
        this.mouseIsOver = false; // Para controlar funciones si el mouse esta sobre una geometria dibujable
        this.pointsInLines = []; // Pasar a json para controlar mas de una linea divisora
        this.contourCoordinates = {}; // Se guardan los contornos de todos los departamentos
        this.intersectPoints = {}; // Guarda los puntos de interseccion con los contornos
    }

    /**
     * @returns {Promise<void>}
     */
    async drawMap() {
        this.initializeMap();
        await this.fetchShapefileComponents('departamentos');
        await this.drawShapefile('departamentos');

        await this.fetchShapefileComponents('calles'); // Para dividir los archivos .shp
        await this.drawShapefile('calles');
    }

    /**
     *
     */
    initializeMap() {
        this.map = L.map(this.target, {
            center: [0, 0],
            zoom: this.isMobile ? 6 : 8,
            zoomControl: false,
            attributionControl: true
        });

        this.map.dragging.disable();
        this.map.scrollWheelZoom.disable();

        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);
    }

    /**
     *
     * @returns {Promise<{dbfBuffer: ArrayBuffer, shxBuffer: ArrayBuffer, shpBuffer: ArrayBuffer}>}
     */
    async fetchShapefileComponents(mapObject) {
        const shp = `${this.static_path}/${this.provinceSlug}/${mapObject}.shp`;
        const dbf = `${this.static_path}/${this.provinceSlug}/${mapObject}.dbf`;
        const shx = `${this.static_path}/${this.provinceSlug}/${mapObject}.shx`;

        const headers = {'Content-Type': 'application/shapefile+zip; charset=latin1'};

        const [shpBuffer, dbfBuffer, shxBuffer] = await Promise.all([
            fetch(shp, {headers}).then(response => response.arrayBuffer()),
            fetch(dbf, {headers}).then(response => response.arrayBuffer()),
            fetch(shx, {headers}).then(response => response.arrayBuffer())
        ]);

        return {shpBuffer, dbfBuffer, shxBuffer};
    }

    /**
     *
     * @returns {Promise<*>}
     */
    async drawShapefile(mapObject) {
        const {shpBuffer, dbfBuffer, shxBuffer} = await this.fetchShapefileComponents(mapObject);

        return shapefile
            .open(shpBuffer, dbfBuffer, shxBuffer)
            .then(source => {
                let overallBounds = L.latLngBounds();
                console.log("OverallBounds in drawShapefile", overallBounds);
                const log = (result) => {
                    if (result.done) {
                        if (overallBounds.isValid()) {
                            this.map.fitBounds(overallBounds);
                        } else {
                            console.error('Error: Bounds are not valid.');
                        }
                        return;
                    }
                    this.handleFeature(result.value, overallBounds);

                    // Obtención de las coordenadas del contorno
                    this.contourCoordinates[result.value.properties.nombre] = result.value.geometry.coordinates;

                    return source.read().then(log);
                };
                return source.read().then(log);
            })
            .catch(error => {
                console.error('Error loading Shapefile:', error);
            });
    }

    customEscape(str) {
        return str.replace(/[^A-Za-z0-9\-_.*!()]/g, function (char) {
            return '%' + char.charCodeAt(0).toString(16).toUpperCase();
        });
    }

    /**
     *
     * @param feature
     * @param overallBounds
     */
    handleFeature(feature, overallBounds) {
        let attributes = feature.properties;

        for (let prop in attributes) {
            if (attributes !== undefined) {
                attributes[prop] = decodeURIComponent(this.customEscape(attributes[prop]));
            }
        }

        let markerCoordinates = [parseFloat(attributes.centr_lat), parseFloat(attributes.centr_lon)];
        let layer;

        layer = L.geoJSON(feature.geometry, {
            style: {
                weight: 2,
                fillColor: "#ccc",
                fillOpacity: 1,
                color: "#444"
            }
        });

        let customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: ``,
        });

        let marker = L.marker(markerCoordinates, {icon: customIcon});

        marker.bindTooltip(attributes.nombre, {
            permanent: true,
            direction: 'center',
            className: 'custom-tooltip'
        });

        // layer.on("mousemove", (event) => this.handleMouseMove(layer, event));
        layer.on("mouseover", () => this.handleMouseOver(layer, attributes,marker));
        layer.on("mouseout", () => this.handleMouseOut(layer, marker));
        layer.on("click", (event) => this.handleClick(layer, event, attributes));

        overallBounds.extend(layer.getBounds());

        this.drawnItems.addLayer(layer);
    }

    handleMouseOver(layer, attributes, marker) {
        this.mouseIsOver = true;
        marker.addTo(this.drawnItems)
        layer.setStyle({
            fillColor: "#000",
            weight: 3,
            color: "#555"
        });
    }

    handleMouseOut(layer, marker) {
        this.mouseIsOver = false;
        layer.setStyle({
            fillColor: "#ccc",
            weight: 2,
            color: "#444"
        });

        this.map.off('mousemove', this.handleMouseMove);

        this.map.removeLayer(marker);

        if (this.intersectionPopup) {
            this.map.closePopup(this.intersectionPopup);
            this.intersectionPopup = null;
        }
    }

    handleClick(layer, event, attributes) {
        if (this.mouseIsOver) {
            const latlng = event.latlng;
            this.addVerticalLine(latlng, layer, attributes);
        }
    }

    addVerticalLine(mouseLatLng, layer, attributes) {
        // Busca si hay un punto de interseccion con la linea y el contorno
        if(this.intersectPoints[attributes.nombre]){
            if(this.intersectPoints[attributes.nombre].length < 2){
                // Busca si hay mas de un punto en la linea
                if (this.pointsInLines.length > 0){
                    const nearestCoordinate = this.getNearestCoordinate(mouseLatLng.lat, mouseLatLng.lng, this.contourCoordinates[attributes.nombre][0], attributes.nombre);
                    const lastPoint = this.pointsInLines[this.pointsInLines.length - 1];

                    const newLineCoords = [lastPoint, nearestCoordinate]
                    const verticalLine = L.polyline(newLineCoords, { color: 'blue', weight: 3 });
                    verticalLine.addTo(this.drawnItems);
                    this.pointsInLines.push(nearestCoordinate);
                }
            }
            // Si hay dos intersecciones con el contorno divide la zona
            if(this.intersectPoints[attributes.nombre].length == 2) {
                this.splitZone(attributes.nombre)
            }
        }
        else {
            // Si no hay ningun punto de interseccion, el primer punto dibujado lo intersecta
            const nearestCoordinate = this.getNearestCoordinate(mouseLatLng.lat, mouseLatLng.lng, this.contourCoordinates[attributes.nombre][0], attributes.nombre);
            const newLineCoords = [[mouseLatLng.lat, mouseLatLng.lng], nearestCoordinate];
            const verticalLine = L.polyline(newLineCoords, { color: 'blue', weight: 3 });
            verticalLine.addTo(this.drawnItems);
            this.pointsInLines.push([mouseLatLng.lat, mouseLatLng.lng]);
        }
    }

    // Obtiene la cercanía entre el click y el contorno usando coordenadas
    getNearestCoordinate(lat1, lng1, contourCoordinates, name) {
        let distanciaMinima = Infinity;
        let nearestCoordinate = [];
        const R = 6371;

        for(let i = 0; i < contourCoordinates.length; i++){
            const contourLng = contourCoordinates[i][0];
            const contourLat = contourCoordinates[i][1];
            const dLat = (contourLat - lat1) * (Math.PI / 180);
            const dLng = (contourLng - lng1) * (Math.PI / 180);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) * Math.cos(contourLat * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distancia = R * c;


            if (distancia < distanciaMinima) {
                distanciaMinima = distancia;
                nearestCoordinate = [contourLat, contourLng];
            }
        }
        // Si ya existe un punto de interseccion, para que haya otro, el click debe estar a menos de 10km del contorno
        if(this.intersectPoints[name]){
            if (distanciaMinima < 10){
                this.intersectPoints[name].push(nearestCoordinate);
                console.log("intersect points", this.intersectPoints);
                // Devuelve la coordenada mas cercana al click
                return nearestCoordinate;
            }
            else {
                // Si la distancia es mayor a 10 devuelve la coordenada del click
                return [lat1, lng1]
            }
        }
        else {
            // Si no existe punto de interseccion, el primer click genera un punto de interseccion con la coord. mas cercana al click
            this.intersectPoints[name] = [nearestCoordinate];
            this.pointsInLines.push(nearestCoordinate);
            return nearestCoordinate;
        }
    }

    splitZone(name) {
        const pointOfIntersection1 = this.intersectPoints[name][0];
        const pointOfIntersection2 = this.intersectPoints[name][1];
        const coordinatesSide1 = [];
        const coordinatesSide2 = [];
        let foundedCoords = 0;

        // Itera en las coordenadas del contorno
        for (let i = 0; i < this.contourCoordinates[name][0].length - 1; i++) {
            const contourLng = this.contourCoordinates[name][0][i][0];
            const contourLat = this.contourCoordinates[name][0][i][1];

            // Checkea si esta coordenada del contorno coincide con un punto de la linea
            if ((contourLat === pointOfIntersection1[0] && contourLng === pointOfIntersection1[1]) ||
                (contourLat === pointOfIntersection2[0] && contourLng === pointOfIntersection2[1])) {
                foundedCoords++;

                if (foundedCoords == 1){
                    // Una vez que encuentra el primer punto de inteseccion sigue las coordenadas de la linea para luego cerrar la zona 1
                    if (contourLat == this.pointsInLines[0][0]){
                        const slisedPoints = this.pointsInLines.slice(0, this.pointsInLines.length - 1)
                        coordinatesSide1.push(...slisedPoints)
                    }
                    if (contourLat == this.pointsInLines[this.pointsInLines.length - 1][0]){
                        // Da vuelta el array para que las coordenadas sigan el orden correcto para ser dibujado
                        const reversedPoints = [...this.pointsInLines].reverse();
                        const slisedPoints = reversedPoints.slice(0, reversedPoints.length - 1)
                        coordinatesSide1.push(...slisedPoints)
                    }
                }
                if (foundedCoords == 2){
                    // Agregar las coordenadas de la linea al final del array para cerrar el poligono 2
                    if (contourLat == this.pointsInLines[0][0]){
                        coordinatesSide2.push(...this.pointsInLines)
                    }
                    if (contourLat == this.pointsInLines[this.pointsInLines.length - 1][0]){
                        const reversedPoints = [...this.pointsInLines].reverse();
                        coordinatesSide2.push(...reversedPoints)
                    }
                }
            }

            if (foundedCoords < 1 || foundedCoords >= 2) {
                coordinatesSide1.push([contourLat, contourLng]);
            }
            if (foundedCoords === 1) {
                coordinatesSide2.push([contourLat, contourLng]);
            }
        }

        // Agregar la primer coordenada al final del array para cerrar el poligono 1
        const firstPointLat = this.contourCoordinates[name][0][0][1];
        const firstPointLng = this.contourCoordinates[name][0][0][0]
        coordinatesSide1.push([firstPointLat, firstPointLng]);

        for (let i = 0; i < coordinatesSide1.length - 1; i++) {
            this.drawDivision(coordinatesSide1[i], coordinatesSide1[i + 1], 'red');
        }
        for (let i = 0; i < coordinatesSide2.length - 1; i++) {
            this.drawDivision(coordinatesSide2[i], coordinatesSide2[i + 1], 'blue');
        }
    }

    drawDivision(c1, c2, color) {
        const newLineCoords = [c1, c2]
        const verticalLine = L.polyline(newLineCoords, { color: color, weight: 3 });
        verticalLine.addTo(this.drawnItems);
    }

}
