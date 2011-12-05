#!/bin/sh
DEPTH=../../..
lmk -m opt -b
cp -RL $DEPTH/bin/macos-opt/mindmap.app $DEPTH
mkdir $DEPTH/mindmap.app/Contents/Frameworks/Qt
mkdir $DEPTH/mindmap.app/Contents/Frameworks/Qt/plugins
mkdir $DEPTH/mindmap.app/Contents/Frameworks/Qt/plugins/imageformats
mkdir $DEPTH/mindmap.app/Contents/Frameworks/v8/
mkdir $DEPTH/mindmap.app/Contents/Frameworks/Qt/plugins/phonon_backend
cp $DEPTH/depend/Qt/QtCore $DEPTH/mindmap.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtGui $DEPTH/mindmap.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtXml $DEPTH/mindmap.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtSvg $DEPTH/mindmap.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtOpenGL $DEPTH/mindmap.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtWebKit $DEPTH/mindmap.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtNetwork $DEPTH/mindmap.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/phonon $DEPTH/mindmap.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/imageformats/libqgif.dylib $DEPTH/mindmap.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/imageformats/libqjpeg.dylib $DEPTH/mindmap.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/imageformats/libqtiff.dylib $DEPTH/mindmap.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/imageformats/libqsvg.dylib $DEPTH/mindmap.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/phonon_backend/libphonon_qt7.dylib $DEPTH/mindmap.app/Contents/Frameworks/Qt/plugins/phonon_backend/
if [ -d $DEPTH/depend/QtGui.framework/Versions/4/Resources/qt_menu.nib ] ; then
cp -R $DEPTH/depend/QtGui.framework/Versions/4/Resources/qt_menu.nib $DEPTH/mindmap.app/Contents/Resources
fi
cp $DEPTH/depend/v8/lib/libv8.dylib $DEPTH/mindmap.app/Contents/Frameworks/v8/
mkdir $DEPTH/mindmap
mv $DEPTH/mindmap.app $DEPTH/mindmap/
ln -s /Applications $DEPTH/mindmap/
TARGET=$DEPTH/mindmap-`cat $DEPTH/tmp/macos-opt/mindmapapp/versionnumber.txt`-`cat $DEPTH/tmp/macos-opt/mindmapapp/buildnumber.txt`.dmg
hdiutil create -srcfolder $DEPTH/mindmap/ $TARGET
hdiutil internet-enable -yes -verbose $TARGET
rm -rf $DEPTH/mindmap/
INSTALLER_PATH=$DEPTH/installers
if [ ! -d $INSTALLER_PATH ] ; then
   mkdir $INSTALLER_PATH
fi
mv $TARGET $INSTALLER_PATH
