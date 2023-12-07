_cache = {}


def factorial(n):
    try:
        if _cache[n]:
            return _cache[n]
    except:
        print(n)
        b = n*factorial(n-1) if n else 1
        _cache[n] = b
        return b


print("Factorial de 10: ", factorial(10))
print("*" * 30)


print("Factorial de 4: ", factorial(4))
print("*" * 30)
_cache.clear()
print("Factorial de 13: ", factorial(13))
print("*" * 30)


