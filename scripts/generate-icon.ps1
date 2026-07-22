Add-Type -AssemblyName System.Drawing

# Create 256x256 bitmap
$bmp = New-Object System.Drawing.Bitmap 256, 256
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Background: rounded purple
$bgColor = [System.Drawing.Color]::FromArgb(255, 124, 92, 219)
$bgBrush = New-Object System.Drawing.SolidBrush $bgColor
$g.FillRectangle($bgBrush, 0, 0, 256, 256)

# Soft inner rings
for ($i = 0; $i -lt 30; $i++) {
    $alpha = 255 - ($i * 6)
    if ($alpha -lt 0) { $alpha = 0 }
    $penColor = [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255)
    $pen = New-Object System.Drawing.Pen $penColor, 1
    $g.DrawEllipse($pen, $i, $i, 256 - ($i * 2), 256 - ($i * 2))
}

# Paw print: 4 toes + 1 main pad
$pawColor = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
$pawBrush = New-Object System.Drawing.SolidBrush $pawColor

# Main pad
$g.FillEllipse($pawBrush, 88, 140, 80, 70)

# Four toes
$g.FillEllipse($pawBrush, 60, 90, 35, 45)
$g.FillEllipse($pawBrush, 95, 70, 35, 50)
$g.FillEllipse($pawBrush, 130, 70, 35, 50)
$g.FillEllipse($pawBrush, 165, 90, 35, 45)

$g.Dispose()

# Save PNG
$pngPath = Join-Path $args[0] "icon.png"
$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# Build a single-image ICO from the PNG (256x256, PNG-encoded payload)
$pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
$icoPath = Join-Path $args[0] "icon.ico"

$header = New-Object byte[] 6
$header[0] = 0
$header[1] = 0
$header[2] = 1
$header[3] = 0
$header[4] = 1
$header[5] = 0

$entry = New-Object byte[] 16
$entry[0] = 0
$entry[1] = 0
$entry[2] = 0
$entry[3] = 0
$entry[4] = 1
$entry[5] = 0
$entry[6] = 32
$entry[7] = 0
$size = $pngBytes.Length
$entry[8] = $size -band 0xFF
$entry[9] = ($size -shr 8) -band 0xFF
$entry[10] = ($size -shr 16) -band 0xFF
$entry[11] = ($size -shr 24) -band 0xFF
$entry[12] = 22
$entry[13] = 0
$entry[14] = 0
$entry[15] = 0

$ico = New-Object System.IO.MemoryStream
$ico.Write($header, 0, 6)
$ico.Write($entry, 0, 16)
$ico.Write($pngBytes, 0, $pngBytes.Length)
[System.IO.File]::WriteAllBytes($icoPath, $ico.ToArray())
$ico.Dispose()

Write-Host "PNG: $pngPath"
Write-Host "ICO: $icoPath"
Write-Host "PNG size: $($pngBytes.Length) bytes"
