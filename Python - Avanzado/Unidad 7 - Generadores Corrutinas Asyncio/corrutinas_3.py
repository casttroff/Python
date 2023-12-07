def principal(segmento, corrutina):
    palabras = segmento.split(" ")
    for palabra in palabras:
        corrutina.send(palabra)
    corrutina.close()


def filtro(patron_1='do', patron_2='al', proxima_corrutina=None):
    print(f"Buscando los patrones {patron_1} y {patron_2}")
    try:
        while True:
            palabra = yield
            if patron_1 in palabra or patron_2 in palabra:
                proxima_corrutina.send(palabra)
    except GeneratorExit:
        print("Se terminó la busqueda por patrón.")


def destino():
    print("Estoy en destino")
    try:
        while True:
            palabra = yield
            palabra = palabra.strip(",")
            print(f"Palabra: {palabra}")
    except GeneratorExit:
        print("Se terminó la presentación de los datos.")

dg = destino()
# Ejecuta la funcion hasta el yield
dg.__next__()

fg = filtro(proxima_corrutina=dg)
fg.__next__()

secuencia = "Estando sentado en el estado omnipresencial, puedo observar aquello lejano a la deshumanidad, pero que mas puedo esperar de este mundo celestial"
principal(secuencia, fg)


