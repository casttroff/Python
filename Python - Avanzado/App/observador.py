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
        print("Actualización de argumentos en ConcreteObserverA. Argumentos: ", args)


class ConcreteObserverB(Observador):
    def __init__(self, obj):
        self.observado_b = obj
        self.observado_b.agregar(self)

    def update(self, *args):
        print("Actualización en ConcreteObserverB")
        print("Args: ", args)