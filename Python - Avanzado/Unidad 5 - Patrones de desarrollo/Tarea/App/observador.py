class Subject:
    observadores = []

    def agregar(self, obj):
        self.observadores.append(obj)

    def quitar(self, obj):
        pass

    def notificar(self, *args):
        for observador in self.observadores:
            observador.update(*args)


class TemaASeguir(Subject):
    def __init__(self, ):
        self.estado = None

    def set_estado(self, value):
        self.estado = value
        self.notificar()

    def get_estado(self):
        return self.estado
    
class Observador:
    def update(self):
        raise NotImplementedError("Delegación de actualización")


class ConcreteObserverA(Observador):
    def __init__(self, obj):
        self.observado_a = obj
        self.observado_a.agregar(self)

    def update(self, *args):
        print("Actualización desde ConcreteObserverA")
        print("Args: ", args)
        print(type(args[0]))
        print("Class dict: ", args[0].__dict__.keys())

class ConcreteObserverB(Observador):
    def __init__(self, obj):
        self.observado_b = obj
        self.observado_b.agregar(self)

    def update(self, *args):
        print("Actualización desde ConcreteObserverB")
        print("Args: ", args)


# tema1=TemaASeguir()
# observador_a=ConcreteObserverA(tema1)
# observador_b=ConcreteObserverB(tema1)
# tema1.set_estado(1)
# tema1.set_estado(2)