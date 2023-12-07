import re
import tkinter as tk
from tkinter import ttk
from tkinter.messagebox import *
import sqlite3


################################################################
# Conexión a la base de datos.
################################################################
def connect_database():
    con = sqlite3.connect("productos.db")
    return con

################################################################
# Creación de la primera tabla.
################################################################
def create_table():
    con = connect_database()
    cursor = con.cursor()
    query = """CREATE TABLE IF NOT EXISTS products
            (id INTEGER PRIMARY KEY AUTOINCREMENT, 
            product_name VARCHAR(50) NOT NULL,
            product_quantity INTEGER NOT NULL,
            product_price REAL NOT NULL)
    """
    cursor.execute(query)
    con.commit()

try:
    connect_database()
    create_table()
except Exception as e:
    print("No es posible conectarse a la base de datos.", e)

################################################################
# Da formato de 1 digito despues de la coma a los float.
################################################################
def format_float(value):
    formated_value = "{:.1f}".format(float(value))
    return str(formated_value)

################################################################
# Agrega un producto.
################################################################
def add_product(name, price, stock, tree):
    if validate_real_number(price) and validate_number(stock) and name != "":
        price_formated = format_float(price)
        con = connect_database()
        cursor = con.cursor()
        args = (name, stock, price_formated)
        query = "INSERT INTO products(product_name, product_quantity, product_price) VALUES (?, ?, ?)"
        cursor.execute(query, args)
        con.commit()
        id_entry.delete(0, tk.END)
        name_entry.delete(0, tk.END)
        price_entry.delete(0, tk.END)
        stock_entry.delete(0, tk.END)
    else:
        showerror("Error", "Verifique los datos ingresados y vuelva a intentar.")
    treeview_update(tree)

################################################################
# Elimina un producto.
################################################################
def delete_product(entry_id, tree):
    if validate_number(entry_id):
        result = askokcancel("Aviso", "¿Desea eliminar este producto?")
        if result:
            con = connect_database()
            cursor = con.cursor()
            args = (entry_id,)
            query = "DELETE FROM products WHERE id=?"
            cursor.execute(query, args)
            con.commit()
            id_entry.delete(0, tk.END)
            name_entry.delete(0, tk.END)
            price_entry.delete(0, tk.END)
            stock_entry.delete(0, tk.END)
    else:
        showerror("Error", "El ID debe ser un número entero.")
    treeview_update(tree)

################################################################
# Actualiza un producto.
################################################################
def update_product(product_id, name, price, stock, tree):
    if validate_number(product_id) and validate_number(stock) and validate_real_number(price) and name != "":
        price = format_float(price)
        con = connect_database()
        cursor = con.cursor()
        args = (name, stock, price, product_id)
        sql = "UPDATE products SET product_name=?, product_quantity=?, product_price = ? WHERE id=?;"
        cursor.execute(sql, args)
        con.commit()
        treeview_update(tree)
    else:
        showerror("Error", "Verifique los datos ingresados.\nPuede modificar un producto solo con su ID.")

################################################################
# Carga los datos en Entry al seleccionar un ítem del treeview.
################################################################
def select_product(event):
    selected_item = tree.selection()
    if selected_item: 
        values = tree.item(selected_item,"values")
        product_id = tree.item(selected_item,"text")
        id_entry.delete(0, tk.END)
        name_entry.delete(0, tk.END)
        price_entry.delete(0, tk.END)
        stock_entry.delete(0, tk.END)
        id_entry.insert(0, product_id)
        name_entry.insert(0, values[0])
        stock_entry.insert(0, values[1])
        price_entry.insert(0, values[2])

################################################################
# Busca un producto.
################################################################
def search_product(entry_id, product_name, tree):
    con = connect_database()
    cursor = con.cursor()
    if validate_number(entry_id):
        args = (entry_id,)
        query = "SELECT * FROM products where id=?"
    elif product_name != "":
        args = ('%' + product_name + '%',)
        query = "SELECT * FROM products where product_name LIKE ?"
    else:
        showerror("Error", "Busque productos por Nombre o ID.")
        return treeview_update(tree)
    response = cursor.execute(query, args)   
    values =response.fetchone()
    if not isinstance(values, type(None)):
        id_entry.delete(0, tk.END)
        name_entry.delete(0, tk.END)
        price_entry.delete(0, tk.END)
        stock_entry.delete(0, tk.END)
        id_entry.insert(0, values[0])
        name_entry.insert(0, values[1])
        stock_entry.insert(0, values[2])
        price_entry.insert(0, values[3])
    treeview_update(tree)
    
################################################################
# Elimina todos los datos del treeview y lo carga nuevamente con los datos de la BBDD.
################################################################
def treeview_update(tree):
    record = tree.get_children()
    for item in record:
        tree.delete(item)
    con = connect_database()
    cursor = con.cursor()
    query = "SELECT * FROM products"
    res = cursor.execute(query)
    data = res.fetchall()
    for row in data:
        tree.insert("", "end", text=row[0], values=(row[1], row[2], row[3]))

################################################################
# Verifica que siempre comience con un numero y la secuencia
# puede repetirse una o más veces.
################################################################
def validate_number(number):
    pattern = r'^[0-9]+$'
    if re.match(pattern, number):
        return True
    else:
        return False

################################################################
# Verifica que sea un número real, admite "coma" o "punto" como separador.
################################################################
def validate_real_number(number):
    pattern = r'^\d+(\.\d+)?(,\d+)?$'
    if re.match(pattern, number):
        return True
    else:
        return False

################################################################
# Inicia la aplicación.
################################################################
root = tk.Tk()
root.title("SM")

name_var = tk.StringVar()
price_var = tk.StringVar()
stock_var = tk.StringVar()
id_var = tk.StringVar()
################################################################
# Frame root.
################################################################
frame_root = tk.Frame(root, borderwidth=1, relief=tk.SOLID)
frame_root.pack(padx=10, pady=10)

################################################################
# Label de frame root.
################################################################
title_label = tk.Label(frame_root, text="Stock manager", padx=10, pady=10)
title_label.place(y=0)

################################################################
# Frame contenedor de grilla.
################################################################
product_grid_frame = ttk.Frame(frame_root, borderwidth=1, relief=tk.SOLID)
product_grid_frame.grid(row=0, column=0, columnspan=2, padx=10, pady=40)

################################################################
# Crea una grilla para mostrar los datos.
################################################################
tree= ttk.Treeview(product_grid_frame, columns=("name", "stock", "price"))

tree.column("#0", width=50)
tree.column("name", width=300)
tree.column("stock", width=100)
tree.column("price", width=100)

tree.heading("#0", text="ID", anchor=tk.CENTER)
tree.heading("name", text="Nombre", anchor=tk.CENTER)
tree.heading("stock", text="En stock", anchor=tk.CENTER)
tree.heading("price", text="Precio", anchor=tk.CENTER)
tree.pack(fill=tk.BOTH, expand=True)

################################################################
# Crea el scrollbar vertical.
################################################################
scrollbar = ttk.Scrollbar(product_grid_frame, orient=tk.VERTICAL, command=tree.yview)
tree.configure(yscrollcommand=scrollbar.set)

################################################################
# Ubica la grilla y el scrollbar en el frame.
################################################################
tree.grid(row=0, column=0, sticky="nsew")
scrollbar.grid(row=0, column=1, sticky="ns")


################################################################
# Frame contenedor de inputs y botones.
################################################################
input_frame = ttk.Frame(frame_root, width=20, borderwidth=1, relief=tk.SOLID)
input_frame.grid(row=1, column=0, padx=10, pady=10, sticky="w")

################################################################
# Objetos de input_frame.
################################################################
name_label = tk.Label(input_frame, text="Nombre", width=10)
name_label.grid(row=0, column=0, sticky="w")

price_label = tk.Label(input_frame, text="Precio", width=10)
price_label.grid(row=1, column=0, sticky="w")

stock_label = tk.Label(input_frame, text="En stock (n°)", width=10)
stock_label.grid(row=2, column=0, sticky="w")

id_label = tk.Label(input_frame, text="ID", width=10)
id_label.grid(row=3, column=0, sticky="w")

name_entry = ttk.Entry(input_frame, width=40, textvariable = name_var)
name_entry.grid(row=0, column=1, columnspan=3, padx=5, pady=5, sticky="w")

price_entry = ttk.Entry(input_frame, width=40, textvariable = price_var)
price_entry.grid(row=1, column=1, columnspan=3, padx=5, pady=5, sticky="w")

stock_entry = ttk.Entry(input_frame, width=40, textvariable = stock_var)
stock_entry.grid(row=2, column=1, columnspan=3, padx=5, pady=5, sticky="w")

id_entry = ttk.Entry(input_frame, width=10, textvariable = id_var)
id_entry.grid(row=3, column=1, columnspan=3, padx=5, pady=5, sticky="w")

add_button = ttk.Button(input_frame, text="Agregar", command=lambda:add_product(name_var.get(), price_var.get(), stock_var.get(), tree), width=10)
add_button.grid(row=4, column=0, padx=5, pady=5)

delete_button = ttk.Button(input_frame, text="Eliminar", command=lambda:delete_product(id_var.get(), tree), width=10)
delete_button.grid(row=4, column=1, padx=5, pady=5)

update_button = ttk.Button(input_frame, text="Actualizar", command=lambda:update_product(id_var.get(), name_var.get(), price_var.get(), stock_var.get(), tree), width=10)
update_button.grid(row=4, column=2, padx=5, pady=5)

search = ttk.Button(input_frame, text="Buscar", command=lambda:search_product(id_var.get(), name_var.get(), tree), width=10)
search.grid(row=4, column=3, padx=5, pady=5)


################################################################
# Configura el evento de selección de un ítem en la grilla.
################################################################
tree.bind("<<TreeviewSelect>>", select_product)

root.mainloop()