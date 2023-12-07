def decorador_multiplicar_por_10(funcion):
    def envoltura(*args):
        print(funcion(*args) * 10)
    return envoltura

class Operador():
    @decorador_multiplicar_por_10
    def suma(self, val1, val2):
        return val1+val2

@decorador_multiplicar_por_10
def suma(val1, val2):
    return val1+val2


suma(2, 3)

## Es igual a
suma2 = Operador()
suma2.suma(2, 3) 