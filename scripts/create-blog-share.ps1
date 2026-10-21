Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path $PSScriptRoot -Parent
$theme = Get-Content (Join-Path $projectRoot 'src/styles/theme.js') -Raw
$navy = [System.Drawing.ColorTranslator]::FromHtml(([regex]::Match($theme, "navy: '(#[0-9A-Fa-f]+)'")).Groups[1].Value)
$teal = [System.Drawing.ColorTranslator]::FromHtml(([regex]::Match($theme, "teal: '(#[0-9A-Fa-f]+)'")).Groups[1].Value)
$gold = [System.Drawing.ColorTranslator]::FromHtml(([regex]::Match($theme, "gold: '(#[0-9A-Fa-f]+)'")).Groups[1].Value)
$bitmap = New-Object System.Drawing.Bitmap(1200, 630)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$navyBrush = New-Object System.Drawing.SolidBrush($navy)
$tealBrush = New-Object System.Drawing.SolidBrush($teal)
$goldBrush = New-Object System.Drawing.SolidBrush($gold)
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$brandFont = New-Object System.Drawing.Font('Segoe UI', 64, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$titleFont = New-Object System.Drawing.Font('Segoe UI', 42, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$urlFont = New-Object System.Drawing.Font('Segoe UI', 25, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center

try {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.Color]::White)
  $graphics.FillRectangle($navyBrush, 0, 0, 1200, 152)
  $graphics.DrawString('REFOUNDIT', $brandFont, $whiteBrush, [System.Drawing.RectangleF]::new(80, 35, 1040, 90), $format)
  $graphics.FillRectangle($tealBrush, 542, 202, 116, 8)
  $caption = ([char[]]@(0x05DE,0x05D3,0x05E8,0x05D9,0x05DB,0x05D9,0x05DD,0x0020,0x05DC,0x05D4,0x05D7,0x05D6,0x05E8,0x05D9,0x0020,0x05DE,0x05E1,0x0020,0x05DC,0x05E9,0x05DB,0x05D9,0x05E8,0x05D9,0x05DD)) -join ''
  $format.FormatFlags = [System.Drawing.StringFormatFlags]::DirectionRightToLeft
  $graphics.DrawString($caption, $titleFont, $navyBrush, [System.Drawing.RectangleF]::new(70, 240, 1060, 120), $format)
  $format.FormatFlags = 0
  $graphics.FillRectangle($goldBrush, 120, 438, 960, 3)
  $graphics.DrawString('refound-it.com', $urlFont, $navyBrush, [System.Drawing.RectangleF]::new(80, 465, 1040, 70), $format)
  $destination = Join-Path $projectRoot 'public/images/blog-share.png'
  [System.IO.Directory]::CreateDirectory((Split-Path $destination -Parent)) | Out-Null
  $bitmap.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Output 'Generated public/images/blog-share.png (1200 x 630).'
} finally {
  $format.Dispose()
  $brandFont.Dispose()
  $titleFont.Dispose()
  $urlFont.Dispose()
  $navyBrush.Dispose()
  $tealBrush.Dispose()
  $goldBrush.Dispose()
  $whiteBrush.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}