# File Extensions OSX


To reset all plist infos on OSX Yosemite use this cli command

```
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain use
```

and restart finder

```
killall Finder
```

OSX starts to re-reads all plists of all apps and build file associations from that. Then you can associate mp3s and other audio files with MyPlayer
