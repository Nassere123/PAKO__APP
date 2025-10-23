# Script PowerShell pour configurer PostgreSQL
$env:PGPASSWORD = "2050"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f setup-postgresql.sql
