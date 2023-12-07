import queue

#LIFO
q = queue.LifoQueueQueue()

for i in range(3):
    q.put(i)
    print(list(q.queue))

    
for i in range(q.qsize()):
    print(q.get(), end='\t')

print(list(q.queue))