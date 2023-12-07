import asyncio
import datetime


async def main():
    print(f"Inicio de la corutina: {datetime.datetime.now()}")
    await en_espera("Rojo", 2.3)
    await en_espera("Azul", 2)
    print(f"Fin de la corutina: {datetime.datetime.now()}")


async def en_espera(color, delay): 
    await asyncio.sleep(delay)
    print(f"Después de {delay}s ya estoy listo '{color}'")

asyncio.run(main())
print(main())
#print(type(main()))