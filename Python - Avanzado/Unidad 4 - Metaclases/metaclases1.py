def extender_metodo_1(obj):
    return "Extendiendo desde la extender_metodo_1"

def extender_metodo_2(obj, valor):
    return "Extendiendo desde la extender_metodo_2" + ' ' + valor

class Extender(type):
    encendido = False

    def __new__(meta, classname, supers, class_dict):
        class_dict['ext_met_1'] = extender_metodo_1
        class_dict['ext_met_2'] = extender_metodo_2
        return type.__new__(meta, classname, supers, class_dict)


class AutoCondition(metaclass=Extender):
    material = "Titanio"


class Auto(metaclass=Extender):
    marca = "vw"

    def __init__(self, color):
        self.color = color

    def imprimir_auto(self):
        print("marca/color", self.marca, self.color, sep="/")


auto1 = Auto("Celeste")
print(auto1.ext_met_1())
print(auto1.ext_met_2("Auto Azul"))