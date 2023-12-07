import re
import sqlite3
from peewee import *
from tkinter.messagebox import *
from observador import Subject
import os
import time

db = SqliteDatabase("productos.db")
base_dir = os.path.dirname(os.path.abspath(__file__))
base_dir_logs = base_dir + '/logs/'
make_dir_logs = os.path.exists(base_dir_logs)

if not make_dir_logs:
    os.mkdir(base_dir_logs)

def decorator_alert(func):
    def inner(*args, **kwargs):
        with open(base_dir_logs + 'log.txt', 'a', encoding="utf-8") as f:
            f.write("En la función %s intervienen los parámetros: %s %s %s\n" %(func.__name__, args, kwargs, time.strftime('%x %X')))
        result = func(*args, **kwargs)
        return result
    return inner


class BaseModel(Model):
    class Meta:
        database = db


class Product(BaseModel):
    product_id = IntegerField(primary_key=True)
    product_name = CharField()
    product_quantity = IntegerField()
    product_price = FloatField()


#################################################################
# Conexión a la base de datos.
#################################################################
try:
    db.connect()
    db.create_tables([Product])
except:
    print('Error en la BBDD.')


################################################################
# Instancia de clase y creación de la primera tabla.
################################################################
class Abmc(Subject):
    def __init__(self, ):
        self.start = 'ABMC'

    def __str__(self) -> str:
        return super().__str__() + self.start


    ################################################################
    # Da formato de 1 digito despues de la coma a los float.
    ################################################################
    def format_float(self, value):
        formated_value = "{:.1f}".format(float(value))
        return str(formated_value)


    ################################################################
    # Agrega un producto.
    ################################################################
    @decorator_alert
    def add_product(self, name, price, stock, tree, END, id_entry, name_entry, price_entry, stock_entry):
        if self.validate_real_number(price) and self.validate_number(stock) and name != "":
            price_formated = self.format_float(price)
            product = Product()
            product.product_name = name
            product.product_quantity = stock
            product.product_price = price_formated
            product.save()

            self.complete_entries(id_entry, name_entry, price_entry, stock_entry, END, None, None, None, None)
            self.notificar(self, name, price, stock)
            
        else:
            showerror("Error", "Verifique los datos ingresados y vuelva a intentar.")

        self.treeview_update(tree)


    ################################################################
    # Elimina un producto.
    ################################################################
    @decorator_alert
    def delete_product(self, entry_id, tree, END, id_entry, name_entry, price_entry, stock_entry):
        if self.validate_number(entry_id):
            result = askokcancel("Aviso", "¿Desea eliminar este producto?")
            
            try:
                if result:
                    product_delete = Product.get(Product.product_id==entry_id)
                    product_delete.delete_instance()

            except Exception as ex:
                print(f"El id {entry_id} no existe.")

            finally:
                self.complete_entries(id_entry, name_entry, price_entry, stock_entry, END, None, None, None, None)
                self.notificar(self, entry_id, id_entry, name_entry, price_entry, stock_entry)

        else:
            showerror("Error", "El ID debe ser un número entero.")
        self.treeview_update(tree)


    ################################################################
    # Actualiza un producto.
    ################################################################
    @decorator_alert
    def update_product(self, product_id, name, price, stock, tree):
        if self.validate_number(product_id) and self.validate_number(stock) and self.validate_real_number(price) and name != "":
            price = self.format_float(price)
            product_update = Product.update(product_name=name, product_quantity=stock, product_price=price).where(Product.product_id==product_id)
            product_update.execute()

            self.treeview_update(tree)
            self.notificar(self, product_id, name, price, stock)

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
            self.complete_entries(id_entry, name_entry, price_entry, stock_entry, END,product_id, values[0], values[1], values[2])


    ################################################################
    # Busca un producto.
    ################################################################
    @decorator_alert
    def search_product(self, entry_id, product_name, tree, END, id_entry, name_entry, price_entry, stock_entry):
        if self.validate_number(entry_id):
            product = Product.select().where(Product.product_id==entry_id).first()
        elif product_name != "":
            #args = ('%' + product_name + '%',)
            product = Product.select().where(Product.product_name==product_name).first()
        else:
            showerror("Error", "Busque productos por Nombre o ID.")
            return self.treeview_update(tree)
        if product is not None:
            self.complete_entries(id_entry, name_entry, price_entry, stock_entry, END, product.product_id, product.product_name, product.product_quantity, product.product_price)
        else:
            self.complete_entries(id_entry, name_entry, price_entry, stock_entry, END, None, None, None, None)
        self.notificar(self, id_entry, name_entry, price_entry, stock_entry)

        self.treeview_update(tree)


    ################################################################
    # Elimina todos los datos del treeview y lo carga nuevamente con los datos de la BBDD.
    ################################################################
    def treeview_update(self, tree):
        record = tree.get_children()
        for item in record:
            tree.delete(item)

        for product in Product.select():
            tree.insert("", "end", text=product.product_id, values=(product.product_name, product.product_quantity, product.product_price))

        
    ################################################################
    # Completa los entry fields.
    ################################################################
    def complete_entries(self, id_entry, name_entry, price_entry, stock_entry, END, id=None, name=None, stock=None, price=None):
        if id is not None:
            id_entry.delete(0, END)
            name_entry.delete(0, END)
            price_entry.delete(0, END)
            stock_entry.delete(0, END)
            id_entry.insert(0, id)
            name_entry.insert(0, name)
            stock_entry.insert(0, stock)
            price_entry.insert(0, price)


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