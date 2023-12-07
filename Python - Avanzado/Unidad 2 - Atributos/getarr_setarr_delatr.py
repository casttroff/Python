import time

class Persona:
    def __init__(self, nombre, edad):
        self._nombre = nombre
        self._edad = edad

    def __getattr__(self, attribute):
        print('getattr: ', attribute)
        if attribute == 'nombre':
            return self._nombre
        elif attribute == 'edad':
            return self._edad
        else:
            raise AttributeError(attribute)
        
    def __setattr__(self, attribute, value):
        print('setattr/value: ', attribute, value, sep='/')
        if attribute == 'nombre':
            attribute = '_nombre'
        elif attribute == 'edad':
            attribute = '_edad'    
        ## Modifica la superclase
        super().__setattr__(attribute, value)

    def __delattr__(self, attribute):
        print('detattr/value: ', attribute)
        if attribute == 'nombre':
            attribute = '_nombre'
        elif attribute == 'edad':
            attribute = '_edad'
        ## Modifica la superclase
        super().__delattr__(attribute)
        

#En este momento ocurre el __init__ y utiliza '_nombre' y '_edad'
persona1 = Persona("Fede", 27)
print(persona1.nombre)

#En este momento ocurre el __setattr__ y utiliza 'nombre' y 'edad'
persona1.nombre = "Rico"
print(persona1.nombre)

print(persona1.__dict__)
time.sleep(2.5)

del persona1.nombre
print(persona1.__dict__)
time.sleep(2.5)

del persona1.edad
print(persona1.__dict__)