def contador_yield(max):
    n = 0
    while n < max:
        yield n
        n += 1
        print(f"Ahora n es: {n}")


# Devuelve hasta yield y comienza desde yield
g = contador_yield(5)
for _ in range(2):
    print(next(g))