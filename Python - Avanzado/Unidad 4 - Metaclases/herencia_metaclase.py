## Metaclase type
class Control(type):
    inspeccion = "Aprobada"
    def __new__(meta, classname, supers, class_dict):
       return type.__new__(meta, classname, supers, class_dict)

## La metaclase de Auto hereda de la metaclase type
class Material(Control):
    material = "Titanio"

## Defino la metaclase de Auto
class Auto(metaclass=Material):
    color = "Celeste"

    def retornar_color(self):
        return self.color


objeto = Auto()
print(objeto.retornar_color())

## A metaclase type de esta forma se puede acceder solo desde la Clase
print(Auto.inspeccion)