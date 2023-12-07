import asyncio

async def waiting_and_print(delay):
    for i in range(10):
        await asyncio.sleep(delay)
        print(i)

async def waiting_and_return(color, delay):
    for i in range(2):
        await asyncio.sleep(delay)
        print(color)
    return color
    

async def main():
    task_1 = asyncio.create_task(waiting_and_print(1))
    task_2 = asyncio.create_task(waiting_and_return('red', 6))

    await asyncio.gather(task_1, task_2)
    
    # Obtenemos los resultados directamente, ya que waiting_and_return devuelve un valor.
    result_2 = task_2.result()
    
    print(result_2)

asyncio.run(main())