class MiMetaClase(type):
    def __new__(meta, nombre_de_clase, superclase, diccionario_de_clase):
        print("En __new__: ", meta, nombre_de_clase, superclase, diccionario_de_clase, sep="\n ***")
        return type.__new__(meta, nombre_de_clase, superclase, diccionario_de_clase)
    
    def __init__(Clase, nombre_de_clase, superclase, diccionario_de_clase):
        print("En __init__: ", Clase, nombre_de_clase, superclase, diccionario_de_clase, sep="\n ***")
        print("Atributos y metodos de la clase: ", Clase.__dict__.keys())
        print("diccionario_de_clase: ", diccionario_de_clase)

class MiSuperClase: pass

class MiClase(MiSuperClase, metaclass=MiMetaClase):
    numero = 2
    
    def multiplica(self, mult):
        print("res: ", self.numero * mult)


operacion = MiClase()
operacion.multiplica(8)