import datetime
import asyncio

async def mostrar_fecha():
    loop = asyncio.get_event_loop()
    end_time = loop.time() + 5.0
    while True:
        print(datetime.datetime.now())
        if (loop.time() + 1.0) >= end_time:
            break
        await asyncio.sleep(1)

asyncio.run(mostrar_fecha())   
