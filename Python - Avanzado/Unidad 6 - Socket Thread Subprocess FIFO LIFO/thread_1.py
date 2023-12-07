import threading
import time

def en_espera(arg, tiempo):
    print(f"Ejecutando el hilo {arg} en {tiempo} segundos\n")
    time.sleep(tiempo)
    print(f"El hilo {arg} finaliza su ejecución\n")

t = threading.Thread(target=en_espera, name="thread1", args=("thread1", 3))
t.start()

#Usar join() para que la linea siguiente se ejecute al finalizar el trabajo del hilo
#t.join()

print("Mientras se ejecuta el hilo\n")

