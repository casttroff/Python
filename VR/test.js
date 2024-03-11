/*jshint esversion: 8 */
/* global console */

/* global console, L, shapefile, Fuse */


class ShapefileMapDrawer {
    constructor(target, shpPath) {
        this.map = L.map(target, {
            center: [0, 0],
            zoom: 1,
            zoomControl: false,
            attributionControl: false
        });
        this.map.dragging.disable();
        this.map.scrollWheelZoom.disable();
        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);
        this.shpPath = shpPath;
        this.overallBounds = L.latLngBounds(); // Initialize overallBounds here
    }

    async drawMap() {
        try {
            const shapefileBuffer = await this.fetchShapefile();
            const source = await shapefile.open(shapefileBuffer);
            await this.drawFeatures(source);
            this.fitMapToOverallBounds();
            return Promise.resolve();
        } catch (error) {
            console.error('Error drawing Shapefile map:', error);
            return Promise.reject(error);
        }
    }

    async fetchShapefile() {
        const response = await fetch(this.shpPath);
        return await response.arrayBuffer();
    }

    async drawFeatures(source) {
        while (true) {
            const result = await source.read();
            if (result.done) {
                return Promise.resolve();
            }
            const geoJSONLayer = this.createGeoJSONLayer(result.value);
            this.overallBounds.extend(geoJSONLayer.getBounds());
            geoJSONLayer.addTo(this.map);
        }
    }

    createGeoJSONLayer(feature) {
        return L.geoJSON(feature, {
            style: {
                weight: 2,
                fillColor: "#ccc",
                fillOpacity: 1,
                color: "#444"
            },
        });
    }

    fitMapToOverallBounds() {
        const maxZoom = 13;
        this.map.fitBounds(this.overallBounds, {
            padding: [0, 0],
            maxZoom: maxZoom,
        });
    }
}

class MapGenerator {
    constructor(selector, static_path) {
        this.selector = selector;
        this.static_path = static_path;
    }

    genMaps() {
        let list_of_containers = document.querySelectorAll(this.selector);
        list_of_containers.forEach((el) => {
            let province_slug = el.getAttribute('data-slug');
            let map_id = el.getAttribute('id');
            let map_shp = `${this.static_path}/${province_slug}/departamentos.shp`;
            console.log(map_shp, map_id);
            const mapDrawer = new ShapefileMapDrawer(map_id, map_shp);
            mapDrawer.drawMap().then(() => {
            }).catch((error) => {
                console.error('Error drawing Shapefile map:', error);
            });
        });
    }
}

class Searcher {
    /**
     *
     * @param {object} opts
     */
    constructor(opts) {
        this.selector = opts.selector;
        this.search_by = opts.search_by;
        this.close_container = opts.close_container;
        this.search_input_id = opts.search_input_id;
        this.search_input = null;
        this.search_container = null;
        this.search_container_id = opts.search_inside;
        this.fuse = null;
        this._elements = null;
        this._og_elements = null;
        this.fuse_opts = {
            keys: ['name'],
        };
    }

    getElements() {
        this._elements = Array.from(document.querySelectorAll(this.selector))
            .map(crop => ({
                name: crop.getAttribute(this.search_by),
                element: crop.closest(this.close_container),
            }));
        this._og_elements = document.querySelectorAll(this.selector);
        return this;
    }

    setUp() {
        this.fuse = new Fuse(this._elements, this.fuse_opts);
        this.search_input = document.getElementById(this.search_input_id);
        this.search_container = document.getElementById(this.search_container_id);
        return this;
    }

    handle() {
        this.search_input.addEventListener('input', () => {
            let val = this.search_input.value;
            if (val.trim() === '') {
                this._og_elements.forEach((crop) => {
                    try {
                        this.search_container.appendChild(crop);
                    } catch (e) {
                        console.log(e);
                    }
                });
            } else {
                let results = this.fuse.search(val);
                this.search_container.innerHTML = '';
                results.forEach((result) => {
                    this.search_container.appendChild(result.item.element);
                });
            }
        });
    }
}

class AgroUi {
    constructor() {
        this.cards = [];
    }

    loaderInAllCards() {
        this.cards = document.querySelectorAll('.card');
        this.cards.forEach(function (card) {
            let loaderContainer = document.createElement('div');
            loaderContainer.classList.add('loader-container');

            let loader = document.createElement('div');
            loader.classList.add('loader');
            loaderContainer.appendChild(loader);

            card.appendChild(loaderContainer);
        });
    }
}

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
        const mapObjectsArray = ['departamentos', 'municipios'];
        this.initializeMap();
        for(let i=0; i<mapObjectsArray.length; i++){
            await this.fetchShapefileComponents(mapObjectsArray[i]);
            await this.drawShapefile(mapObjectsArray[i]);
        }
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
                            console.error('Error: Bounds are not valid.Overallbounds: ', overallBounds);
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

// Mejoras: 
// - Cambiar la estructura de this.pointsInLines si se quiere manejar mas de 1 linea divisora
// - Agregar las zonas divididas a features para mejorar el rendimiento