import threading
import queue
import time

def agregar_item(q):
    while True:
        print("Hilo secundario inicio", list(q.queue))
        print("Inicio de agregar item a queue\n")
        #Hilo agregado
        q.put(3)
        print("Hilo secundario despues de put 3", list(q.queue))
        time.sleep(1)
        print("Hilo secundario despues de time.sleep", list(q.queue))
        print("Print antes del break\n")
        break


q = queue.Queue()
t = threading.Thread(target=agregar_item, args=(q, ))
t.start()

#Hilo principal
print("Antes del put en hilo principal")
q.put(5)
print("Hilo principal despues del put 5")


print("Hilo principal", list(q.queue))