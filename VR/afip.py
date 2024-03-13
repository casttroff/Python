import requests
import zipfile
import io
import os
import json
from urllib.parse import urlencode
from unidecode import unidecode
from django.utils.text import slugify
import logging

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) + "/provincias"
BASE_API_URL = "https://apis.datos.gob.ar/georef/api/"

logging.basicConfig(filename='logs.log', level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def get_similar(endpoint, **kwargs):
    url = "{}{}?{}".format(BASE_API_URL, endpoint, urlencode(kwargs))
    print(url)
    response = requests.get(url)

    if endpoint == 'localidades-censales':
        endpoint = endpoint.replace("-", "_")

    if response.status_code == 200:
        rjson = response.json()[endpoint]
        return rjson
    else:
        print(f"err in kwargs: {kwargs} - status code: {response.status_code}")
        logging.warning(f"Err code {response.status_code}")
        return None


def get_similar_documents(endpoint, **kwargs):
    url = "{}{}?{}".format(BASE_API_URL, endpoint, urlencode(kwargs))
    response = requests.get(url)

    if response.status_code == 200:
        documents = response.content
        return documents
    else:
        print(f"err in kwargs: {kwargs} - status code: {response.status_code}")
        logging.warning(f"Err code {response.status_code}")
        return None
    

def get_provinces_docs(provinces_list):

    for province in provinces_list:
        kwargs = {'nombre': province['nombre'], 'max': 5000, 'formato': 'shp'}
        provinces_docs = get_similar_documents('provincias', **kwargs)
        url =f"{BASE_DIR}/{slugify(province['nombre'])}"
        extract_documents(provinces_docs, url)
    
def get_provinces_list():
    provinces_list = ["buenos aires", "catamarca", "chaco", "chubut", "cordoba", "corrientes", "entre rios", "formosa", "jujuy", "la pampa", "la rioja", "mendoza", "misiones", "neuquen", "rio negro", "salta", "san juan", "san luis", "santa cruz", "santa fe", "santiago del estero", "tierra del fuego", "tucuman"]
    final_provinces_list = []
    for province in provinces_list:
        kwargs = {'nombre': province, 'max': 5000}
        provinces_json_list = get_similar('provincias', **kwargs)
        provinces_list_from_json = [{'id': province['id'], 'nombre': province['nombre']} for province in provinces_json_list if province['id'] and province['nombre']]
        final_provinces_list.extend(provinces_list_from_json)

    return final_provinces_list

def get_departments_list(provinces_list):
    departments_list = []

    for province in provinces_list:
        kwargs = {'provincia': province['id'], 'max': 5000}
        department_json = get_similar("departamentos", **kwargs)
        department_list_from_json = [{'id': depart['id'], 'departamento_nombre': unidecode(depart['nombre']).lower(), 'provincia': province['nombre'], 'provincia_id': province['id']} for depart in department_json if depart['id'] and depart['nombre']]
        departments_list.extend(department_list_from_json)

    return departments_list


def get_departments_docs(provinces_list):
    for province in provinces_list:
        kwargs = {'provincia': province['id'], 'max': 5000, 'formato': 'shp'}
        department_docs = get_similar_documents("departamentos", **kwargs)
        url = f"{BASE_DIR}/{slugify(province['nombre'])}"
        extract_documents(department_docs, url)


def get_municipalities_docs(provinces_list):
    for province in provinces_list:
        kwargs = {'provincia': province['id'], 'max': 5000, 'formato': 'shp'}
        municipalities_docs = get_similar_documents('municipios', **kwargs)
        url = f"{BASE_DIR}/{slugify(province['nombre'])}"
        extract_documents(municipalities_docs, url)


def get_municipalities_list(provinces_list):
    municipalities_list = []
    for provincia in provinces_list:
        kwargs = {'provincia': provincia['id'], 'max': 5000}
        municipalities_json = get_similar('municipios', **kwargs)
        municipalities_list_from_json = [{'id': municipality['id'], 'municipalidad_nombre': slugify(unidecode(municipality['nombre'])).lower(), 
                                'provincia': slugify(unidecode(provincia['nombre'])).lower(), 'provincia_id': provincia['id']} 
                                for municipality in municipalities_json 
                                if municipality['id'] and municipality['nombre']]
        municipalities_list.extend(municipalities_list_from_json)

    return municipalities_list

def get_census_localities_list(provinces_list):
    census_localities_list = []
    for provincia in provinces_list:
        kwargs = {'provincia': provincia['id'], 'max': 5000}
        census_localities_json = get_similar('localidades-censales', **kwargs)
        print(census_localities_json)
        census_localities_list_from_json = [{'id': census_locality['id'], 'census_locality_name': slugify(unidecode(census_locality['nombre'])).lower(), 
                                'provincia': slugify(unidecode(provincia['nombre'])).lower(), 'provincia_id': provincia['id']} 
                                for census_locality in census_localities_json 
                                if census_locality['id'] and census_locality['nombre']]
        census_localities_list.extend(census_localities_list_from_json)

    return census_localities_list

def get_census_localities_docs(provinces_list):
    for province in provinces_list:
        kwargs = {'provincia': province['id'], 'max': 5000, 'formato': 'shp'}
        census_localities_docs = get_similar_documents('localidades-censales', **kwargs)
        url = f"{BASE_DIR}/{slugify(province['nombre'])}"
        extract_documents(census_localities_docs, url)

def get_localities_list(provinces_list):
    localities_list = []
    for provincia in provinces_list:
        kwargs = {'provincia': provincia['id'], 'max': 5000}
        localities_json = get_similar('localidades', **kwargs)
        print(localities_json)
        localities_list_from_json = [{'id': locality['id'], 'locality_name': slugify(unidecode(locality['nombre'])).lower(), 
                                'provincia': slugify(unidecode(provincia['nombre'])).lower(), 'provincia_id': provincia['id']} 
                                for locality in localities_json 
                                if locality['id'] and locality['nombre']]
        localities_list.extend(localities_list_from_json)

    return localities_list

def get_localities_docs(provinces_list):
    for province in provinces_list:
        kwargs = {'provincia': province['id'], 'max': 5000, 'formato': 'shp'}
        localities_docs = get_similar_documents('localidades', **kwargs)
        url = f"{BASE_DIR}/{slugify(province['nombre'])}"
        extract_documents(localities_docs, url)

def get_settlements_docs(provinces_list):
    for province in provinces_list:
        kwargs = {'provincia': province['id'], 'max': 5000, 'formato': 'shp'}
        settlements_docs = get_similar_documents('asentamientos', **kwargs)
        url = f"{BASE_DIR}/{slugify(province['nombre'])}"
        extract_documents(settlements_docs, url)

def get_streets_docs(municipalities_list): 
    for municipality in municipalities_list:
        kwargs = {'interseccion': f"municipio:{municipality['id']}", 'formato': 'shp', 'max': 5000}
        logging.debug(f"MUN {municipality['id']}")
        streets_documents = get_similar_documents('calles', **kwargs)
        url = f"{BASE_DIR}/{municipality['provincia']}/calles/municipio-{municipality['municipalidad_nombre']}"
        extract_documents(streets_documents, url)


def get_routes_streets_docs(municipalities_list): 
    for municipality in municipalities_list:
        kwargs = {'interseccion': f"municipio:{municipality['id']}", 'formato': 'shp', 'categoria': 'ruta', 'max': 5000}
        logging.debug(f"MUN {municipality['id']}")
        streets_documents = get_similar_documents('calles', **kwargs)
        url = f"{BASE_DIR}/{municipality['provincia']}/rutas/municipio-{municipality['municipalidad_nombre']}"
        extract_documents(streets_documents, url)


def extract_documents(documents, extract_folder_url):
    if documents:
        with zipfile.ZipFile(io.BytesIO(documents), 'a') as zip_ref:
            os.makedirs(extract_folder_url, exist_ok=True)
            zip_ref.extractall(extract_folder_url)

        print(f"Archivos extraídos en la carpeta: {extract_folder_url}")
    else:
        logging.warning(f"Error al obtener datos para {extract_folder_url}")


def to_json(list_):
    with open("json_streets.json", 'w') as f:
        json.dump(list_, f)


provinces_list = get_provinces_list()
# get_provinces_docs(provinces_list)
#department_list = get_departments_list(provinces_list)
# get_departments_docs(provinces_list)
#census_localities = get_census_localities_list(provinces_list)
#localities = get_localities_list(provinces_list)
#get_census_localities_docs(provinces_list)
#get_localities_docs(provinces_list)
#get_settlements_docs(provinces_list)
# print(census_localities)
municipalietes_list = get_municipalities_list(provinces_list)
# get_municipalities_docs(provinces_list)
# get_streets_docs(municipalietes_list)
get_routes_streets_docs(municipalietes_list)
#to_json(census_localities)
# for r in department_list:
#     if r['provincia'] == 'jujuy':
#         print(r)