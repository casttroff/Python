import os
import sys
import binascii
import socket
import threading
import socketserver
from pathlib import Path
from datetime import datetime
from peewee import *

db = SqliteDatabase("productos.db")

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
except:
    print('Error en la BBDD.')


class MyUDPHandler(socketserver.BaseRequestHandler):
    info = ""
    msg = "Seleccione una opción valida"

    def handle(self):
        data = self.request[0].strip()
        client_socket = self.request[1]

        if isinstance(data, bytes):
            data = data.decode("utf-8")

        if data == '1':
            total = 0
            products = Product.select(Product.product_price).execute()
            for product in products:

                total += int(product.product_price)
            self.msg = str(total)

        self.msg = self.msg.encode("utf-8")

        client_socket.sendto(self.msg, self.client_address)


HOST, PORT = socket.gethostname(), 456

with socketserver.UDPServer((HOST, PORT), MyUDPHandler) as server:
    server.serve_forever()