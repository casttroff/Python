class AccederEdad:
    def __get__(self, instance, owner):
            print("__get__ edad", end='\n')
            return instance._edad

    def __set__(self, instance, value):
        print("__set__ value", value, end='\n')
        if value < 0:
            raise Exception("La edad no puede ser negativa")
        elif value == 64:
            print("¡Excelente, te falta un año para jubilarte e ir a vivir a Islas Filipinas 🤩 !")
        instance._edad = value


class AccederInstanciaMail:
    def __get__(self, instance, owner):
        print("__set__ instance._mail de 'AccederInstanciaMail': ", self, instance, owner, end='\n')
        return instance._mail + '.ar'
    
    def __set__(self, instance, value):
        print("__set__ instance._mail de 'AccederInstanciaMail': ", self, instance, value, end='\n')
        instance._mail = value


class Cliente:
    def __init__(self, user, edad, mail, salario):
        self._user = user
        self._edad = edad
        self._mail = mail
        self.salario = salario

    class DescriptorUsuario:

        def __get__(self, instance, owner):
            print("__get__ user: ", self, instance, owner, end='\n')
            return instance._user.upper()

        def __set__(self, instance, value):
            print("__set__ value", value, end='\n')
            instance._user = value

        def __delete__(self, instance):
            print("__delete__ of instance", end='\n')
            del instance._user

    user = DescriptorUsuario()
    edad = AccederEdad()
    mail = AccederInstanciaMail()


cliente1 = Cliente("Fede", 63, "casttroff@gmail.com", 200)
print(cliente1.user, cliente1.edad)

cliente1.user = 'rico'
print(cliente1.user, cliente1.edad)

print(cliente1.mail)
cliente1.mail = cliente1.mail + '.gob'
print(cliente1.mail)

cliente1.edad = 64
del cliente1.user

