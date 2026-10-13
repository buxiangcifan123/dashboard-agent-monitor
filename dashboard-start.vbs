Set WshShell = CreateObject("WScript.Shell")
Set env = WshShell.Environment("PROCESS")
env("NODE_OPTIONS") = ""
Set fso = CreateObject("Scripting.FileSystemObject")
baseDir = fso.GetParentFolderName(WScript.ScriptFullName)
' Launch Agent Monitor Dashboard (production mode, loadFile dist/index.html)
WshShell.Run """" & baseDir & "\node_modules\electron\dist\electron.exe"" """ & baseDir & """", 0, False
