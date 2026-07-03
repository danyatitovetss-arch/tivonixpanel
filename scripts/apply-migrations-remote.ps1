Add-Type @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public class WinCred {
  [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
  public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public struct Credential {
    public int Flags; public int Type; public IntPtr TargetName; public IntPtr Comment;
    public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten; public int CredentialBlobSize;
    public IntPtr CredentialBlob; public int Persist; public int AttributeCount; public IntPtr Attributes; public IntPtr TargetAlias; public IntPtr UserName;
  }
  public static string ReadSupabaseToken() {
    IntPtr nCredPtr;
    if (!CredRead("Supabase CLI:supabase", 1, 0, out nCredPtr)) return null;
    var cred = (Credential)Marshal.PtrToStructure(nCredPtr, typeof(Credential));
    var bytes = new byte[cred.CredentialBlobSize];
    Marshal.Copy(cred.CredentialBlob, bytes, 0, cred.CredentialBlobSize);
    Marshal.FreeCoTaskMem(nCredPtr);
    if (cred.CredentialBlobSize == 0) return null;
    if (bytes.Length >= 2 && bytes[1] == 0) return Encoding.Unicode.GetString(bytes).TrimEnd('\0');
    return Encoding.UTF8.GetString(bytes).TrimEnd('\0');
  }
}
'@

$token = [WinCred]::ReadSupabaseToken()
if (-not $token) { Write-Error "Token not found"; exit 1 }

$ref = "codwkylxpjlinutohflx"
$migrationsFile = Join-Path $PSScriptRoot "..\supabase\apply_all_migrations.sql"
$sql = Get-Content $migrationsFile -Raw -Encoding UTF8
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

Write-Host "Testing Management API..."
try {
  Invoke-RestMethod -Method Post -Uri "https://api.supabase.com/v1/projects/$ref/database/query" -Headers $headers -Body (@{ query = "select 1 as ok" } | ConvertTo-Json -Compress) | Out-Null
  Write-Host "API access OK"
} catch {
  Write-Error "Management API failed: $($_.Exception.Message) $($_.ErrorDetails.Message)"
  exit 1
}

$chunks = [regex]::Split($sql, '(?=-- ========== )')
$applied = 0
foreach ($chunk in $chunks) {
  $trim = $chunk.Trim()
  if ($trim.Length -lt 10) { continue }
  $name = if ($trim -match '-- ========== (.+?) ==========') { $matches[1] } else { "chunk_$applied" }
  Write-Host "Applying: $name ..."
  try {
    Invoke-RestMethod -Method Post -Uri "https://api.supabase.com/v1/projects/$ref/database/query" -Headers $headers -Body (@{ query = $trim } | ConvertTo-Json -Compress -Depth 10) | Out-Null
    $applied++
    Write-Host "  OK"
  } catch {
    Write-Host "  FAIL"
    if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message.Substring(0, [Math]::Min(1000, $_.ErrorDetails.Message.Length)) }
    exit 1
  }
}
Write-Host "SUCCESS: applied $applied migration chunks."
