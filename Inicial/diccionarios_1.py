"""Existen varios métodos similares a .get() que se utilizan para acceder y manipular 
diccionarios en Python:"""


"""setdefault(key, default): Este método establece un valor predeterminado para 
#una clave en el diccionario si la clave no existe. Si la clave ya existe, el valor 
#existente se conserva. Por ejemplo:"""
diccionario = {}
diccionario.setdefault("clave", "valor_por_defecto")

""".update(dict): Este método se utiliza para agregar elementos de otro diccionario a 
un diccionario existente o para actualizar los valores de las claves que coinciden. 
Por ejemplo:
"""
diccionario1 = {"a": 1, "b": 2}
diccionario2 = {"b": 3, "c": 4}
diccionario1.update(diccionario2)

""".keys(), .values(), .items(): Estos métodos devuelven vistas de las claves, 
valores o pares clave-valor en el diccionario, respectivamente. 
Las vistas se pueden utilizar en bucles o convertir en listas según sea necesario. 
Por ejemplo:
"""
diccionario = {"a": 1, "b": 2, "c": 3}
claves = diccionario.keys()
valores = diccionario.values()
pares = diccionario.items()

""".pop(key, default): Este método elimina una clave y devuelve su valor asociado. Si la clave no existe, se puede proporcionar un valor predeterminado opcional que se devolverá en su lugar. Por ejemplo:
"""
diccionario = {"a": 1, "b": 2}
valor = diccionario.pop("a", 0)

""".popitem(): Este método elimina y devuelve un par clave-valor arbitrario del diccionario. Útil para eliminar elementos en el orden en que se agregaron. Por ejemplo:
"""
diccionario = {"a": 1, "b": 2, "c": 3}
par = diccionario.popitem()