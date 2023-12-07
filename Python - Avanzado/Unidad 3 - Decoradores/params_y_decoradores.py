def captura_de_registro(valor=False):
    def _captura_de_funcion(func):
        def envoltura(*args, **kwargs):
            if valor:
                print("Estamos en modo Producción")
            else:
                 print("Estamos en modo Desarrollo")
            for id, atributo in enumerate(args):
                print("ID %d" %(id, ))
                print("atributo %s" %(atributo, ))
            func(*args, **kwargs)
        return envoltura
    return _captura_de_funcion

@captura_de_registro(False)
def crear_registro(nombre, apellido):
    print("Se crea registro de %s %s" %(nombre, apellido))


crear_registro('Federico', 'Castro')