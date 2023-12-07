def contador_yield(max):
    n = 0
    while n < max:
        yield n
        n += 1
        print(f"Ahora n es: {n}")


# Ejecuta la funcion entera k veces
k = 1
for x in contador_yield(k):
    print(type(x))
    print(x)