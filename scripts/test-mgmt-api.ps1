try {
  Import-Module CredentialManager -ErrorAction Stop
  $c = Get-StoredCredential -Target "Supabase CLI:supabase"
  if (-not $c) { Write-Output "NO_CRED"; exit 1 }
  $token = $c.GetNetworkCredential().Password
  Write-Output "TOKEN_LEN=$($token.Length)"
  Write-Output "TOKEN_PREFIX=$($token.Substring(0, [Math]::Min(8, $token.Length)))"

  $ref = "codwkylxpjlinutohflx"
  $headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
  $test = Invoke-RestMethod -Method Post -Uri "https://api.supabase.com/v1/projects/$ref/database/query" -Headers $headers -Body '{"query":"select 1 as ok"}'
  Write-Output "API_OK"
  Write-Output ($test | ConvertTo-Json -Compress)
} catch {
  Write-Output "ERROR=$($_.Exception.Message)"
  if ($_.ErrorDetails.Message) { Write-Output $_.ErrorDetails.Message.Substring(0, [Math]::Min(300, $_.ErrorDetails.Message.Length)) }
  exit 1
}
