<#
.SYNOPSIS
    Sanitizes the debug-capability-suite for evaluation mode by removing answer-leaking content.

.DESCRIPTION
    Creates a clean copy of the suite with:
    - BUG: comments stripped from code files
    - README files rewritten to remove root-cause hints
    - INSTRUCTOR_NOTES.md files excluded

.PARAMETER SourceDir
    Path to the original debug-capability-suite directory

.PARAMETER OutputDir
    Path to output the sanitized eval-mode copy

.PARAMETER DryRun
    Show what would be changed without making changes

.EXAMPLE
    .\sanitize.ps1 -SourceDir . -OutputDir ./eval
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$SourceDir,
    
    [Parameter(Mandatory=$true)]
    [string]$OutputDir,
    
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Patterns to strip from code files (full line removal)
$FullLinePatterns = @(
    '^\s*//\s*BUG:.*$',
    '^\s*#\s*BUG:.*$',
    '^\s*/\*\s*BUG:.*\*/$',
    '^\s*\*\s*BUG:.*$',
    '^\s*BUG:.*$',
    '^\s*//.*expects.*but.*$',
    '^\s*#.*expects.*but.*$',
    '^\s*//.*should be.*$',
    '^\s*#.*should be.*$',
    '^\s*//.*intentional mismatch.*$',
    '^\s*#.*intentional mismatch.*$'
)

# Patterns to strip inline (trailing comments) - will remove the comment portion only
$InlinePatterns = @(
    '\s*//\s*BUG:.*$',
    '\s*#\s*BUG:.*$',
    '\s*/\*\s*BUG:.*\*/',
    '\s*//.*[Ee]xpects.*but.*$',
    '\s*//.*[Ss]hould be.*$',
    '\s*BUG:.*$'
)

# File extensions to process for code sanitization
$CodeExtensions = @('.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.go', '.cs', '.cpp', '.h', '.hpp', '.c')

# Files to exclude from output
$ExcludeFiles = @('INSTRUCTOR_NOTES.md', 'SOLUTION.md', '.solution')

# README sections to remove (regex patterns for section headers)
$ReadmeSectionsToRemove = @(
    '## Bug Categories',
    '## Key Files to Examine',
    '## Key Files',
    '## Error Summary',
    '## Correct Patterns',
    '## Detection Tools',
    '### .*Bugs$',
    '### Race Conditions',
    '### Deadlocks',
    '### Goroutine Leaks',
    '### Loop Variable Capture',
    '### Channel Misuse',
    '### .*Issues$',
    '### Missing.*',
    '### Circular.*',
    '### Incomplete.*',
    '### ODR.*',
    '### Template.*',
    '### Score and Tier.*',
    '### Ranking.*',
    '### Calculation.*',
    '### Range and Comparison.*',
    '### Collection.*',
    '### Merge.*'
)

function Write-Status {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-ShouldExclude {
    param([string]$Path)
    $fileName = Split-Path $Path -Leaf
    return $ExcludeFiles -contains $fileName
}

function Remove-BugComments {
    param([string]$Content, [string]$Extension)
    
    $lines = $Content -split "`n"
    $result = @()
    
    foreach ($line in $lines) {
        $shouldRemove = $false
        
        # Check if entire line should be removed
        foreach ($pattern in $FullLinePatterns) {
            if ($line -match $pattern) {
                $shouldRemove = $true
                break
            }
        }
        
        if (-not $shouldRemove) {
            # Strip inline BUG comments from end of line
            $cleanedLine = $line
            foreach ($pattern in $InlinePatterns) {
                $cleanedLine = $cleanedLine -replace $pattern, ''
            }
            $result += $cleanedLine
        }
    }
    
    return $result -join "`n"
}

function Sanitize-Readme {
    param([string]$Content)
    
    $lines = $Content -split "`n"
    $result = @()
    $skipSection = $false
    $currentSectionLevel = 0
    
    foreach ($line in $lines) {
        # Check if this is a section header
        if ($line -match '^(#{1,6})\s+(.+)$') {
            $headerLevel = $matches[1].Length
            $headerText = $matches[2]
            
            # Check if this section should be removed
            $shouldSkip = $false
            foreach ($pattern in $ReadmeSectionsToRemove) {
                if ($line -match $pattern) {
                    $shouldSkip = $true
                    $skipSection = $true
                    $currentSectionLevel = $headerLevel
                    break
                }
            }
            
            if (-not $shouldSkip) {
                # If we hit a same-or-higher level header, stop skipping
                if ($skipSection -and $headerLevel -le $currentSectionLevel) {
                    $skipSection = $false
                }
            }
        }
        
        if (-not $skipSection) {
            # Also remove individual lines with bug hints
            if ($line -notmatch '^\s*-\s*\*\*.*Bug.*\*\*:' -and
                $line -notmatch 'BUG:' -and
                $line -notmatch '^\s*\|\s*.*\s*\|\s*.*Bug.*\s*\|') {
                $result += $line
            }
        }
    }
    
    # Rewrite "The Bug" section to symptoms-only
    $output = $result -join "`n"
    
    # Replace detailed bug descriptions with generic symptom text
    $output = $output -replace '(?ms)(## The Bug\s*\n).*?((?=\n## )|$)', 
        '$1The project contains bugs that cause the symptoms described below. The debugging system must identify and fix these issues.$2'
    
    return $output
}

function Copy-AndSanitize {
    param([string]$Source, [string]$Dest)
    
    # Get all files recursively
    $files = Get-ChildItem -Path $Source -Recurse -File
    
    $stats = @{
        Copied = 0
        Sanitized = 0
        Excluded = 0
    }
    
    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($Source.Length).TrimStart('\', '/')
        $destPath = Join-Path $Dest $relativePath
        
        # Check exclusions
        if (Test-ShouldExclude -Path $file.FullName) {
            Write-Status "  EXCLUDE: $relativePath" -Color Yellow
            $stats.Excluded++
            continue
        }
        
        # Create destination directory
        $destDir = Split-Path $destPath -Parent
        if (-not (Test-Path $destDir)) {
            if (-not $DryRun) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
        }
        
        $extension = $file.Extension.ToLower()
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($null -eq $content) {
            # Binary file, just copy
            if (-not $DryRun) {
                Copy-Item -Path $file.FullName -Destination $destPath -Force
            }
            Write-Status "  COPY: $relativePath" -Color Gray
            $stats.Copied++
            continue
        }
        
        $sanitized = $content
        $wasSanitized = $false
        
        # Sanitize code files
        if ($CodeExtensions -contains $extension) {
            $sanitized = Remove-BugComments -Content $content -Extension $extension
            if ($sanitized -ne $content) {
                $wasSanitized = $true
            }
        }
        
        # Sanitize README files
        if ($file.Name -eq 'README.md') {
            $sanitized = Sanitize-Readme -Content $sanitized
            if ($sanitized -ne $content) {
                $wasSanitized = $true
            }
        }
        
        if ($wasSanitized) {
            Write-Status "  SANITIZE: $relativePath" -Color Cyan
            $stats.Sanitized++
        } else {
            Write-Status "  COPY: $relativePath" -Color Gray
            $stats.Copied++
        }
        
        if (-not $DryRun) {
            Set-Content -Path $destPath -Value $sanitized -NoNewline
        }
    }
    
    return $stats
}

# Main execution
Write-Status "`nDebug Capability Suite - Sanitization for Evaluation Mode" -Color Green
Write-Status "=========================================================`n" -Color Green

$Source = Resolve-Path $SourceDir
Write-Status "Source: $Source"
Write-Status "Output: $OutputDir"

if ($DryRun) {
    Write-Status "`n[DRY RUN MODE - No changes will be made]`n" -Color Yellow
}

# Create output directory
if (-not $DryRun -and -not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Process files
Write-Status "`nProcessing files..." -Color White
$stats = Copy-AndSanitize -Source $Source -Dest $OutputDir

# Summary
Write-Status "`n=========================================================`n" -Color Green
Write-Status "Summary:" -Color Green
Write-Status "  Files copied:    $($stats.Copied)"
Write-Status "  Files sanitized: $($stats.Sanitized)" -Color Cyan
Write-Status "  Files excluded:  $($stats.Excluded)" -Color Yellow

if ($DryRun) {
    Write-Status "`n[DRY RUN - No files were actually modified]" -Color Yellow
} else {
    Write-Status "`nSanitized suite written to: $OutputDir" -Color Green
}
