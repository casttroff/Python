import asyncio

async def fatorial(nombre, numero):
    f = 1
    for i in range(2, numero+1):
        print(f"{nombre} calculando fatorial de {numero}...concurrencia {i}")
        await asyncio.sleep(1)
        f *= i
    print(f"Task {nombre}, factorial {f}")
    return f

async def main():
    l = await asyncio.gather(
        fatorial('A', 5),
        fatorial('B', 3),
        fatorial('C', 2),
    )
    print(l)


asyncio.run(main())