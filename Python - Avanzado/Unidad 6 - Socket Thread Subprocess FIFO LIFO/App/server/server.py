import socket
import threading
import socketserver
from pathlib import Path
import os
import sys
import binascii
from datetime import datetime

global PORT

class MyUDPHandler(socketserver.BaseRequestHandler):
    def handle(self):
        print("Desde def handle")
        data = self.request[0].strip()
        client_socket = self.request[1]
        
        print("type of data from server.py", type(data))
        print("data:", data)
        print("type of socket from server.py", type(socket))
        print("socket: ", socket)

        #Hexa
        # binary_field = bytearray(data)
        # decoded_hex = binascii.hexlify(binary_field).decode("utf-8")
        # print("Viene como bytearray")
        # print("Valor recibido binascii.hexlify(binary_field).decode('utf-8'): {}".format(decoded_hex))
        # print("*" * 23)

        #String
        print("Viene como string")
        print("type of data from server.py", type(data))
        print("data:", data)
        print("decode", data.decode("UTF-8"))
        print("*" * 23)
        if not isinstance(data, bytes):
            client_socket.sendto(data.encode("UTF-8"), self.client_address)
        else:
            client_socket.sendto(data, self.client_address)


HOST, PORT = socket.gethostname(), 456
with socketserver.UDPServer((HOST, PORT), MyUDPHandler) as server:
    server.serve_forever()