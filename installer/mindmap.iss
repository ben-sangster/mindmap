#define BuildMode "opt"
#define AppName "mindmap"
#define AppVerName "mindmap 0.1.5"
#define Publisher "CHDS"
#define AppURL "http://dmzdev.chds.us"
#define AppExeName "mindmap.exe"
#define DependDir "..\..\..\depend"
#define VsDir "c:\Program Files\Microsoft Visual Studio 9.0"

[Setup]
AppId={{0B237220-3D79-11E1-B33D-E00F4924019B}
AppName={#AppName}
AppVerName={#AppVerName}
AppPublisher={#Publisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}
ShowLanguageDialog=no
DefaultDirName={pf}\{#AppName}
DefaultGroupName={#AppName}
UninstallDisplayName={#AppName}
UninstallDisplayIcon={app}\bin\{#AppExeName}
UninstallFilesDir={app}\uninst
OutputDir=.
OutputBaseFilename=mindmapsetup
;OutputManifestFile=manifest.txt
;WizardImageFile=WizImage.bmp
;WizardSmallImageFile=WizSmallImage.bmp
;SetupIconFile=Setup.ico
Compression=lzma
SolidCompression=yes

[Languages]
Name: english; MessagesFile: compiler:Default.isl

[Tasks]
Name: desktopicon; Description: {cm:CreateDesktopIcon}; GroupDescription: {cm:AdditionalIcons}; Languages:
Name: quicklaunchicon; Description: {cm:CreateQuickLaunchIcon}; GroupDescription: {cm:AdditionalIcons}; Flags: unchecked

[Icons]
Name: {group}\{#AppName}; Filename: {app}\bin\{#AppExeName}; WorkingDir: {app}; IconFilename: {app}\bin\{#AppExeName}; Tasks:
Name: {group}\{cm:UninstallProgram,{#AppName}}; Filename: {uninstallexe}
Name: {userdesktop}\{#AppName}; Filename: {app}\bin\{#AppExeName}; Tasks: desktopicon; WorkingDir: {app}; IconFilename: {app}\bin\{#AppExeName}; Languages:
Name: {userappdata}\Microsoft\Internet Explorer\Quick Launch\{#AppName}; Filename: {app}\bin\{#AppExeName}; Tasks: quicklaunchicon; WorkingDir: {app}; IconFilename: {app}\bin\{#AppExeName}; Languages:

[Run]
Filename: {app}\bin\{#AppExeName}; Description: {cm:LaunchProgram,{#AppName}}; Flags: nowait postinstall skipifsilent; Tasks: ; Languages:

[Registry]
Root: HKLM; Subkey: Software\DMZ\{#AppName}; ValueType: string; ValueName: workingDir; ValueData: {app}; Flags: uninsdeletekey
Root: HKCR; Subkey: mindmap.file\shell\open\command; ValueType: string; ValueData: "{app}\bin\mindmap.exe ""%1"""; Flags: uninsdeletekey

[Files]
Source: ..\..\..\bin\win32-{#BuildMode}\mindmap.app\*; DestDir: {app}; Flags: recursesubdirs
Source: {#DependDir}\bin\QtCore4.dll; DestDir: {app}\bin
Source: {#DependDir}\bin\QtGui4.dll; DestDir: {app}\bin
Source: {#DependDir}\bin\QtOpenGL4.dll; DestDir: {app}\bin
Source: {#DependDir}\bin\QtSvg4.dll; DestDir: {app}\bin
Source: {#DependDir}\bin\QtXml4.dll; DestDir: {app}\bin
Source: {#DependDir}\bin\QtWebKit4.dll; DestDir: {app}\bin
Source: {#DependDir}\bin\QtNetwork4.dll; DestDir: {app}\bin
Source: {#DependDir}\bin\ssleay32.dll; DestDir: {app}\bin
Source: {#DependDir}\bin\libeay32.dll; DestDir: {app}\bin
Source: {#DependDir}\bin\phonon4.dll; DestDir: {app}\bin
Source: {#DependDir}\bin\phonon_ds94.dll; DestDir: {app}\bin\plugins\phonon_backend
Source: {#DependDir}\bin\qjpeg4.dll; DestDir: {app}\bin\plugins\imageformats
Source: {#DependDir}\bin\qgif4.dll; DestDir: {app}\bin\plugins\imageformats
Source: {#DependDir}\bin\qtiff4.dll; DestDir: {app}\bin\plugins\imageformats
Source: {#DependDir}\bin\v8.dll; DestDir: {app}\bin
Source: {#VsDir}\VC\redist\x86\Microsoft.VC90.CRT\*; DestDir: {app}\bin\Microsoft.VC90.CRT
