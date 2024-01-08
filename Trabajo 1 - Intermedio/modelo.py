import re
import sqlite3
from tkinter.messagebox import *


################################################################
# Instancia de clase y creación de la primera tabla.
################################################################
class Abmc:
    def __init__(self, ):
        try:
            con = sqlite3.connect("productos.db")
            cursor = con.cursor()
            query = """CREATE TABLE IF NOT EXISTS products
                    (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    product_name VARCHAR(50) NOT NULL,
                    product_quantity INTEGER NOT NULL,
                    product_price REAL NOT NULL)
            """
            cursor.execute(query)
            con.commit()
        except:
            print("Conectado a SQLite.")

    ################################################################
    # Conexión a la base de datos.
    ################################################################
    def connect_database(self, ):
        try:
            con = sqlite3.connect("productos.db")
            return con
        except:
            print("Falló la conexión a la base de datos.")


    ################################################################
    # Da formato de 1 digito despues de la coma a los float.
    ################################################################
    def format_float(self, value):
        formated_value = "{:.1f}".format(float(value))
        return str(formated_value)

    ################################################################
    # Agrega un producto.
    ################################################################
    def add_product(self, name, price, stock, tree, END, id_entry, name_entry, price_entry, stock_entry):
        if self.validate_real_number(price) and self.validate_number(stock) and name != "":
            price_formated = self.format_float(price)
            con = self.connect_database()
            cursor = con.cursor()
            args = (name, stock, price_formated)
            query = "INSERT INTO products(product_name, product_quantity, product_price) VALUES (?, ?, ?)"
            cursor.execute(query, args)
            con.commit()
            id_entry.delete(0, END)
            name_entry.delete(0, END)
            price_entry.delete(0, END)
            stock_entry.delete(0, END)
        else:
            showerror("Error", "Verifique los datos ingresados y vuelva a intentar.")
        self.treeview_update(tree)

    ################################################################
    # Elimina un producto.
    ################################################################
    def delete_product(self, entry_id, tree, END, id_entry, name_entry, price_entry, stock_entry):
        if self.validate_number(entry_id):
            result = askokcancel("Aviso", "¿Desea eliminar este producto?")
            if result:
                con = self.connect_database()
                cursor = con.cursor()
                args = (entry_id,)
                query = "DELETE FROM products WHERE id=?"
                cursor.execute(query, args)
                con.commit()
                id_entry.delete(0, END)
                name_entry.delete(0, END)
                price_entry.delete(0, END)
                stock_entry.delete(0, END)
        else:
            showerror("Error", "El ID debe ser un número entero.")
        self.treeview_update(tree)

    ################################################################
    # Actualiza un producto.
    ################################################################
    def update_product(self, product_id, name, price, stock, tree):
        if self.validate_number(product_id) and self.validate_number(stock) and self.validate_real_number(price) and name != "":
            price = self.format_float(price)
            con = self.connect_database()
            cursor = con.cursor()
            args = (name, stock, price, product_id)
            sql = "UPDATE products SET product_name=?, product_quantity=?, product_price = ? WHERE id=?;"
            cursor.execute(sql, args)
            con.commit()
            self.treeview_update(tree)
        else:
            showerror("Error", "Verifique los datos ingresados.\nPuede modificar un producto solo con su ID.")

    ################################################################
    # Carga los datos en Entry al seleccionar un ítem del treeview.
    ################################################################
    def select_product(self, event, tree, END, id_entry, name_entry, price_entry, stock_entry):
        selected_item = tree.selection()
        if selected_item: 
            values = tree.item(selected_item,"values")
            product_id = tree.item(selected_item,"text")
            id_entry.delete(0, END)
            name_entry.delete(0, END)
            price_entry.delete(0, END)
            stock_entry.delete(0, END)
            id_entry.insert(0, product_id)
            name_entry.insert(0, values[0])
            stock_entry.insert(0, values[1])
            price_entry.insert(0, values[2])

    ################################################################
    # Busca un producto.
    ################################################################
    def search_product(self, entry_id, product_name, tree, END, id_entry, name_entry, price_entry, stock_entry):
        con = self.connect_database()
        cursor = con.cursor()
        if self.validate_number(entry_id):
            args = (entry_id,)
            query = "SELECT * FROM products where id=?"
        elif product_name != "":
            args = ('%' + product_name + '%',)
            query = "SELECT * FROM products where product_name LIKE ?"
        else:
            showerror("Error", "Busque productos por Nombre o ID.")
            return self.treeview_update(tree)
        
        response = cursor.execute(query, args)   
        values =response.fetchone()

        if not isinstance(values, type(None)):
            id_entry.delete(0, END)
            name_entry.delete(0, END)
            price_entry.delete(0, END)
            stock_entry.delete(0, END)
            id_entry.insert(0, values[0])
            name_entry.insert(0, values[1])
            stock_entry.insert(0, values[2])
            price_entry.insert(0, values[3])
        self.treeview_update(tree)
        
    ################################################################
    # Elimina todos los datos del treeview y lo carga nuevamente con los datos de la BBDD.
    ################################################################
    def treeview_update(self, tree):
        record = tree.get_children()
        for item in record:
            tree.delete(item)
        con = self.connect_database()
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
    def validate_number(self, number):
        pattern = r'^[0-9]+$'
        if re.match(pattern, number):
            return True
        else:
            return False

    ################################################################
    # Verifica que sea un número real, admite "coma" o "punto" como separador.
    ################################################################
    def validate_real_number(self, number):
        pattern = r'^\d+(\.\d+)?(,\d+)?$'
        if re.match(pattern, number):
            return True
        else:
            return False