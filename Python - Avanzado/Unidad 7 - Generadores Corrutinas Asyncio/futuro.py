#PASO 1
from concurrent.futures import Future

#PASO 3
def funcion_futura(args):
    #PASO 6
    valor = args.result()
    print(valor)

#PASO 2
fut = Future()
#PASO 4
fut.add_done_callback(funcion_futura)
#Paso 5
fut.set_result(["Hola", "Comotas"])