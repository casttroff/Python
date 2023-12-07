class Empleados:
    def ver_nombre(self, ):
        self.accion()

class Gerente(Empleados):

    def __init__(self, nombre):
        self.nombre = nombre
    
    def __str__(self, ):
        return 'Desde __str__ El nombre del gerente es ' + self.nombre
    
    def __add__(self, objeto2):
        if isinstance(objeto2, Empleados):
            self.nombre = self.nombre + " " + objeto2.nombre
            return self.nombre
        
    def accion(self, ):
        print("desde 'def accion()' El nombre del gerente es", self.nombre)


objeto1 = Gerente("Federico")
objeto2 = Gerente("Castro")

objeto1.ver_nombre()
objeto2.ver_nombre()

print(objeto1)
print(objeto2)

resultado = objeto1 + objeto2
print(resultado)
# resultado.ver_nombre()

