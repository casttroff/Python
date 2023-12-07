import asyncio

async def eternity():
    await asyncio.sleep(3.0)
    print('yay!')

async def main():
    try:
        res = await asyncio.shield(eternity())
    except asyncio.CancelledError:
        res = None

asyncio.run(main())