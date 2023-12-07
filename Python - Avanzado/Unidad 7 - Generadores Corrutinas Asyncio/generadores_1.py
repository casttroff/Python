def generador():
    n = 0
    print("Primera vez")
    yield n

    n += 1
    print("Segunda vez")
    yield n


gen = generador()

print(next(gen))
print(next(gen))