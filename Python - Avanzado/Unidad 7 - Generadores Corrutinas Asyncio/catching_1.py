from functools import cache

@cache
def factorial(n):
    print(n)
    return n*factorial(n-1) if n else 1


print("Fact 10: ", factorial(10))
print("*" * 30)

print("Fact 4: ", factorial(4))
print("*" * 30)

print("Fact 13: ", factorial(13))
print("*" * 30)