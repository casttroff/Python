class StateMapDrawer {
    constructor(provincesArr) {
        this.provincesArr = provincesArr;
        this.overlays = {};
        this.intPointsArr = [];
        this.pointsInLine = [];
        this.onEachFeature = this.onEachFeature.bind(this);
        this.style = this.style.bind(this);
        this.highlightFeature = this.highlightFeature.bind(this);
        this.resetHighlight = this.resetHighlight.bind(this);
        this.zoomToFeature = this.zoomToFeature.bind(this);
        this.overallBounds = L.latLngBounds();
        this.map = L.map('map').setView([-31.1228499839105,-64.1473438921363], 8);
        this.geojson = L.geoJson(null, {
            style: this.style,
            onEachFeature: this.onEachFeature
        }).addTo(this.map);
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        osm.addTo(this.map);
    }
    onEachFeature(feature, layer) {
        layer.on({
            mouseover: this.highlightFeature,
            mouseout: this.resetHighlight,
            click: (e) => this.zoomToFeature(e)
        });
    }

    style(feature) {
        return {
            fillColor: '#800026',
            weight: 1,

            color: 'white',
            dashArray: '3',

        };
    }

    highlightFeature(e) {
        var layer = e.target;
        console.log("Map", this.map)

        layer.setStyle({
            weight: 3,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
    }

    resetHighlight(e) {
        this.geojson.resetStyle(e.target);
    }

    async get_ubication(lat, lng) {
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

    async zoomToFeature(e) {
        this.map.fitBounds(e.target.getBounds());
        if('categoria' in e.target.feature.properties){
            let type = e.target.feature.properties.categoria;
            let coordsLat = e.latlng['lat'];
            let coordsLng = e.latlng['lng'];

            const data = await this.get_ubication(coordsLat, coordsLng);

            if(data){

                const { departamento, municipio, provincia } = data.ubicacion;
                const dptoId = departamento.id;
                const dptoName = departamento.nombre;
                const muniId = municipio.id;
                const muniName = municipio.nombre;
                const provId = provincia.id;
                const provName = provincia.nombre;
                const allPointsInStreet = [];
                this.map.eachLayer((layer) => {
                    if (layer instanceof L.GeoJSON) {
                        for (const key in layer['_layers']) {
                            if (layer['_layers'].hasOwnProperty(key)) {
                                const value = layer['_layers'][key];
                                if('prov_id' in value.feature.properties && !('categoria' in value.feature.properties)){
                                    if(value.feature.properties.prov_id == provId && value.feature.properties.id == dptoId){
                                        const geoStreet = e.target.feature.geometry;
                                        const geoDpt = value.feature.geometry;
                                        console.log("Coords Dpto", geoDpt.coordinates);
                                        console.log("Coords Street", geoStreet.coordinates);

                                        L.geoJSON(geoDpt, {
                                            style: {
                                                weight: 3,
                                                fillColor: "#fff",
                                                color: "#aba"
                                            }
                                        }).addTo(this.map);

                                        for(let i =0; i < geoStreet.coordinates.length; i++){
                                            for(let j =0; j < geoStreet.coordinates[i].length; j++){
                                                allPointsInStreet.push(geoStreet.coordinates[i][j])
                                            }
                                        }

                                        let coordsStreet = geoStreet.coordinates.map(subarray => {
                                          return subarray.map(item => {
                                            return [item[1], item[0]];
                                          });
                                        });

                                        const allPointsInStreetFinal = allPointsInStreet.map(subarray => {
                                            return [subarray[1], subarray[0]];
                                        });
                                        const cooDpto = geoDpt.coordinates[0].map(subarray => {
                                            return [subarray[1], subarray[0]];
                                        });
                                        const firstIndex = this.getFirstCoordinate(allPointsInStreetFinal, geoDpt.coordinates[0]);
                                        const secondIndex = this.getSecondCoordinate(allPointsInStreetFinal[firstIndex], allPointsInStreetFinal, geoDpt.coordinates[0]);
                                        const pointsInStreet = this.getPointsInStreet(firstIndex, secondIndex, allPointsInStreetFinal);
                                        this.getPointsInLine(pointsInStreet, cooDpto)

                                        console.log("this pointsInLine", this.pointsInLine);
                                        console.log("pointsInLine", pointsInStreet);

                                        const verticalLine = L.polyline(this.pointsInLine, { color: 'blue', weight: 3 });
                                        verticalLine.addTo(this.map);

                                        const marker1 = L.marker(allPointsInStreetFinal[firstIndex]);
                                        console.log("Marker 1", allPointsInStreetFinal[firstIndex])
                                        console.log("Marker 1 in", firstIndex)
                                        marker1.addTo(this.map);
                                        console.log("Marker 2", allPointsInStreetFinal[secondIndex])
                                        console.log("Marker 2 in", secondIndex)
                                        console.log("INTPOINTS", this.intPointsArr)
                                        this.splitZone(cooDpto)
                                        // const marker2 = L.marker(allPointsInStreetFinal[secondIndex]);
                                        // console.log("Marker 2", allPointsInStreetFinal[secondIndex])
                                        //
                                        // marker2.addTo(this.map);
                                        // console.log("Marker 1", coordsStreet[coordsStreet.length - 1][coordsStreet[coordsStreet.length - 1].length - 1])
                                        // const marker2 = L.marker(coordsStreet[coordsStreet.length - 1][coordsStreet[coordsStreet.length - 1].length - 1]);
                                        // marker2.addTo(this.map);

                                        // L.geoJSON(e.target.feature.geometry, {
                                        //     style: {
                                        //         weight: 3,
                                        //         fillColor: "#800026",
                                        //         fillOpacity: 1,
                                        //         color: "#800026"
                                        //     }
                                        // }).addTo(map);
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

    splitZone(contourCoordinates) {
        const pointOfIntersection1 = this.intPointsArr[0];
        const pointOfIntersection2 = this.intPointsArr[1];
        const coordinatesSide1 = [];
        const coordinatesSide2 = [];
        let foundedCoords = 0;

        // Itera en las coordenadas del contorno
        for (let i = 0; i < contourCoordinates.length - 1; i++) {
            const contourLng = contourCoordinates[i][1];
            const contourLat = contourCoordinates[i][0];

            // Checkea si esta coordenada del contorno coincide con un punto de la linea
            if ((contourLat === pointOfIntersection1[0] && contourLng === pointOfIntersection1[1]) ||
                (contourLat === pointOfIntersection2[0] && contourLng === pointOfIntersection2[1])) {
                foundedCoords++;

                if (foundedCoords == 1){
                    // Una vez que encuentra el primer punto de inteseccion sigue las coordenadas de la linea para luego cerrar la zona 1
                    if (contourLat == this.pointsInLine[0][0]){
                        const slisedPoints = this.pointsInLine.slice(0, this.pointsInLine.length - 1)
                        coordinatesSide1.push(...slisedPoints)
                    }
                    if (contourLat == this.pointsInLine[this.pointsInLine.length - 1][0]){
                        // Da vuelta el array para que las coordenadas sigan el orden correcto para ser dibujado
                        const reversedPoints = [...this.pointsInLine].reverse();
                        const slisedPoints = reversedPoints.slice(0, reversedPoints.length - 1)
                        coordinatesSide1.push(...slisedPoints)
                    }
                }
                if (foundedCoords == 2){
                    // Agregar las coordenadas de la linea al final del array para cerrar el poligono 2
                    if (contourLat == this.pointsInLine[0][0]){
                        coordinatesSide2.push(...this.pointsInLine)
                    }
                    if (contourLat == this.pointsInLine[this.pointsInLine.length - 1][0]){
                        const reversedPoints = [...this.pointsInLine].reverse();
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
        const firstPointLat = contourCoordinates[0][0];
        const firstPointLng = contourCoordinates[0][1]
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
        verticalLine.addTo(this.map);
    }

    getPointsInLine(cooStreet, cooDpt){
        for(let i = 0; i < cooStreet.length; i++){
            for(let j = 0; j < cooDpt.length; j++) {
                if(cooStreet[i] == cooDpt[j]){
                    console.log("COINCIDE")
                    this.intPointsArr.push(cooStreet[i]);
                    break;
                }
            }
            if(i == 0 && this.intPointsArr.length == 0){
                this.getNearestCoordinate(cooStreet[i], cooDpt);
            }
            this.pointsInLine.push(cooStreet[i]);
            if(i == cooStreet.length -1 && this.intPointsArr.length == 1){
                this.getNearestCoordinate(cooStreet[i], cooDpt);
            }

            if(this.intPointsArr.length == 2){
                break;
            }
        }
    }
    getNearestCoordinate(point, contourCoordinates) {
        let lat1 = point[0];
        let lng1 = point[1];

        let distanciaMinima = Infinity;
        let nearestCoordinate = [];
        const R = 6371;

        for(let i = 0; i < contourCoordinates.length; i++){
            const contourLat = contourCoordinates[i][0];
            const contourLng = contourCoordinates[i][1];
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
        this.intPointsArr.push(nearestCoordinate);
        this.pointsInLine.push(nearestCoordinate);
    }
    getPointsInStreet(ix, jx , cooStreet){
        let pointsInLine = [];
        let inicio = 0;
        let fin = 0;

        if(ix > jx){
            inicio = jx;
            fin = ix;
        }
        else{
            inicio = ix;
            fin = jx;
        }

        for(let i = inicio; i <= fin; i++){
            pointsInLine.push(cooStreet[i]);
        }

        return pointsInLine;
    }
    getFirstCoordinate(cooStreets, contourCoordinates) {
        let distanciaMinima = Infinity;
        let nearestCoordinate = [];
        let indicei= 0;
        let founded = false;
        const R = 6371;

        for(let i = 0; i < cooStreets.length; i++){
            let lat1 = cooStreets[i][0];
            let lng1 = cooStreets[i][1];

            for(let j = 0; j < contourCoordinates.length; j++){
                const contourLng = contourCoordinates[j][0];
                const contourLat = contourCoordinates[j][1];

                if(lat1 == contourLat && lng1 == contourLng){
                    indicei = i;
                    founded = true;
                    break;
                }

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
                    indicei = i;
                }
            }

            if(founded){
                break;
            }else{
                cooStreets[indicei] = nearestCoordinate;
            }
        }
        return indicei
    }

    getSecondCoordinate(point, cooStreets, cooDpt) {
        let distanciaMinima = 0;
        let farthestCoordinate = [];
        const R = 6371;
        let indicei = 0;
        let founded = false;

        for(let i = 0; i < cooStreets.length; i++){
            let lat1 = cooStreets[i][0];
            let lng1 = cooStreets[i][1];
            const contourLng = point[1];
            const contourLat = point[0];

            if(lat1 != contourLat && lng1 != contourLng){
                for(let j = 0; j < cooDpt.length; j++){
                    const dptLng = cooDpt[j][0];
                    const dptLat = cooDpt[j][1];

                    if(lat1 == dptLat && lng1 != dptLng){
                        indicei = i;
                        founded = true;
                        break;
                    }
                }
            }
            if(founded){
                break;
            }

            const dLat = (contourLat - lat1) * (Math.PI / 180);
            const dLng = (contourLng - lng1) * (Math.PI / 180);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) * Math.cos(contourLat * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distancia = R * c;

            if (distancia > distanciaMinima) {
                distanciaMinima = distancia;
                farthestCoordinate = [lat1, lng1];
                indicei = i;
            }
        }

        console.log("ii sec", indicei)
        return indicei
    }

    InitializeMap(){
        const mapProvincesArr = this.provincesArr;
        // Usa Promise.all para manejar múltiples llamadas asíncronas al mismo tiempo
        const convertedGeoJsonPromises = mapProvincesArr.map(province => this.getRoutes(province));
    }

    async getRoutes(province) {
        const mapObjectArr = ['departamentos', 'rutas'];
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

        this.geojson = L.geoJson(geoJsonFeatures, {
            style: this.style,
            onEachFeature: this.onEachFeature
        }).addTo(this.map);
    }

}

const provincesArr = ['cordoba'];
var mapDrawed = new StateMapDrawer(provincesArr);
mapDrawed.InitializeMap();

//
// class StateMapDrawer {
//     constructor(target, provinceSlug, static_path) {
//         this.target = target;
//         this.provinceSlug = provinceSlug;
//         this.isMobile = L.Browser.mobile;
//         this.map = null;
//         this.drawnItems = null;
//         this.static_path = static_path;
//         this.intersectionPopup = null; // Para debug de coord
//         this.mouseCoords = null; // Para debug de coord
//         this.mouseIsOver = false; // Para controlar funciones si el mouse esta sobre una geometria dibujable
//         this.pointsInLines = []; // Pasar a json para controlar mas de una linea divisora
//         this.contourCoordinates = {}; // Se guardan los contornos de todos los departamentos
//         this.intersectPoints = {}; // Guarda los puntos de interseccion con los contornos
//     }
//
//     /**
//      * @returns {Promise<void>}
//      */
//     async drawMap() {
//         this.initializeMap();
//         await this.fetchShapefileComponents('departamentos');
//         await this.drawShapefile('departamentos');
//
//         await this.fetchShapefileComponents('calles'); // Para dividir los archivos .shp
//         await this.drawShapefile('calles');
//     }
//
//     /**
//      *
//      */
//     initializeMap() {
//         this.map = L.map(this.target, {
//             center: [0, 0],
//             zoom: this.isMobile ? 6 : 8,
//             zoomControl: false,
//             attributionControl: true
//         });
//
//         this.map.dragging.disable();
//         this.map.scrollWheelZoom.disable();
//
//         this.drawnItems = new L.FeatureGroup();
//         this.map.addLayer(this.drawnItems);
//     }
//
//     /**
//      *
//      * @returns {Promise<{dbfBuffer: ArrayBuffer, shxBuffer: ArrayBuffer, shpBuffer: ArrayBuffer}>}
//      */
//     async fetchShapefileComponents(mapObject) {
//         const shp = `${this.static_path}/${this.provinceSlug}/${mapObject}.shp`;
//         const dbf = `${this.static_path}/${this.provinceSlug}/${mapObject}.dbf`;
//         const shx = `${this.static_path}/${this.provinceSlug}/${mapObject}.shx`;
//
//         const headers = {'Content-Type': 'application/shapefile+zip; charset=latin1'};
//
//         const [shpBuffer, dbfBuffer, shxBuffer] = await Promise.all([
//             fetch(shp, {headers}).then(response => response.arrayBuffer()),
//             fetch(dbf, {headers}).then(response => response.arrayBuffer()),
//             fetch(shx, {headers}).then(response => response.arrayBuffer())
//         ]);
//
//         return {shpBuffer, dbfBuffer, shxBuffer};
//     }
//
//     /**
//      *
//      * @returns {Promise<*>}
//      */
//     async drawShapefile(mapObject) {
//         const {shpBuffer, dbfBuffer, shxBuffer} = await this.fetchShapefileComponents(mapObject);
//
//         return shapefile
//             .open(shpBuffer, dbfBuffer, shxBuffer)
//             .then(source => {
//                 let overallBounds = L.latLngBounds();
//                 console.log("OverallBounds in drawShapefile", overallBounds);
//                 const log = (result) => {
//                     if (result.done) {
//                         if (overallBounds.isValid()) {
//                             this.map.fitBounds(overallBounds);
//                         } else {
//                             console.error('Error: Bounds are not valid.');
//                         }
//                         return;
//                     }
//                     this.handleFeature(result.value, overallBounds);
//
//                     // Obtención de las coordenadas del contorno
//                     this.contourCoordinates[result.value.properties.nombre] = result.value.geometry.coordinates;
//
//                     return source.read().then(log);
//                 };
//                 return source.read().then(log);
//             })
//             .catch(error => {
//                 console.error('Error loading Shapefile:', error);
//             });
//     }
//
//     customEscape(str) {
//         return str.replace(/[^A-Za-z0-9\-_.*!()]/g, function (char) {
//             return '%' + char.charCodeAt(0).toString(16).toUpperCase();
//         });
//     }
//
//     /**
//      *
//      * @param feature
//      * @param overallBounds
//      */
//     handleFeature(feature, overallBounds) {
//         let attributes = feature.properties;
//
//         for (let prop in attributes) {
//             if (attributes !== undefined) {
//                 attributes[prop] = decodeURIComponent(this.customEscape(attributes[prop]));
//             }
//         }
//
//         let markerCoordinates = [parseFloat(attributes.centr_lat), parseFloat(attributes.centr_lon)];
//         let layer;
//
//         layer = L.geoJSON(feature.geometry, {
//             style: {
//                 weight: 2,
//                 fillColor: "#ccc",
//                 fillOpacity: 1,
//                 color: "#444"
//             }
//         });
//
//         let customIcon = L.divIcon({
//             className: 'custom-div-icon',
//             html: ``,
//         });
//
//         let marker = L.marker(markerCoordinates, {icon: customIcon});
//
//         marker.bindTooltip(attributes.nombre, {
//             permanent: true,
//             direction: 'center',
//             className: 'custom-tooltip'
//         });
//
//         // layer.on("mousemove", (event) => this.handleMouseMove(layer, event));
//         layer.on("mouseover", () => this.handleMouseOver(layer, attributes,marker));
//         layer.on("mouseout", () => this.handleMouseOut(layer, marker));
//         layer.on("click", (event) => this.handleClick(layer, event, attributes));
//
//         overallBounds.extend(layer.getBounds());
//
//         this.drawnItems.addLayer(layer);
//     }
//
//     handleMouseOver(layer, attributes, marker) {
//         this.mouseIsOver = true;
//         marker.addTo(this.drawnItems)
//         layer.setStyle({
//             fillColor: "#000",
//             weight: 3,
//             color: "#555"
//         });
//     }
//
//     handleMouseOut(layer, marker) {
//         this.mouseIsOver = false;
//         layer.setStyle({
//             fillColor: "#ccc",
//             weight: 2,
//             color: "#444"
//         });
//
//         this.map.off('mousemove', this.handleMouseMove);
//
//         this.map.removeLayer(marker);
//
//         if (this.intersectionPopup) {
//             this.map.closePopup(this.intersectionPopup);
//             this.intersectionPopup = null;
//         }
//     }
//
//     handleClick(layer, event, attributes) {
//         if (this.mouseIsOver) {
//             const latlng = event.latlng;
//             this.addVerticalLine(latlng, layer, attributes);
//         }
//     }
//
//     addVerticalLine(mouseLatLng, layer, attributes) {
//         // Busca si hay un punto de interseccion con la linea y el contorno
//         if(this.intersectPoints[attributes.nombre]){
//             if(this.intersectPoints[attributes.nombre].length < 2){
//                 // Busca si hay mas de un punto en la linea
//                 if (this.pointsInLines.length > 0){
//                     const nearestCoordinate = this.getNearestCoordinate(mouseLatLng.lat, mouseLatLng.lng, this.contourCoordinates[attributes.nombre][0], attributes.nombre);
//                     const lastPoint = this.pointsInLines[this.pointsInLines.length - 1];
//
//                     const newLineCoords = [lastPoint, nearestCoordinate]
//                     const verticalLine = L.polyline(newLineCoords, { color: 'blue', weight: 3 });
//                     verticalLine.addTo(this.drawnItems);
//                     this.pointsInLines.push(nearestCoordinate);
//                 }
//             }
//             // Si hay dos intersecciones con el contorno divide la zona
//             if(this.intersectPoints[attributes.nombre].length == 2) {
//                 this.splitZone(attributes.nombre)
//             }
//         }
//         else {
//             // Si no hay ningun punto de interseccion, el primer punto dibujado lo intersecta
//             const nearestCoordinate = this.getNearestCoordinate(mouseLatLng.lat, mouseLatLng.lng, this.contourCoordinates[attributes.nombre][0], attributes.nombre);
//             const newLineCoords = [[mouseLatLng.lat, mouseLatLng.lng], nearestCoordinate];
//             const verticalLine = L.polyline(newLineCoords, { color: 'blue', weight: 3 });
//             verticalLine.addTo(this.drawnItems);
//             this.pointsInLines.push([mouseLatLng.lat, mouseLatLng.lng]);
//         }
//     }
//
//     // Obtiene la cercanía entre el click y el contorno usando coordenadas
//     getNearestCoordinate(lat1, lng1, contourCoordinates, name) {
//         let distanciaMinima = Infinity;
//         let nearestCoordinate = [];
//         const R = 6371;
//
//         for(let i = 0; i < contourCoordinates.length; i++){
//             const contourLng = contourCoordinates[i][0];
//             const contourLat = contourCoordinates[i][1];
//             const dLat = (contourLat - lat1) * (Math.PI / 180);
//             const dLng = (contourLng - lng1) * (Math.PI / 180);
//             const a =
//                 Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//                 Math.cos(lat1 * (Math.PI / 180)) * Math.cos(contourLat * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
//             const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//             const distancia = R * c;
//
//
//             if (distancia < distanciaMinima) {
//                 distanciaMinima = distancia;
//                 nearestCoordinate = [contourLat, contourLng];
//             }
//         }
//         // Si ya existe un punto de interseccion, para que haya otro, el click debe estar a menos de 10km del contorno
//         if(this.intersectPoints[name]){
//             if (distanciaMinima < 10){
//                 this.intersectPoints[name].push(nearestCoordinate);
//                 console.log("intersect points", this.intersectPoints);
//                 // Devuelve la coordenada mas cercana al click
//                 return nearestCoordinate;
//             }
//             else {
//                 // Si la distancia es mayor a 10 devuelve la coordenada del click
//                 return [lat1, lng1]
//             }
//         }
//         else {
//             // Si no existe punto de interseccion, el primer click genera un punto de interseccion con la coord. mas cercana al click
//             this.intersectPoints[name] = [nearestCoordinate];
//             this.pointsInLines.push(nearestCoordinate);
//             return nearestCoordinate;
//         }
//     }
//
//     splitZone(name) {
//         const pointOfIntersection1 = this.intersectPoints[name][0];
//         const pointOfIntersection2 = this.intersectPoints[name][1];
//         const coordinatesSide1 = [];
//         const coordinatesSide2 = [];
//         let foundedCoords = 0;
//
//         // Itera en las coordenadas del contorno
//         for (let i = 0; i < this.contourCoordinates[name][0].length - 1; i++) {
//             const contourLng = this.contourCoordinates[name][0][i][0];
//             const contourLat = this.contourCoordinates[name][0][i][1];
//
//             // Checkea si esta coordenada del contorno coincide con un punto de la linea
//             if ((contourLat === pointOfIntersection1[0] && contourLng === pointOfIntersection1[1]) ||
//                 (contourLat === pointOfIntersection2[0] && contourLng === pointOfIntersection2[1])) {
//                 foundedCoords++;
//
//                 if (foundedCoords == 1){
//                     // Una vez que encuentra el primer punto de inteseccion sigue las coordenadas de la linea para luego cerrar la zona 1
//                     if (contourLat == this.pointsInLines[0][0]){
//                         const slisedPoints = this.pointsInLines.slice(0, this.pointsInLines.length - 1)
//                         coordinatesSide1.push(...slisedPoints)
//                     }
//                     if (contourLat == this.pointsInLines[this.pointsInLines.length - 1][0]){
//                         // Da vuelta el array para que las coordenadas sigan el orden correcto para ser dibujado
//                         const reversedPoints = [...this.pointsInLines].reverse();
//                         const slisedPoints = reversedPoints.slice(0, reversedPoints.length - 1)
//                         coordinatesSide1.push(...slisedPoints)
//                     }
//                 }
//                 if (foundedCoords == 2){
//                     // Agregar las coordenadas de la linea al final del array para cerrar el poligono 2
//                     if (contourLat == this.pointsInLines[0][0]){
//                         coordinatesSide2.push(...this.pointsInLines)
//                     }
//                     if (contourLat == this.pointsInLines[this.pointsInLines.length - 1][0]){
//                         const reversedPoints = [...this.pointsInLines].reverse();
//                         coordinatesSide2.push(...reversedPoints)
//                     }
//                 }
//             }
//
//             if (foundedCoords < 1 || foundedCoords >= 2) {
//                 coordinatesSide1.push([contourLat, contourLng]);
//             }
//             if (foundedCoords === 1) {
//                 coordinatesSide2.push([contourLat, contourLng]);
//             }
//         }
//
//         // Agregar la primer coordenada al final del array para cerrar el poligono 1
//         const firstPointLat = this.contourCoordinates[name][0][0][1];
//         const firstPointLng = this.contourCoordinates[name][0][0][0]
//         coordinatesSide1.push([firstPointLat, firstPointLng]);
//
//         for (let i = 0; i < coordinatesSide1.length - 1; i++) {
//             this.drawDivision(coordinatesSide1[i], coordinatesSide1[i + 1], 'red');
//         }
//         for (let i = 0; i < coordinatesSide2.length - 1; i++) {
//             this.drawDivision(coordinatesSide2[i], coordinatesSide2[i + 1], 'blue');
//         }
//     }
//
//     drawDivision(c1, c2, color) {
//         const newLineCoords = [c1, c2]
//         const verticalLine = L.polyline(newLineCoords, { color: color, weight: 3 });
//         verticalLine.addTo(this.drawnItems);
//     }
//
// }
