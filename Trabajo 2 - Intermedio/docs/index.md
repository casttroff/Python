**Funcionamiento de la app**  

**Objetivo**  

1-	El objetivo principal de la app es poder controlar el stock de un negocio de cualquier rubro.  

2-	La app contará con más campos de entrada para mejorar la clasificación. Como por ejemplo imágenes del producto, dimensiones, peso, etc.   

**Funcionamiento**  

1-	Los datos que se ingresan en los widgets de Entry están controlados:  

Nombre: Puede ser cualquier carácter.  

Precio: Puede ser cualquier número con o sin decimales. El separador de la parte entera decimal que enviemos en Entry puede ser un punto (.) como una coma (,).  

En stock (n°): Puede ser cualquier número entero.  

ID: Este campo no se puede cambiar ya que el valor es asignado por la base de datos. Puede ser utilizado en funciones como “Eliminar” o “Modificar” o “Buscar”.  

2-	Para agregar un producto hay que cargar los datos Nombre, Precio, En stock (n°) e ID en los Entry. El ID no es necesario ya que se lo asigna automáticamente la base de datos.  

3-	Para eliminar un producto puedo seleccionarlo desde el Treeview o colocar el ID correspondiente en el Entry “ID”.  

4-	Para modificar un producto puedo seleccionarlo desde el Treeview o colocar el ID correspondiente en el Entry “ID”. Para esta función debo completar todos los campos Entry.  

5-	Para buscar un producto puedo buscarlo colocando su ID o Nombre en el Entry correspondiente.  

**Ejecución**  

1-	Para iniciar la app instalar las dependencias que se encuentran en “requirements.txt”. Puede ser mediante “pip install -r requirements.txt”  

2-	Desde CMD ejecutar “python controller.py” o desde VS Code dándole click a “Run”  

**Observaciones personales**  

1-	Las variables str, int y float quedaron inicializadas como StringVar y no con su respectivo IntVar o DoubleBar. Ya que al no haber visto en profundidad Try y Except me pareció una buena oportunidad para controlar estos StringVar con regex.  

2-	Se configura un evento de Tkinter para obtener los datos del Treeview en los widgets Entry cada vez que se clickea en un ítem: tree.bind(“TreeviewSelect”, select_product)
Esto me pareció muy conveniente ya facilita la modificación de los ítems.
