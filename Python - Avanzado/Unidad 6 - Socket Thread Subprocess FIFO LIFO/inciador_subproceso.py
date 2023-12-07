import sys
import os
import subprocess
from pathlib import Path

global proceso
proceso = ""

dir = Path(__file__).resolve().parent
ruta = os.path.join(dir, "subproceso.py")

proceso = subprocess.Popen([sys.executable, ruta])
proceso.communicate()