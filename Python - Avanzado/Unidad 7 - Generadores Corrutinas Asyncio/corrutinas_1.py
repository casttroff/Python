def cor_generator(max):
    n = 0
    while n < max:
        n = yield
        n += 1
        print(n)

g = cor_generator(11)
# Prepara la función hasta el yield
g.__next__()
g.send(4)

# .close detiene el generador
#g.close()
g.send(2)