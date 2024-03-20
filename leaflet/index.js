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
                                        const geoStreetProperties = e.target.feature.properties;
                                        const geoDptoProperties = value.feature.properties;

                                        console.log(`Dividido por ${geoStreetProperties.categoria}, nombre_calle: ${geoStreetProperties.nombre} id_calle: ${geoStreetProperties.id}, description: "Colocar a mano", is_active: true`)
                                        console.log(`state: ${geoDptoProperties.nombre}, id_state: ${geoDptoProperties.id}`)

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

                                        const firstIndex = this.getFirstCoordinate(allPointsInStreetFinal, cooDpto);
                                        const secondIndex = this.getSecondCoordinate(allPointsInStreetFinal[firstIndex], allPointsInStreetFinal, cooDpto);
                                        const pointsInStreet = this.getPointsInStreet(firstIndex, secondIndex, allPointsInStreetFinal);
                                        this.getPointsInLine(pointsInStreet, cooDpto)

                                        const verticalLine = L.polyline(this.pointsInLine, { color: 'blue', weight: 3 });
                                        verticalLine.addTo(this.map);

                                        const marker1 = L.marker(allPointsInStreetFinal[firstIndex]);
                                        var popup1 = L.popup().setContent("Marker 1");
                                        marker1.bindPopup(popup1).openPopup();

                                        marker1.addTo(this.map);
                                        const marker2 = L.marker(allPointsInStreetFinal[secondIndex]);
                                        var popup2 = L.popup().setContent("Marker 2");
                                        marker2.bindPopup(popup2).openPopup();
                                        marker2.addTo(this.map);

                                        this.splitZone(cooDpto)

                                    }
                                }
                            }
                        }
                    }
                });
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
            const contourLat = contourCoordinates[i][0];
            const contourLng = contourCoordinates[i][1];

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

        const divisionOne = L.polyline(coordinatesSide1, {
            style: this.style,
            onEachFeature: this.onEachFeature
        });
        divisionOne.addTo(this.map);

        const divisionTwo = L.polyline(coordinatesSide2, {
            style: this.style,
            onEachFeature: this.onEachFeature
        });
        divisionTwo.addTo(this.map);

        // for (let i = 0; i < coordinatesSide1.length - 1; i++) {
        //     this.drawDivision(coordinatesSide1[i], coordinatesSide1[i + 1], 'red');
        // }
        // for (let i = 0; i < coordinatesSide2.length - 1; i++) {
        //     this.drawDivision(coordinatesSide2[i], coordinatesSide2[i + 1], 'blue');
        // }
    }


    getPointsInLine(cooStreet, cooDpt){

        for(let i = 0; i < cooStreet.length; i++){
            for(let j = 0; j < cooDpt.length; j++) {
                if(cooStreet[i] == cooDpt[j]){
                    this.intPointsArr.push(cooStreet[i]);
                    break;
                }
            }
            if(i == 0 && this.intPointsArr.length == 0){
                this.getNearestCoordinate(cooStreet[i], cooDpt);

                const marker3 = L.marker(this.pointsInLine[0]);
                var popup3 = L.popup().setContent("Marker 3");
                marker3.bindPopup(popup3).openPopup();
                marker3.addTo(this.map);
            }

            this.pointsInLine.push(cooStreet[i]);

            if(i == cooStreet.length -1 && this.intPointsArr.length == 1){
                this.getNearestCoordinate(cooStreet[i], cooDpt);

                const marker4 = L.marker(this.pointsInLine[this.pointsInLine.length - 1]);
                var popup4 = L.popup().setContent("Marker 4");
                marker4.bindPopup(popup4).openPopup().addTo(this.map);

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

            if(this.intPointsArr.length == 0 || (contourCoordinates[i][0] != this.intPointsArr[0][0] && contourCoordinates[i][1] != this.intPointsArr[0][1])){
                if (distancia < distanciaMinima ) {
                    distanciaMinima = distancia;
                    nearestCoordinate = [contourLat, contourLng];
                }
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
        for(let i = inicio; i < fin + 1; i++){
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
                const contourLat = contourCoordinates[j][0];
                const contourLng = contourCoordinates[j][1];

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

                if (distancia < distanciaMinima && founded == false) {
                    distanciaMinima = distancia;
                    nearestCoordinate = [contourLat, contourLng];
                    indicei = i;
                }
            }

            if(founded){
                break;
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
                    const dptLat = cooDpt[j][0];
                    const dptLng = cooDpt[j][1];

                    if(lat1 == dptLat && lng1 == dptLng){
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