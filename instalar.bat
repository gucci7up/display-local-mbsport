@echo off
echo ========================================
echo   MBSport Display Local - Instalador
echo ========================================
echo.

echo Creando carpetas...
if not exist "C:\ProgramData\MBSport\display" mkdir "C:\ProgramData\MBSport\display"
if not exist "C:\ProgramData\MBSport\videos" mkdir "C:\ProgramData\MBSport\videos"

echo Instalando display...
xcopy /E /Y /Q "%~dp0dist\*" "C:\ProgramData\MBSport\display\"

echo.
echo Verificando videos...
set count=0
for %%f in ("C:\ProgramData\MBSport\videos\*.mp4") do set /a count+=1

if "%count%"=="0" (
    echo AVISO: Copia tus videos .mp4 a: C:\ProgramData\MBSport\videos\
) else (
    echo %count% videos encontrados OK
)

echo.
echo Instalacion completada!
echo Display en: C:\ProgramData\MBSport\display\
echo Videos en:  C:\ProgramData\MBSport\videos\
echo.
pause
