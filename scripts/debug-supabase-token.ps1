Add-Type @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public class CredMan {
  [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
  public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public struct Credential {
    public int Flags; public int Type; public IntPtr TargetName; public IntPtr Comment;
    public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten; public int CredentialBlobSize;
    public IntPtr CredentialBlob; public int Persist; public int AttributeCount; public IntPtr Attributes; public IntPtr TargetAlias; public IntPtr UserName;
  }
  public static string Read(bool unicode) {
    IntPtr nCredPtr;
    if (!CredRead("Supabase CLI:supabase", 1, 0, out nCredPtr)) return $null;
    var cred = (Credential)Marshal.PtrToStructure(nCredPtr, typeof(Credential));
    var bytes = new byte[cred.CredentialBlobSize];
    Marshal.Copy(cred.CredentialBlob, bytes, 0, cred.CredentialBlobSize);
    Marshal.FreeCoTaskMem(nCredPtr);
    return unicode ? Encoding.Unicode.GetString(bytes).TrimEnd('\0') : Encoding.UTF8.GetString(bytes).TrimEnd('\0');
  }
}
'@

$u = [CredMan]::Read($true)
$f = [CredMan]::Read($false)
Write-Output "UNICODE_LEN=$($u.Length)"
Write-Output "UNICODE_PREFIX=$($u.Substring(0,[Math]::Min(12,$u.Length)))"
Write-Output "UTF8_LEN=$($f.Length)"
Write-Output "UTF8_PREFIX=$($f.Substring(0,[Math]::Min(12,$f.Length)))"

$token = if ($f -match '^sbp_') { $f } elseif ($u -match '^sbp_') { $u } else { $f }
$ref = 'codwkylxpjlinutohflx'
$body = '{"query":"select 1 as ok"}'
try {
  $r = Invoke-WebRequest -Method Post -Uri "https://api.supabase.com/v1/projects/$ref/database/query" -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $body -UseBasicParsing
  Write-Output "API_STATUS=$($r.StatusCode)"
} catch {
  Write-Output "API_ERROR=$($_.Exception.Response.StatusCode.value__)"
  if ($_.ErrorDetails.Message) { Write-Output "API_MSG=$($_.ErrorDetails.Message.Substring(0,[Math]::Min(200,$_.ErrorDetails.Message.Length)))" }
}
