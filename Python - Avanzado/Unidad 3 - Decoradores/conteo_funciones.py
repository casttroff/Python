def conteo_funciones(func):
    def envoltura(*args, **kwargs):
        envoltura.conteo += 1
        print("Llamada nro %d a la funcion %s" %(envoltura.conteo, func.__name__))
        return func(*args, **kwargs)
        
    envoltura.conteo = 0
    return envoltura


@conteo_funciones
def sumar(val1, val2):
    print(val1+val2)

sumar(2, 3)
sumar(2, 1)
sumar(2, 3)
sumar(2, 11)