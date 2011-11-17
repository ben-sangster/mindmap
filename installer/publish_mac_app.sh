#!/bin/sh

DEPTH=../../..

CHANNEL=$1

if [ "$CHANNEL" = "" ] ; then
   CHANNEL=devel
fi

VERSION_XML=$DEPTH/bin/macos-opt/MINDMAP.app/Contents/Resources/config/version.xml
UPDATE=MINDMAP-`cat $DEPTH/tmp/macos-opt/mindmapapp/versionnumber.txt`-`cat $DEPTH/tmp/macos-opt/mindmapapp/buildnumber.txt`
OLD_UPDATE=MINDMAP-`cat $DEPTH/tmp/macos-opt/mindmapapp/buildnumber.txt`
INSTALLER=$DEPTH/installers/$UPDATE.dmg

echo "publishing $INSTALLER..."

echo "scp $VERSION_XML dmzupdate.chds.us:/home/dmzupdate.chds.us/public/latest/macos-$CHANNEL/MINDMAP.xml"
scp $VERSION_XML dmzupdate.chds.us:/home/dmzupdate.chds.us/public/latest/macos-$CHANNEL/MINDMAP.xml

echo "scp ./changelog.html dmzupdate.chds.us:/home/dmzupdate.chds.us/public/downloads/$UPDATE.html"
scp ./changelog.html dmzupdate.chds.us:/home/dmzupdate.chds.us/public/downloads/$UPDATE.html

echo "scp ./changelog.html dmzupdate.chds.us:/home/dmzupdate.chds.us/public/downloads/$OLD_UPDATE.html"
scp ./changelog.html dmzupdate.chds.us:/home/dmzupdate.chds.us/public/downloads/$OLD_UPDATE.html

echo "scp $INSTALLER dmzupdate.chds.us:/home/dmzupdate.chds.us/public/downloads"
scp $INSTALLER dmzupdate.chds.us:/home/dmzupdate.chds.us/public/downloads

echo "ssh dmzupdate.chds.us sudo ln -s /home/dmzupdate.chds.us/public/downloads/$UPDATE.dmg /home/dmzupdate.chds.us/public/downloads/$OLD_UPDATE.dmg"
ssh dmzupdate.chds.us sudo ln -s /home/dmzupdate.chds.us/public/downloads/$UPDATE.dmg /home/dmzupdate.chds.us/public/downloads/$OLD_UPDATE.dmg

echo "ssh dmzupdate.chds.us sudo chown www-data.admin -R /home/dmzupdate.chds.us/public"
ssh dmzupdate.chds.us sudo chown www-data.admin -R /home/dmzupdate.chds.us/public

echo "ssh dmzupdate.chds.us sudo chmod -R g+w /home/dmzupdate.chds.us/public"
ssh dmzupdate.chds.us sudo chmod -R g+w /home/dmzupdate.chds.us/public

echo "direct download link: http://dmzupdate.chds.us/downloads/$UPDATE.dmg"
echo "done!"
