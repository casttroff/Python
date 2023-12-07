from tkinter import StringVar  
from tkinter import DoubleVar 
from tkinter import Label
from tkinter import Entry
from tkinter import ttk
from tkinter import Button
from tkinter import Frame
from tkinter import BOTH
from tkinter import SOLID
from tkinter import CENTER
from tkinter import VERTICAL
from tkinter import END
from tkinter.messagebox import *
from modelo import Abmc


################################################################
# Instancia de clase e inicia la vista de la ventana.
################################################################
class Ventana:
    def __init__(self, window):
        self.root = window
        self.objeto_abmc = Abmc()
        self.root.title("SM")
        self.name_var = StringVar()
        self.price_var = StringVar()
        self.stock_var = StringVar()
        self.id_var = StringVar()

        ################################################################
        # Frame root.
        ################################################################
        self.frame_root = Frame(self.root, borderwidth=1, relief=SOLID)
        self.frame_root.pack(padx=10, pady=10)

        ################################################################
        # Label de frame root.
        ################################################################
        self.title_label = Label(self.frame_root, text="Stock manager", padx=10, pady=10)
        self.title_label.place(y=0)

        ################################################################
        # Frame contenedor de grilla.
        ################################################################
        self.product_grid_frame = ttk.Frame(self.frame_root, borderwidth=1, relief=SOLID)
        self.product_grid_frame.grid(row=0, column=0, columnspan=2, padx=10, pady=40)

        ################################################################
        # Crea una grilla para mostrar los datos.
        ################################################################
        self.tree= ttk.Treeview(self.product_grid_frame, columns=("name", "stock", "price"))

        self.tree.column("#0", width=50)
        self.tree.column("name", width=300)
        self.tree.column("stock", width=100)
        self.tree.column("price", width=100)

        self.tree.heading("#0", text="ID", anchor=CENTER)
        self.tree.heading("name", text="Nombre", anchor=CENTER)
        self.tree.heading("stock", text="En stock", anchor=CENTER)
        self.tree.heading("price", text="Precio", anchor=CENTER)
        self.tree.pack(fill=BOTH, expand=True)

        ################################################################
        # Crea el scrollbar vertical.
        ################################################################
        self.scrollbar = ttk.Scrollbar(self.product_grid_frame, orient=VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=self.scrollbar.set)

        ################################################################
        # Ubica la grilla y el scrollbar en el frame.
        ################################################################
        self.tree.grid(row=0, column=0, sticky="nsew")
        self.scrollbar.grid(row=0, column=1, sticky="ns")

        ################################################################
        # Frame contenedor de inputs y botones.
        ################################################################
        self.input_frame = ttk.Frame(self.frame_root, width=20, borderwidth=1, relief=SOLID)
        self.input_frame.grid(row=1, column=0, padx=10, pady=10, sticky="w")

        ################################################################
        # Objetos de input_frame.
        ################################################################
        self.name_label = Label(self.input_frame, text="Nombre", width=10)
        self.name_label.grid(row=0, column=0, sticky="w")

        self.price_label = Label(self.input_frame, text="Precio", width=10)
        self.price_label.grid(row=1, column=0, sticky="w")

        self.stock_label = Label(self.input_frame, text="En stock (n°)", width=10)
        self.stock_label.grid(row=2, column=0, sticky="w")

        self.id_label = Label(self.input_frame, text="ID", width=10)
        self.id_label.grid(row=3, column=0, sticky="w")

        self.name_entry = ttk.Entry(self.input_frame, width=40, textvariable=self.name_var)
        self.name_entry.grid(row=0, column=1, columnspan=3, padx=5, pady=5, sticky="w")

        self.price_entry = ttk.Entry(self.input_frame, width=40, textvariable=self.price_var)
        self.price_entry.grid(row=1, column=1, columnspan=3, padx=5, pady=5, sticky="w")

        self.stock_entry = ttk.Entry(self.input_frame, width=40, textvariable=self.stock_var)
        self.stock_entry.grid(row=2, column=1, columnspan=3, padx=5, pady=5, sticky="w")

        self.id_entry = ttk.Entry(self.input_frame, width=10, textvariable=self.id_var)
        self.id_entry.grid(row=3, column=1, columnspan=3, padx=5, pady=5, sticky="w")

        self.entries = [self.id_entry, self.name_entry, self.price_entry, self.stock_entry]

        self.add_button = ttk.Button(self.input_frame, text="Agregar", command=lambda tree=self.tree, tk=END, id_entry=self.id_entry, name_entry=self.name_entry, price_entry=self.price_entry, stock_entry=self.stock_entry: self.objeto_abmc.add_product(self.name_var.get(), self.price_var.get(), self.stock_var.get(), tree, END, id_entry, name_entry, price_entry, stock_entry), width=10)
        self.add_button.grid(row=4, column=0, padx=5, pady=5)

        self.delete_button = ttk.Button(self.input_frame, text="Eliminar", command=lambda tree=self.tree, tk=END, id_entry=self.id_entry, name_entry=self.name_entry, price_entry=self.price_entry, stock_entry=self.stock_entry: self.objeto_abmc.delete_product(self.id_var.get(), tree, END, id_entry, name_entry, price_entry, stock_entry), width=10)
        self.delete_button.grid(row=4, column=1, padx=5, pady=5)

        self.update_button = ttk.Button(self.input_frame, text="Actualizar", command=lambda tree=self.tree, tk=END, id_entry=self.id_entry, name_entry=self.name_entry, price_entry=self.price_entry, stock_entry=self.stock_entry: self.objeto_abmc.update_product(self.id_var.get(), self.name_var.get(), self.price_var.get(), self.stock_var.get(), tree), width=10)
        self.update_button.grid(row=4, column=2, padx=5, pady=5)

        self.search = ttk.Button(self.input_frame, text="Buscar", command=lambda tree=self.tree, tk=END, id_entry=self.id_entry, name_entry=self.name_entry, price_entry=self.price_entry, stock_entry=self.stock_entry: self.objeto_abmc.search_product(self.id_var.get(), self.name_var.get(), self.tree, END, id_entry, name_entry, price_entry, stock_entry), width=10)
        self.search.grid(row=4, column=3, padx=5, pady=5)

        ################################################################
        # Configura el evento de selección de un ítem en la grilla.
        ################################################################
        self.tree.bind("<<TreeviewSelect>>", lambda event, tree=self.tree, tk=END, id_entry=self.id_entry, name_entry=self.name_entry, price_entry=self.price_entry, stock_entry=self.stock_entry: self.objeto_abmc.select_product(event, tree, END, id_entry, name_entry, price_entry, stock_entry))