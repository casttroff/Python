import asyncio
import threading
import time


def factorial(nombre, numero):
    f = 1
    threading.current_thread().name = nombre
    thread_name = threading.current_thread().name
    thread_id = threading.current_thread().ident

    print(f"Task {nombre}, thread {thread_name} ({thread_id})")

    for i in range(2, numero+1):
        print(f"{nombre} calculando fatorial de {numero}...concurrencia {i} thread_id {thread_id}")
        time.sleep(1)
        f *= i
    print(f"Task {nombre}, factorial {f}")
    return f


async def main():
    await asyncio.gather(
        asyncio.to_thread(factorial, "A", 5),
        asyncio.to_thread(factorial, "B", 4),
        asyncio.to_thread(factorial, "C", 3),
    )


asyncio.run(main())