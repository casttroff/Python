"""append(valor): Agrega un elemento al final de la lista."""

"""extend(iterable): Extiende la lista agregando otra lista."""
lista1 = [1, 2, 3]
lista2 = [3, 5, 6]
# Utilizando el método extend() para agregar los elementos de lista2 al final de lista1
lista1.extend(lista2)
print(lista1)

"""insert(posición, valor): Inserta un elemento en una posición específica (si la posición es mayor a una existente, inserta el valor al final de la lista)."""
mi_lista = [1, 2, 3, 4]
# Insertar el valor 5 en la posición 10 (que no existe en la lista)
mi_lista.insert(10, 5)
print(mi_lista)

"""remove(valor): Elimina la primera ocurrencia de un valor específico en la lista."""

"""pop([posición]): Elimina y devuelve el elemento en la posición especificada. Si no se especifica la posición, se elimina y devuelve el último elemento."""

"""index(valor): Devuelve la primera posición en la que se encuentra un valor específico."""

"""count(valor): Devuelve la cantidad de veces que aparece un valor en la lista."""

"""sort(): Ordena la lista de forma ascendente."""

"""reverse(): Invierte el orden de los elementos en la lista."""

"""copy(): Devuelve una copia superficial de la lista."""
mi_lista_1 = [1, 2, 3, 4]
mi_lista_2 = list(mi_lista_1)
mi_lista_3 = mi_lista_1.copy()
mi_lista_4 = mi_lista_1
print(mi_lista_1)
print(mi_lista_2)
print(mi_lista_3)
print(mi_lista_4)
print("id mi_lista_1", id(mi_lista_1))
print("id mi_lista_2", id(mi_lista_2))
print("id mi_lista_3", id(mi_lista_3))
print("id mi_lista_4", id(mi_lista_4))
"""clear(): Elimina todos los elementos de la lista."""

"""len(lista): Devuelve la longitud de la lista."""

"""lista[start:end]: Devuelve una porción de la lista desde la posición start hasta end-1"""
