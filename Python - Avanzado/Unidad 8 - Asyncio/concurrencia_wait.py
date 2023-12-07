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

    tasks = [
        asyncio.create_task(fatorial('A', 5)),
        asyncio.create_task(fatorial('B', 3)),
        asyncio.create_task(fatorial('C', 2)),
    ]
    
    await asyncio.wait(tasks)
    print("Tareas completadas")
    

asyncio.run(main())