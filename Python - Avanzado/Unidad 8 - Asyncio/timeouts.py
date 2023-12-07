import asyncio

async def waiting():
    await asyncio.sleep(3600)
    print("yay")


async def main():
    try:
        await asyncio.wait_for(waiting(), timeout=1)
    except asyncio.TimeoutError:
        print("timeout")

asyncio.run(main()) 