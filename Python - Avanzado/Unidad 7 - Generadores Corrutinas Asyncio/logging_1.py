import logging

def main():
    logging.basicConfig(filename="app.log", level="DEBUG")

    host = "localhost"
    dominio = "argentina.com.ar"

    logging.debug(f"Este es un debug log de Host: {host} y Dominio: {dominio}")
    logging.info(f"Este es un info log de Host: {host} y Dominio: {dominio}")
    logging.warning(f"Este es un warning log de Host: {host} y Dominio: {dominio}")
    logging.error(f"Este es un error log de Host: {host} y Dominio: {dominio}")
    logging.critical(f"Este es un critical log de Host: {host} y Dominio: {dominio}")

main()
