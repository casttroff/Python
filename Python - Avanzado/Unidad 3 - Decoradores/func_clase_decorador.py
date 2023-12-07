def decorador(cls):
    class Envoltura:
        def __init__(self, *args):
            self.clase_envuelta = cls(*args)

        def __getattr__(self, atributo):
            print("Nombre de clase_envuelta", self.clase_envuelta.__class__)
            print("Nombre de clase de __setattr__", self.__class__)
            print("Nombre de atributo de la clase {}: {}".format(self.clase_envuelta.__class__, atributo))
            return getattr(self.clase_envuelta, atributo)
    return Envoltura

@decorador
class Auto:
    def __init__(self, color, marca):
        self.color = color
        self.marca = marca


auto = Auto("Celeste", "Ford")
print(auto.marca)
print(auto.color)