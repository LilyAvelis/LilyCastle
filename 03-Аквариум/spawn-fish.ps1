[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet('trout', 'mackerel', 'perch', 'smelt', 'shark', 'sole')]
    [string]$Fish,

    [Parameter(Position = 1)]
    [string]$Path,

    [switch]$Force
)

$scriptRoot = Split-Path -Parent $PSCommandPath
$templateDir = Join-Path -Path $scriptRoot -ChildPath $Fish

if (-not (Test-Path -LiteralPath $templateDir -PathType Container)) {
    throw "Template for fish '$Fish' was not found at $templateDir"
}

$linkInventory = @()
try {
    $linkInventory = Get-ChildItem -LiteralPath $templateDir -Recurse -Force -ErrorAction Stop |
    Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
    ForEach-Object {
        $targetValue = $_.Target
        if (-not $targetValue -or ($targetValue -is [array] -and $targetValue.Count -eq 0)) {
            return
        }

        $targetText = if ($targetValue -is [array]) { ($targetValue -join '') } else { $targetValue }
        $rawRelative = $_.FullName.Substring($templateDir.Length)
        $relativePath = $rawRelative.TrimStart([char[]]@('\', '/'))

        [pscustomobject]@{
            RelativePath = $relativePath
            LinkType     = $_.LinkType
            Target       = $targetText
            IsDirectory  = $_.PSIsContainer
        }
    }
}
catch {
    Write-Verbose "Failed to enumerate reparse points for '$templateDir': $($_.Exception.Message)"
}

if (-not $Path) {
    $Path = $Fish
}

try {
    $targetDir = [System.IO.Path]::GetFullPath($Path)
}
catch {
    throw "Unable to resolve target path '$Path': $($_.Exception.Message)"
}

if (Test-Path -LiteralPath $targetDir) {
    if (-not (Test-Path -LiteralPath $targetDir -PathType Container)) {
        throw "Target '$targetDir' exists and is not a directory"
    }

    if (-not $Force) {
        throw "Target '$targetDir' already exists. Use -Force to overwrite."
    }

    Write-Verbose "Removing existing directory $targetDir"
    Remove-Item -LiteralPath $targetDir -Recurse -Force
}

Write-Verbose "Creating target directory $targetDir"
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

Write-Host "Spawning fish '$Fish' into '$targetDir'..." -ForegroundColor Cyan

$robocopyArgs = @(
    $templateDir,
    $targetDir,
    '/E',
    '/COPY:DAT',
    '/DCOPY:DAT',
    '/R:1',
    '/W:1',
    '/NFL',
    '/NDL',
    '/NJH',
    '/NJS',
    '/NP'
)

& robocopy @robocopyArgs | Out-Null
$exitCode = $LASTEXITCODE

# Robocopy returns codes < 8 for success conditions
if ($exitCode -ge 8) {
    throw "Robocopy failed with exit code $exitCode"
}

foreach ($link in $linkInventory) {
    if (-not $link.RelativePath) {
        continue
    }

    $destinationLinkPath = Join-Path -Path $targetDir -ChildPath $link.RelativePath
    $backupPath = $null

    if (Test-Path -LiteralPath $destinationLinkPath) {
        $guidSuffix = [Guid]::NewGuid().ToString('N')
        $backupPath = "$destinationLinkPath.spawnbackup.$guidSuffix"
        Move-Item -LiteralPath $destinationLinkPath -Destination $backupPath -Force
    }
    else {
        $parentDir = Split-Path -Parent $destinationLinkPath
        if ($parentDir -and -not (Test-Path -LiteralPath $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
        }
    }

    $itemType = if ($link.LinkType -eq 'Junction' -or $link.LinkType -eq 'MountPoint') { 'Junction' } else { 'SymbolicLink' }

    try {
        New-Item -ItemType $itemType -Path $destinationLinkPath -Target $link.Target | Out-Null
        if ($backupPath -and (Test-Path -LiteralPath $backupPath)) {
            Remove-Item -LiteralPath $backupPath -Recurse -Force
        }
        Write-Verbose "Restored $($link.RelativePath) as $itemType -> $($link.Target)"
    }
    catch {
        Write-Warning "Failed to recreate link at '$($link.RelativePath)': $($_.Exception.Message). Keeping copied content."
        if ($backupPath -and (Test-Path -LiteralPath $backupPath)) {
            Move-Item -LiteralPath $backupPath -Destination $destinationLinkPath -Force
        }
    }
}

Write-Host "Done!" -ForegroundColor Green
Write-Host "Next steps: cd '$targetDir' && npm run dev (or pnpm run dev)"