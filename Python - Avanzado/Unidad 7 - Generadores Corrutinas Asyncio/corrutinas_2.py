def cor_generator(prefix):
    nombre = "NoName"
    while True:
        nombre = yield
        if prefix in nombre:
            print(nombre)


n = cor_generator("Fe")
n.__next__()
n.send("Fede")
n.send("Feliz")
n.send("Fatal")
n.send("Fernando")
n.send("Frutilla")
n.send("Felipe")
n.send("Fanático")
n.send("Feroz")