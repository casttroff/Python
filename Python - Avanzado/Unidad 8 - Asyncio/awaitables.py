import asyncio
import datetime


async def main():
    print(f"Inicio de la corutina: {datetime.datetime.now()}")
    task_1 = asyncio.create_task(en_espera("Rojo", 2.3))
    task_2 = asyncio.create_task(en_espera("Azul", 2))
    await task_1
    await task_2
    print(task_1, task_2, end="\n")
    print(f"Fin de la corutina: {datetime.datetime.now()}")


async def en_espera(color, delay): 
    await asyncio.sleep(delay)
    return f"Después de {delay}s ya estoy listo '{color}'"

asyncio.run(main())
#print(main())
#print(type(main()))