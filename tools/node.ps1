# Project-local Windows Node/npm wrapper (PowerShell 5.1+).
param(
    [Parameter(Position=0, Mandatory=$true)]
    [ValidateSet('node','npm')][string]$Mode,
    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$ToolArgs
)
$ErrorActionPreference = 'Stop'
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $projectDir = Split-Path -Parent $PSScriptRoot
    $version = (Get-Content (Join-Path $PSScriptRoot 'node-version.txt') -Raw).Trim()
    $cpu = $env:PROCESSOR_ARCHITECTURE
    if ($env:PROCESSOR_ARCHITEW6432) { $cpu = $env:PROCESSOR_ARCHITEW6432 }
    switch ($cpu) {
        'AMD64' { $arch = 'x64' }
        'ARM64' { $arch = 'arm64' }
        default { throw 'Supported Windows processors: x64 and ARM64.' }
    }
    $name = "node-v$version-win-$arch"
    $cache = Join-Path $projectDir '.tools'
    $nodeHome = Join-Path $cache $name
    if (!(Test-Path (Join-Path $nodeHome 'node.exe'))) {
        New-Item -ItemType Directory -Force -Path $cache | Out-Null
        $lock = Join-Path $cache "$name.lock"
        if (Test-Path $lock) { throw "Another download may be running. Wait and retry; if interrupted, remove $lock" }
        New-Item -ItemType Directory -Path $lock -ErrorAction Stop | Out-Null
        $tempDir = Join-Path $cache ([Guid]::NewGuid().ToString())
        try {
            New-Item -ItemType Directory -Path $tempDir | Out-Null
            $file = "$name.zip"
            $archive = Join-Path $tempDir $file
            Write-Host "Downloading Node $version (Windows/$arch) for this project..."
            Invoke-WebRequest -UseBasicParsing -Uri "https://nodejs.org/dist/v$version/$file" -OutFile $archive
            $pattern = '^([a-fA-F0-9]{64})\s+' + [Regex]::Escape($file) + '$'
            $line = Get-Content (Join-Path $PSScriptRoot 'node-SHASUMS256.txt') | Where-Object { $_ -match $pattern } | Select-Object -First 1
            if (!$line) { throw 'No checksum for this platform.' }
            $expected = ($line -split '\s+')[0]
            if ((Get-FileHash $archive -Algorithm SHA256).Hash -ne $expected) { throw 'Node checksum mismatch. Retry.' }
            Expand-Archive -LiteralPath $archive -DestinationPath $tempDir
            Move-Item -LiteralPath (Join-Path $tempDir $name) -Destination $nodeHome
        } finally {
            if (Test-Path $tempDir) { Remove-Item -LiteralPath $tempDir -Recurse -Force }
            Remove-Item -LiteralPath $lock -Recurse -Force
        }
    }
    $env:PATH = "$nodeHome;" + $env:PATH
    $node = Join-Path $nodeHome 'node.exe'
    if ($Mode -eq 'npm') {
        & $node (Join-Path $nodeHome 'node_modules\npm\bin\npm-cli.js') @ToolArgs
    } else {
        & $node @ToolArgs
    }
    exit $LASTEXITCODE
} catch {
    [Console]::Error.WriteLine($_.Exception.Message)
    exit 1
}
