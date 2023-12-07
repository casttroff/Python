import queue

q = queue.PriorityQueue()

q.put((99, "Este es el último"))
q.put((0, "Este es el primero"))
q.put((5, "Este es el segundo"))
q.put((98, "Este es el tercero"))

while not q.empty():
    print(q.get())