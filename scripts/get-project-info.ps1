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
    if (bytes.Length >= 2 && bytes[1] == 0) return Encoding.Unicode.GetString(bytes).TrimEnd('\0');
    return Encoding.UTF8.GetString(bytes).TrimEnd('\0');
  }
}
'@

$token = [WinCred]::ReadSupabaseToken()
$ref = "codwkylxpjlinutohflx"
$headers = @{ Authorization = "Bearer $token" }
try {
  $p = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$ref" -Headers $headers
  $p | ConvertTo-Json -Depth 6
} catch {
  Write-Output "ERR $($_.Exception.Message)"
  if ($_.ErrorDetails.Message) { Write-Output $_.ErrorDetails.Message }
}
