class ControlMotor(type):
    def __getitem__(cls, indice):
        return cls.marca[indice] * 3

class Auto(metaclass=ControlMotor):
    marca = "vw"
    def __getitem__(self, indice):
        return indice**0.5
    

auto = Auto()
print(auto[64])
print(Auto[1])