import socket
import sys
import binascii

HOST, PORT = socket.gethostname(), 456

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

msg = input("Seleccione una opcion:\n1- Ver total de ventas\nOpción: ")

sock.sendto(msg.encode("UTF-8"), (HOST, PORT))
received = sock.recvfrom(1024)

if isinstance(received, tuple):
    received = received[0]
    if isinstance(received, bytes):
        received = received.decode("utf-8")

print("\nTotal de ventas: $", received)