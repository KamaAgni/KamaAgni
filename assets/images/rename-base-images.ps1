# Renames "Sex Position (N).jpg" to the same "NNN - Name.jpg" names used in "Sex Position Alt".
# 1) Put this file and positions.json (from KamaAgni-Positions-Alt.zip) in the SAME folder.
# 2) Open PowerShell in the folder that holds the images to rename (the base "Sex Position" folder).
# 3) Preview:  powershell -ExecutionPolicy Bypass -File .\rename-base-images.ps1 -Preview
#    Rename:   powershell -ExecutionPolicy Bypass -File .\rename-base-images.ps1
param([switch]$Preview, [string]$Map = "$PSScriptRoot\positions.json")
$items = Get-Content -Raw -Encoding UTF8 $Map | ConvertFrom-Json
$done = 0; $missing = @()
foreach ($p in $items) {
  $old = Join-Path (Get-Location) $p.old
  if (Test-Path -LiteralPath $old) {
    if ($Preview) { Write-Host "$($p.old)  ->  $($p.file)" }
    else { Rename-Item -LiteralPath $old -NewName $p.file }
    $done++
  } else { $missing += $p.old }
}
Write-Host ""
Write-Host "$done file(s) $(if($Preview){'would be renamed'}else{'renamed'})."
if ($missing.Count) { Write-Host "$($missing.Count) not found in this folder (skipped): $($missing -join ', ')" }
