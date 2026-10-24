Add-Type -AssemblyName System.Drawing
$iconsDir = Join-Path (Get-Location) "icons"
if (!(Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
}

function Generate-Icon([int]$size, [string]$path) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::Transparent)
    
    $orange = [System.Drawing.Color]::FromArgb(238, 77, 45)
    $brush = New-Object System.Drawing.SolidBrush $orange
    $g.FillEllipse($brush, 0, 0, $size - 1, $size - 1)
    
    $white = [System.Drawing.Color]::White
    $whiteBrush = New-Object System.Drawing.SolidBrush $white
    $m = [math]::Max(2, [int]($size * 0.2))
    $g.FillEllipse($whiteBrush, $m, $m, $size - 2 * $m, $size - 2 * $m)
    
    $dotBrush = New-Object System.Drawing.SolidBrush $orange
    $dm = [math]::Max(3, [int]($size * 0.36))
    $g.FillEllipse($dotBrush, $dm, $dm, $size - 2 * $dm, $size - 2 * $dm)
    
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Generate-Icon 16 (Join-Path $iconsDir "icon16.png")
Generate-Icon 48 (Join-Path $iconsDir "icon48.png")
Generate-Icon 128 (Join-Path $iconsDir "icon128.png")
Write-Host "Icons generated successfully!"
