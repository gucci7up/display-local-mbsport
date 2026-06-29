@echo off
echo ========================================
echo   MBSport Display Local - Instalador
echo ========================================
echo.

:: Crear carpetas si no existen
echo Creando carpetas...
if not exist "C:\ProgramData\MBSport\display" mkdir "C:\ProgramData\MBSport\display"
if not exist "C:\ProgramData\MBSport\videos" mkdir "C:\ProgramData\MBSport\videos"

:: Copiar archivos del build
echo Copiando archivos del display...
xcopy /E /Y /Q "dist\*" "C:\ProgramData\MBSport\display\"

:: Verificar videos
echo.
echo Verificando videos...
set /a count=0
for %%f in ("C:\ProgramData\MBSport\videos\*.mp4") do set /a count+=1

if %count%==0 (
    echo ADVERTENCIA: No se encontraron videos en C:\ProgramData\MBSport\videos\
    echo Copia los videos .mp4 a esa carpeta antes de usar el display.
) else (
    echo %count% videos encontrados OK
)

echo.
echo ========================================
echo   Instalacion completada!
echo ========================================
echo.
echo Display instalado en: C:\ProgramData\MBSport\display\
echo Videos esperados en:  C:\ProgramData\MBSport\videos\
echo.
pause
