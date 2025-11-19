# runserver.ps1
 = 5500
 = "./"
 = "0.0.0.0"

Write-Host "Starting Python HTTP server on port  ..."
python3 -m http.server  --directory  --bind 

