import socket
import sys
import binascii

HOST, PORT = "192.168.100.14", 456
data = " ".join(sys.argv[1:])
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

msg = "Hola mundo!"

sock.sendto(msg.encode("UTF-8"), (HOST, PORT))
received = sock.recvfrom(1024)

print("Received: ",received)