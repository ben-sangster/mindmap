#!/bin/sh
DEPTH=../../..
rm -f ./mindmap.exe
lmk -m opt -b
$DEPTH/depend/InnoSetup5/ISCC.exe mindmap.iss
INSTALLER_PATH=$DEPTH/installers
if [ ! -d $INSTALLER_PATH ] ; then
   mkdir $INSTALLER_PATH
fi
cp mindmap.exe $INSTALLER_PATH/mindmap-`cat $DEPTH/tmp/win32-opt/mindmapapp/versionnumber.txt`-`cat $DEPTH/tmp/win32-opt/mindmapapp/buildnumber.txt`.exe
