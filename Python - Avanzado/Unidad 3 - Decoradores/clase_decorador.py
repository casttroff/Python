class DecoradorMultiplicarPor10:
    def __init__(self, func) -> None:
        self.func = func    

    def __call__(self, *args):
        print(self.func(*args))
        return(self.func(*args) * 10)


@DecoradorMultiplicarPor10
def suma(val1, val2):
    return val1+val2


s = suma(2, 3)
print(s)
