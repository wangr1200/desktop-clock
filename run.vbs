Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\desktop-clock"
WshShell.Run "node_modules\electron\dist\electron.exe .", 0, False