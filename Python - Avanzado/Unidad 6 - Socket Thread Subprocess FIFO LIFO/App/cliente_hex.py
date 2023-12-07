import socket
import sys
import binascii

HOST, PORT = "192.168.100.14", 456
data = " ".join(sys.argv[1:])
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

msg = 0x00003EF5
print(type(msg))
packed_data = bytearray()
packed_data += msg.to_bytes(4, "big")
msg = packed_data

sock.sendto(msg, (HOST, PORT))
received = sock.recvfrom(1024)

print("Received: ", received)