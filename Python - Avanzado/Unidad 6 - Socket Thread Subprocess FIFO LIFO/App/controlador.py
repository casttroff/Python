from tkinter import Tk
from vista import Ventana
import observador


################################################################
# Instancia de clase Controller.
################################################################
class Controller:
    def __init__(self, root):
        self.root_controller = root
        self.objeto_vista = Ventana(self.root_controller)
        self.observador_a = observador.ConcreteObserverA(self.objeto_vista.objeto_abmc)

################################################################
# Inicia la aplicación.
################################################################
if __name__ == "__main__":
    root_tk = Tk()
    Controller(root_tk)
    root_tk.mainloop()
    