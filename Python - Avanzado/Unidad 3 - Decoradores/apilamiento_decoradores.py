def cambio_estado(func):
    def envoltura(*args, **kwargs):
        if args[0]:
            print("Motor Activado")
        else:
            print("Motor Desactivado")
        return func(*args, **kwargs)
    return envoltura


def aviso_cambio_estado(func):
    def envoltura(*args, **kwargs):
        print("Cambio de estado ASIGNADO")
        print("Se ejecutó %s" % func.__name__)
        return func(*args, **kwargs)
    return envoltura


@cambio_estado
@aviso_cambio_estado
def estado_motor(estado):
    print(estado)

estado_motor(True)