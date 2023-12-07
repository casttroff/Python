import asyncio

async def mostrar_s():
    while True:
        for i in range(60):
            print(f"{i} s")
            await asyncio.sleep(1)

async def mostrar_m():
    while True:
        for i in range(60):
            await asyncio.sleep(60)
            print(f"{i+1} M")


loop = asyncio.get_event_loop()

loop.run_until_complete(asyncio.gather(mostrar_s(), mostrar_m()))