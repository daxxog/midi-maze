echo off
cls
color 0e

mkdir js
cd js
del *.min.js

"C:\Program Files (x86)\Adobe\Adobe Creative Cloud Experience\libs\node" ..\getlibs.js
py getlibs.py
del getlibs.py

pause