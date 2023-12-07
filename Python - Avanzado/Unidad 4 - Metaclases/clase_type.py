class Material:
    material = "Titanio"

class Auto(Material):
    color = "Celeste"

    def retornar_color(self):
        return self.color


objeto = Auto()
print(objeto.retornar_color())


Auto2 = type("Auto2", (Material, ), {"color": "Azul", "retornar_color": (lambda x:x.color), "retornar_material": (lambda x:x.material)})
objeto2 = Auto2()
print(objeto2.retornar_color())
print(objeto2.retornar_material()) 