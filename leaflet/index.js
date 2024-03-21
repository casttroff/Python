class StateMapDrawer {
    constructor(provincesArr) {
        this.provincesArr = provincesArr;
        this.overlays = {};
        this.onEachFeature = this.onEachFeature.bind(this);
        this.style = this.style.bind(this);
        this.highlightFeature = this.highlightFeature.bind(this);
        this.resetHighlight = this.resetHighlight.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.overallBounds = L.latLngBounds();
        this.map = L.map('map').setView([-31.1228499839105,-64.1473438921363], 8);

        this.managedFeatures = {};
        this.intersectionPoints = {};

        this.geojson = L.geoJson(null, {
            style: this.style,
            onEachFeature: this.onEachFeature
        }).addTo(this.map);
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        osm.addTo(this.map);
    }

    InitializeMap(){
        const mapProvincesArr = this.provincesArr;
        mapProvincesArr.map(province => this.getRoutes(province));
    }

    InitializeDataStructure(featureStreetProperties, featureDepartmentProperties){
        this.intersectionPoints[featureDepartmentProperties.nombre] = [];
        this.managedFeatures[featureDepartmentProperties.nombre] = {
            'department_ref_id': featureDepartmentProperties.id,
            'dividing_street_name': featureStreetProperties.nombre,
            'dividing_street_ref_id': featureStreetProperties.id,
            'dividing_street_category': featureStreetProperties.categoria,
            'dividing_street_coordinates': [], 
            'coordinates_side_A': [], 
            'coordinates_side_B': [],
            'description_side_A': "",
            'description_side_B': "",
            'is_active': true
        };
    }

    onEachFeature(feature, layer) {
        layer.on({
            mouseover: this.highlightFeature,
            mouseout: this.resetHighlight,
            click: (e) => this.handleClick(e)
        });
    }

    style() {
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

    async handleClick(e) {
        this.map.fitBounds(e.target.getBounds());
        if('categoria' in e.target.feature.properties){
            let type = e.target.feature.properties.categoria;
            let coordsLat = e.latlng['lat'];
            let coordsLng = e.latlng['lng'];
            const data = await this.get_ubication(coordsLat, coordsLng);

            if(data){
                console.log("DAATA", data)
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

                                        const featureStreetProperties = e.target.feature.properties;
                                        const featureDepartmetProperties = value.feature.properties;
                                        const departmentName = featureDepartmetProperties.nombre;
                                        const geometryStreet = e.target.feature.geometry;
                                        const geometryDeparment = value.feature.geometry;

                                        this.InitializeDataStructure(featureStreetProperties, featureDepartmetProperties);

                                        console.log("IntersectionPoints: ",this.intersectionPoints)
                                        console.log("ManagedFeatures:", this.managedFeatures)

                                        L.geoJSON(geometryDeparment, {
                                            style: {
                                                weight: 3,
                                                fillColor: "#fff",
                                                color: "#aba"
                                            }
                                        }).addTo(this.map);

                                        for(let i =0; i < geometryStreet.coordinates.length; i++){
                                            for(let j =0; j < geometryStreet.coordinates[i].length; j++){
                                                allPointsInStreet.push(geometryStreet.coordinates[i][j])
                                            }
                                        }

                                        let coordsStreet = geometryStreet.coordinates.map(subarray => {
                                          return subarray.map(item => {
                                            return [item[1], item[0]];
                                          });
                                        });

                                        const flatStreetArray = allPointsInStreet.map(subarray => {
                                            return [subarray[1], subarray[0]];
                                        });

                                        const coordsDeparment = geometryDeparment.coordinates[0].map(subarray => {
                                            return [subarray[1], subarray[0]];
                                        });

                                        const firstIndex = this.getFirstCoordinate(flatStreetArray, coordsDeparment);
                                        const secondIndex = this.getSecondCoordinate(flatStreetArray[firstIndex], flatStreetArray, coordsDeparment);
                                        const pointsInStreet = this.getPointsInStreet(firstIndex, secondIndex, flatStreetArray);

                                        this.getPointsInLine(pointsInStreet, coordsDeparment, departmentName)

                                        const verticalLine = L.polyline(this.managedFeatures[departmentName]['dividing_street_coordinates'], { color: 'blue', weight: 3 });
                                        verticalLine.addTo(this.map);

                                        const marker1 = L.marker(flatStreetArray[firstIndex]);
                                        var popup1 = L.popup().setContent("Marker 1");
                                        marker1.bindPopup(popup1).openPopup().addTo(this.map);

                                        const marker2 = L.marker(flatStreetArray[secondIndex]);
                                        var popup2 = L.popup().setContent("Marker 2");
                                        marker2.bindPopup(popup2).openPopup().addTo(this.map);

                                        this.splitZone(coordsDeparment, departmentName)
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
    }

    splitZone(coordsDepartment, departmentName) {
        const pointOfIntersection1 = this.intersectionPoints[departmentName][0];
        const pointOfIntersection2 = this.intersectionPoints[departmentName][1];
        let foundedCoords = 0;

        // Itera en las coordenadas del contorno
        for (let i = 0; i < coordsDepartment.length - 1; i++) {
            const latPointDepartment = coordsDepartment[i][0];
            const lngPointDepartment = coordsDepartment[i][1];

            // Checkea si esta coordenada del contorno coincide con un punto de la linea
            if ((latPointDepartment === pointOfIntersection1[0] && lngPointDepartment === pointOfIntersection1[1]) ||
                (latPointDepartment === pointOfIntersection2[0] && lngPointDepartment === pointOfIntersection2[1])) {
                foundedCoords++;

                if (foundedCoords == 1){
                    // Una vez que encuentra el primer punto de inteseccion sigue las coordenadas de la linea para luego cerrar la zona 1
                    if (latPointDepartment == this.managedFeatures[departmentName]['dividing_street_coordinates'][0][0]){
                        const slisedPoints = this.managedFeatures[departmentName]['dividing_street_coordinates'].slice(0, this.managedFeatures[departmentName]['dividing_street_coordinates'].length - 1)
                        this.managedFeatures[departmentName]['coordinates_side_A'].push(...slisedPoints)
                    }
                    if (latPointDepartment == this.managedFeatures[departmentName]['dividing_street_coordinates'][this.managedFeatures[departmentName]['dividing_street_coordinates'].length - 1][0]){
                        // Da vuelta el array para que las coordenadas sigan el orden correcto para ser dibujado
                        const reversedPoints = [...this.managedFeatures[departmentName]['dividing_street_coordinates']].reverse();
                        const slisedPoints = reversedPoints.slice(0, reversedPoints.length - 1)
                        this.managedFeatures[departmentName]['coordinates_side_A'].push(...slisedPoints)
                    }
                }
                if (foundedCoords == 2){
                    // Agregar las coordenadas de la linea al final del array para cerrar el poligono 2
                    if (latPointDepartment == this.managedFeatures[departmentName]['dividing_street_coordinates'][0][0]){
                        this.managedFeatures[departmentName]['coordinates_side_B'].push(...this.managedFeatures[departmentName]['dividing_street_coordinates'])
                    }
                    if (latPointDepartment == this.managedFeatures[departmentName]['dividing_street_coordinates'][this.managedFeatures[departmentName]['dividing_street_coordinates'].length - 1][0]){
                        const reversedPoints = [...this.managedFeatures[departmentName]['dividing_street_coordinates']].reverse();
                        this.managedFeatures[departmentName]['coordinates_side_B'].push(...reversedPoints)
                    }
                }
            }

            if (foundedCoords < 1 || foundedCoords >= 2) {
                this.managedFeatures[departmentName]['coordinates_side_A'].push([latPointDepartment, lngPointDepartment]);
            }
            if (foundedCoords === 1) {
                this.managedFeatures[departmentName]['coordinates_side_B'].push([latPointDepartment, lngPointDepartment]);
            }
        }

        // Agregar la primer coordenada al final del array para cerrar el poligono 1
        this.managedFeatures[departmentName]['coordinates_side_A'].push([coordsDepartment[0][0], coordsDepartment[0][1]]);

        const divisionOne = L.polyline(this.managedFeatures[departmentName]['coordinates_side_A'], { color: 'red', weight: 3 });
        divisionOne.addTo(this.map);

        const divisionTwo = L.polyline(this.managedFeatures[departmentName]['coordinates_side_B'], { color: 'blue', weight: 3 });
        divisionTwo.addTo(this.map);
    }

    getPointsInLine(coordsStreet, coordsDepartment, departmentName){
        for(let i = 0; i < coordsStreet.length; i++){
            for(let j = 0; j < coordsDepartment.length; j++) {
                if(coordsStreet[i] == coordsDepartment[j]){
                    this.intersectionPoints[departmentName].push(coordsStreet[i]);
                    break;
                }
            }

            if(i == 0 && this.intersectionPoints[departmentName].length == 0){
                this.getNearestCoordinate(coordsStreet[i], coordsDepartment, departmentName);

                const marker3 = L.marker(this.managedFeatures[departmentName]['dividing_street_coordinates'][0]);
                var popup3 = L.popup().setContent("Marker 3");
                marker3.bindPopup(popup3).openPopup().addTo(this.map);
            }

            this.managedFeatures[departmentName]['dividing_street_coordinates'].push(coordsStreet[i]);

            if(i == coordsStreet.length -1 && this.intersectionPoints[departmentName].length == 1){
                this.getNearestCoordinate(coordsStreet[i], coordsDepartment, departmentName);

                const marker4 = L.marker(this.managedFeatures[departmentName]['dividing_street_coordinates'][this.managedFeatures[departmentName]['dividing_street_coordinates'].length - 1]);
                var popup4 = L.popup().setContent("Marker 4");
                marker4.bindPopup(popup4).openPopup().addTo(this.map);

            }

            if(this.intersectionPoints[departmentName].length == 2){
                break;
            }
        }
    }

    getNearestCoordinate(pointInStreet, coordsDepartment, departmentName) {
        let latPointStreet = pointInStreet[0];
        let lngPointStreet = pointInStreet[1];

        let minimalDistance = Infinity;
        let nearestCoordinate = [];
        const R = 6371;

        for(let i = 0; i < coordsDepartment.length; i++){
            const latPointDepartment = coordsDepartment[i][0];
            const lngPointDepartment = coordsDepartment[i][1];
            
            const distance = this.calculateDistance(latPointDepartment, lngPointDepartment, latPointStreet, lngPointStreet);

            if(this.intersectionPoints[departmentName].length == 0 || (coordsDepartment[i][0] != this.intersectionPoints[departmentName][0][0] && coordsDepartment[i][1] != this.intersectionPoints[departmentName][0][1])){
                if (distance < minimalDistance ) {
                    minimalDistance = distance;
                    nearestCoordinate = [latPointDepartment, lngPointDepartment];
                }
            }
        }

        this.intersectionPoints[departmentName].push(nearestCoordinate);
        this.managedFeatures[departmentName]['dividing_street_coordinates'].push(nearestCoordinate);
    }

    getPointsInStreet(idxI, idxJ , coordsStreet){
        let pointsInLine = [];
        let start = 0;
        let end = 0;

        if(idxI > idxJ){
            start = idxJ;
            end = idxI;
        }
        else{
            start = idxI;
            end = idxJ;
        }
        for(let i = start; i < end + 1; i++){
            pointsInLine.push(coordsStreet[i]);
        }

        return pointsInLine;
    }

    getFirstCoordinate(coordsStreets, coordsDepartment) {
        let minimalDistance = Infinity;
        let nearestCoordinate = [];
        let founded = false;
        let idx = 0;

        for(let i = 0; i < coordsStreets.length; i++){
            let latPointStreet = coordsStreets[i][0];
            let lngPointStreet = coordsStreets[i][1];

            for(let j = 0; j < coordsDepartment.length; j++){
                const latPointDepartment = coordsDepartment[j][0];
                const lngPointDepartment = coordsDepartment[j][1];

                if(latPointStreet == latPointDepartment && lngPointStreet == lngPointDepartment){
                    idx = i;
                    founded = true;
                    break;
                }

                const distance = this.calculateDistance(latPointDepartment, lngPointDepartment, latPointStreet, lngPointStreet);

                if (distance < minimalDistance && founded == false) {
                    minimalDistance = distance;
                    nearestCoordinate = [latPointDepartment, lngPointDepartment];
                    idx = i;
                }
            }

            if(founded){
                break;
            }

        }
        return idx
    }

    calculateDistance(latPointDepartment, lngPointDepartment, latPointStreet, lngPointStreet){
        const R = 6371;

        const dLat = (latPointDepartment - latPointStreet) * (Math.PI / 180);
        const dLng = (lngPointDepartment - lngPointStreet) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(latPointStreet * (Math.PI / 180)) * Math.cos(latPointDepartment * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    getSecondCoordinate(pointInStreet, coordsStreets, coordsDepartment) {
        let minimalDistance = 0;
        let farthestCoordinate = [];
        let idx = 0;
        let founded = false;
        const R = 6371;
        
        for(let i = 0; i < coordsStreets.length; i++){
            let latPointStreet = coordsStreets[i][0];
            let lngPointStreet = coordsStreets[i][1];
            const latFisrtPoint = pointInStreet[0];
            const lngFirstPoint = pointInStreet[1];

            if(latPointStreet != latFisrtPoint && lngPointStreet != lngFirstPoint){
                for(let j = 0; j < coordsDepartment.length; j++){
                    const dptLat = coordsDepartment[j][0];
                    const dptLng = coordsDepartment[j][1];

                    if(latPointStreet == dptLat && lngPointStreet == dptLng){
                        idx = i;
                        founded = true;
                        break;
                    }
                }
            }
            if(founded){
                break;
            }

            const distance = this.calculateDistance(latFisrtPoint, lngFirstPoint, latPointStreet, lngPointStreet);

            if (distance > minimalDistance) {
                minimalDistance = distance;
                farthestCoordinate = [latPointStreet, lngPointStreet];
                idx = i;
            }
        }

        return idx
    }

    async getRoutes(province) {
        const mapObjectArr = ['departamentos', 'calles'];
        const streetsIds = callesJson[0]['calles'];
        console.log(streetsIds)
        for(let i=0; i<mapObjectArr.length; i++){

            if(mapObjectArr[i] != 'calles' && mapObjectArr[i] != 'rutas'){
                const shpFilePath = `./provincias/${province}/${mapObjectArr[i]}.shp`;
                const convertedGeoJsonLayer = await this.convertToGeoJson(shpFilePath);
                this.overlays[mapObjectArr] = convertedGeoJsonLayer;
            }
            else{
                for(let j=0; j< streetsIds.length; j++){
                    if(streetsIds[j]['provincia_nombre'] == 'Córdoba'){
                        const shpFilePath = `./provincias/${province}/${mapObjectArr[i]}/departamento-calamuchita-idcalle-${streetsIds[j]['id']}/calles.shp`;
                        console.log(shpFilePath)
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