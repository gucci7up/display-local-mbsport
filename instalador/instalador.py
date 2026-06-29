import tkinter as tk
from PIL import Image, ImageTk, ImageEnhance
import threading, os, shutil, time, urllib.request

DISPLAY_SRC  = os.path.join(os.path.dirname(__file__), "..", "dist")
DISPLAY_DEST = r"C:\ProgramData\MBSport\display"
VIDEOS_DEST  = r"C:\ProgramData\MBSport\videos"
CDN_URL      = "https://cdn.mbsport.lat/videos/"
TOTAL_VIDEOS = 843

WIN_W, WIN_H = 860, 520
GOLD  = "#f5c518"
WHITE = "#ffffff"
GRAY  = "#888888"
GREEN = "#00e676"
DARK  = "#0d0d0d"

STEPS = [
    "Creando carpetas",
    "Copiando display",
    "Descargando videos",
    "Guardando configuración",
    "Instalación completada",
]

DIR = os.path.dirname(__file__)

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("MBSport Racing Dogs · Instalador")
        self.geometry(f"{WIN_W}x{WIN_H}+{(self.winfo_screenwidth()-WIN_W)//2}+{(self.winfo_screenheight()-WIN_H)//2}")
        self.resizable(False, False)
        self.configure(bg=DARK)

        self.cv = tk.Canvas(self, width=WIN_W, height=WIN_H, highlightthickness=0, bg=DARK)
        self.cv.pack(fill="both", expand=True)

        self._load_bg()
        self._draw_ui()

    def _load_bg(self):
        try:
            img = Image.open(os.path.join(DIR, "fondo-instalador.png")).resize((WIN_W, WIN_H), Image.LANCZOS)
            img = ImageEnhance.Brightness(img).enhance(0.30)
            self._bg = ImageTk.PhotoImage(img)
            self.cv.create_image(0, 0, anchor="nw", image=self._bg)
        except: pass

    def _draw_ui(self):
        cv = self.cv

        # Header
        cv.create_rectangle(0, 0, WIN_W, 76, fill="#0d0d0d", outline="")
        cv.create_line(0, 76, WIN_W, 76, fill=GOLD, width=2)

        try:
            logo = Image.open(os.path.join(DIR, "logo (750 x 320 px).png")).resize((160, 68), Image.LANCZOS)
            self._logo = ImageTk.PhotoImage(logo)
            cv.create_image(16, 4, anchor="nw", image=self._logo)
        except:
            cv.create_text(20, 38, text="MBSport", font=("Impact",22), fill=GOLD, anchor="w")

        cv.create_text(WIN_W-20, 30, text="INSTALADOR DE VIDEOS",
                       font=("Impact", 14), fill=GOLD, anchor="e")
        cv.create_text(WIN_W-20, 52, text="Racing Dogs · Sistema Profesional",
                       font=("Arial", 9), fill=GRAY, anchor="e")

        # Divisor vertical
        cv.create_line(270, 78, 270, WIN_H-36, fill="#222222", width=1)

        # Panel izquierdo pasos
        cv.create_text(20, 96, text="PROCESO DE INSTALACIÓN",
                       font=("Impact", 11), fill=GOLD, anchor="nw")

        self._step_circles = []
        self._step_txts    = []
        sy, gap = 118, 62
        for i, label in enumerate(STEPS):
            y = sy + i * gap
            c = cv.create_oval(18, y, 42, y+24, outline=GRAY, width=1.5, fill="#0d0d0d")
            n = cv.create_text(30, y+12, text=str(i+1), font=("Arial",8,"bold"), fill=GRAY)
            t = cv.create_text(52, y+12, text=label.upper(), font=("Impact",10), fill=GRAY, anchor="w")
            self._step_circles.append((c, n))
            self._step_txts.append(t)
            if i < len(STEPS)-1:
                cv.create_line(30, y+24, 30, y+gap, fill="#252525", width=1, dash=(2,4))

        # Panel derecho progreso
        cv.create_text(295, 88, text="PROGRESO DE INSTALACIÓN",
                       font=("Arial", 9, "bold"), fill=GOLD, anchor="nw")

        self.txt_pct = cv.create_text(295, 88, text="0%",
                                      font=("Impact", 80), fill=GOLD, anchor="nw")
        self.txt_status = cv.create_text(295, 210, text="Esperando instalación...",
                                         font=("Arial", 11, "bold"), fill=WHITE, anchor="nw")
        self.txt_sub = cv.create_text(295, 232, text="",
                                      font=("Arial", 8), fill=GRAY, anchor="nw")

        # Barra
        cv.create_rectangle(295, 255, 845, 267, fill="#1e1e1e", outline="#333", width=1)
        self.bar = cv.create_rectangle(296, 256, 296, 266, fill=GOLD, outline="")

        # Chips
        self._draw_chip(cv, 295, 278, "FORMATO", "MP4")
        self.chip_spd = self._chip_val(cv, 430, 278, "VELOCIDAD", "—")
        self.chip_fld = self._chip_val(cv, 565, 278, "VIDEOS",    "—")

        # Botón
        self.btn = tk.Button(self, text="INSTALAR AHORA",
                             font=("Arial", 12, "bold"),
                             bg=GOLD, fg="#000", relief="flat",
                             padx=26, pady=10, cursor="hand2",
                             activebackground="#e0a800",
                             command=self.iniciar)
        cv.create_window(700, 440, window=self.btn)

        # Footer
        cv.create_rectangle(0, WIN_H-36, WIN_W, WIN_H, fill="#080808", outline="")
        cv.create_line(0, WIN_H-36, WIN_W, WIN_H-36, fill=GOLD, width=1)
        cv.create_rectangle(12, WIN_H-28, 440, WIN_H-8, fill="#1a1000", outline="#333")
        cv.create_text(20, WIN_H-18, text="⚠  No cierre este programa durante la instalación",
                       font=("Arial", 9, "bold"), fill=GOLD, anchor="w")
        cv.create_text(WIN_W-16, WIN_H-18, text="© MBSport Racing Dogs · v1.0",
                       font=("Arial", 8), fill="#444", anchor="e")

    def _draw_chip(self, cv, x, y, label, value):
        cv.create_rectangle(x, y, x+120, y+40, fill="#111111", outline="#2a2a2a")
        cv.create_text(x+8, y+8,  text=label, font=("Arial",7), fill=GRAY, anchor="nw")
        cv.create_text(x+8, y+22, text=value, font=("Arial",10,"bold"), fill=GOLD, anchor="nw")

    def _chip_val(self, cv, x, y, label, value):
        cv.create_rectangle(x, y, x+120, y+40, fill="#111111", outline="#2a2a2a")
        cv.create_text(x+8, y+8,  text=label, font=("Arial",7), fill=GRAY, anchor="nw")
        t = cv.create_text(x+8, y+22, text=value, font=("Arial",10,"bold"), fill=GOLD, anchor="nw")
        return t

    def set_step(self, idx, state):
        c, n = self._step_circles[idx]
        t = self._step_txts[idx]
        if state == "done":
            self.cv.itemconfig(c, outline=GOLD, fill="#1a1400")
            self.cv.itemconfig(n, text="✓", fill=GOLD, font=("Arial",10,"bold"))
            self.cv.itemconfig(t, fill=GOLD, font=("Impact",10))
        elif state == "active":
            self.cv.itemconfig(c, outline=WHITE, fill="#1e1e1e")
            self.cv.itemconfig(n, text="▶", fill=WHITE, font=("Arial",7))
            self.cv.itemconfig(t, fill=WHITE, font=("Impact",10))
        else:
            self.cv.itemconfig(c, outline=GRAY, fill="#0d0d0d")
            self.cv.itemconfig(n, text=str(idx+1), fill=GRAY, font=("Arial",8,"bold"))
            self.cv.itemconfig(t, fill=GRAY, font=("Impact",10))

    def update_progress(self, pct, status, sub="", speed="", videos=""):
        color = GREEN if pct == 100 else GOLD
        self.cv.itemconfig(self.txt_pct,    text=f"{int(pct)}%", fill=color)
        self.cv.itemconfig(self.txt_status, text=status, fill=GREEN if pct==100 else WHITE)
        self.cv.itemconfig(self.txt_sub,    text=sub)
        if speed:  self.cv.itemconfig(self.chip_spd, text=speed)
        if videos: self.cv.itemconfig(self.chip_fld, text=videos)
        bw = int((pct/100)*(843-296))
        self.cv.coords(self.bar, 296, 256, 296+bw, 266)
        self.update_idletasks()

    def iniciar(self):
        self.btn.config(state="disabled", text="INSTALANDO...")
        threading.Thread(target=self._run, daemon=True).start()

    def _run(self):
        try:
            # Paso 1
            self.set_step(0,"active")
            self.update_progress(5,"Creando carpetas...","Preparando el sistema...")
            os.makedirs(DISPLAY_DEST, exist_ok=True)
            os.makedirs(VIDEOS_DEST,  exist_ok=True)
            time.sleep(0.4); self.set_step(0,"done")

            # Paso 2
            self.set_step(1,"active")
            files = [os.path.join(r,f) for r,_,fs in os.walk(DISPLAY_SRC) for f in fs]
            total = len(files); t0=time.time(); tb=0
            for i,src in enumerate(files,1):
                rel=os.path.relpath(src,DISPLAY_SRC)
                dst=os.path.join(DISPLAY_DEST,rel)
                os.makedirs(os.path.dirname(dst),exist_ok=True)
                shutil.copy2(src,dst); tb+=os.path.getsize(dst)
                el=time.time()-t0 or 0.001
                self.update_progress(10+(i/total)*35,
                    f"Instalando componentes {i} de {total}",
                    "", f"{(tb/1024/1024)/el:.1f} MB/s", "")
            self.set_step(1,"done")

            # Paso 3
            self.set_step(2,"active")
            self.update_progress(50,"Verificando videos...","Comprobando instalación","","")
            os.makedirs(VIDEOS_DEST, exist_ok=True)
            existentes = {f for f in os.listdir(VIDEOS_DEST) if f.endswith(".mp4")}
            faltantes  = [f"{i}.mp4" for i in range(1, TOTAL_VIDEOS+1) if f"{i}.mp4" not in existentes]

            if faltantes:
                t0=time.time(); descargados=0; bytes_total=0
                for i, nombre in enumerate(faltantes, 1):
                    try:
                        urllib.request.urlretrieve(CDN_URL+nombre, os.path.join(VIDEOS_DEST, nombre))
                        bytes_total += os.path.getsize(os.path.join(VIDEOS_DEST, nombre))
                        descargados += 1
                        el = time.time()-t0 or 0.001
                        speed = f"{(bytes_total/1024/1024)/el:.1f} MB/s"
                        pct = 50 + (i/len(faltantes))*40
                        self.update_progress(pct,
                            f"Descargando video {descargados} de {len(faltantes)}",
                            f"{bytes_total/(1024**3):.2f} GB descargados",
                            speed, f"{descargados}/{TOTAL_VIDEOS}")
                    except: pass
            else:
                self.update_progress(90,"Videos verificados","Todos los videos están instalados","","")
                time.sleep(0.3)

            vids = [f for f in os.listdir(VIDEOS_DEST) if f.endswith(".mp4")]
            gb   = sum(os.path.getsize(os.path.join(VIDEOS_DEST,v)) for v in vids)/(1024**3) if vids else 0
            self.set_step(2,"done")

            # Paso 4
            self.set_step(3,"active")
            self.update_progress(95,"Guardando configuración...","","","")
            time.sleep(0.4); self.set_step(3,"done")

            # Paso 5
            self.set_step(4,"active"); time.sleep(0.3)
            self.update_progress(100,"¡Instalación completada!",
                                 f"{len(vids)} videos · {gb:.1f} GB")
            self.set_step(4,"done")
            self.btn.config(state="normal", text="  CERRAR  ",
                           bg="#00c853", fg=WHITE, activebackground="#00a846",
                           command=self.destroy)

        except Exception as e:
            self.update_progress(0,f"Error: {str(e)}")
            self.btn.config(state="normal",text="REINTENTAR",command=self.iniciar)

if __name__ == "__main__":
    App().mainloop()
