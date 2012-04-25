#!/bin/sh
DEPTH=../../..

CHANNEL=$1

if [ "$CHANNEL" = "" ] ; then
   CHANNEL=devel
fi

VERSION_XML=$DEPTH/bin/win32-opt/mindmap.app/config/version.xml
UPDATE=mindmap-`cat $DEPTH/tmp/win32-opt/mindmapapp/versionnumber.txt`-`cat $DEPTH/tmp/win32-opt/mindmapapp/buildnumber.txt`
OLD_UPDATE=mindmap-`cat $DEPTH/tmp/win32-opt/mindmapapp/buildnumber.txt`
INSTALLER=$DEPTH/installers/$UPDATE.exe

echo "publishing $INSTALLER..."

echo "scp $VERSION_XML dmzupdate.chds.us:/home/dmzupdate.chds.us/public/latest/win32-$CHANNEL/mindmap.xml"
scp $VERSION_XML dmzupdate.chds.us:/home/dmzupdate.chds.us/public/latest/win32-$CHANNEL/mindmap.xml

echo "scp ./changelog.html dmzupdate.chds.us:/home/dmzupdate.chds.us/public/downloads/$UPDATE.html"
scp ./changelog.html dmzupdate.chds.us:/home/dmzupdate.chds.us/public/downloads/$UPDATE.html

echo "scp ./changelog.html dmzupdate.chds.us:/home/dmzupdate.chds.us/public/downloads/$OLD_UPDATE.html"
scp ./changelog.html dmzupdate.chds.us:/home/dmzupdate.chds.us/public/downloads/$OLD_UPDATE.html

echo "scp $INSTALLER dmzupdate.chds.us:/home/dmzupdate.chds.us/public/downloads"
scp $INSTALLER dmzupdate.chds.us:/home/dmzupdate.chds.us/public/downloads

echo "ssh dmzupdate.chds.us ln -s /home/dmzupdate.chds.us/public/downloads/$UPDATE.exe /home/dmzupdate.chds.us/public/downloads/$OLD_UPDATE.exe"
ssh dmzupdate.chds.us ln -s /home/dmzupdate.chds.us/public/downloads/$UPDATE.exe /home/dmzupdate.chds.us/public/downloads/$OLD_UPDATE.exe

#echo "ssh dmzupdate.chds.us sudo chown www-data.admin -R /home/dmzupdate.chds.us/public"
#ssh dmzupdate.chds.us sudo chown www-data.admin -R /home/dmzupdate.chds.us/public

#echo "ssh dmzupdate.chds.us sudo chmod -R g+w /home/dmzupdate.chds.us/public"
#ssh dmzupdate.chds.us sudo chmod -R g+w /home/dmzupdate.chds.us/public

echo "direct download link: http://dmzupdate.chds.us/downloads/$UPDATE.exe"
echo "done!"
