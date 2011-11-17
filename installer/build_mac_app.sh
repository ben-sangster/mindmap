#!/bin/sh
DEPTH=../../..
lmk -m opt -b
cp -RL $DEPTH/bin/macos-opt/MINDMAP.app $DEPTH
mkdir $DEPTH/MINDMAP.app/Contents/Frameworks/Qt
mkdir $DEPTH/MINDMAP.app/Contents/Frameworks/Qt/plugins
mkdir $DEPTH/MINDMAP.app/Contents/Frameworks/Qt/plugins/imageformats
mkdir $DEPTH/MINDMAP.app/Contents/Frameworks/v8/
mkdir $DEPTH/MINDMAP.app/Contents/Frameworks/Qt/plugins/phonon_backend
cp $DEPTH/depend/Qt/QtCore $DEPTH/MINDMAP.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtGui $DEPTH/MINDMAP.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtXml $DEPTH/MINDMAP.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtSvg $DEPTH/MINDMAP.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtOpenGL $DEPTH/MINDMAP.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtWebKit $DEPTH/MINDMAP.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtNetwork $DEPTH/MINDMAP.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/phonon $DEPTH/MINDMAP.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/imageformats/libqgif.dylib $DEPTH/MINDMAP.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/imageformats/libqjpeg.dylib $DEPTH/MINDMAP.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/imageformats/libqtiff.dylib $DEPTH/MINDMAP.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/imageformats/libqsvg.dylib $DEPTH/MINDMAP.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/phonon_backend/libphonon_qt7.dylib $DEPTH/MINDMAP.app/Contents/Frameworks/Qt/plugins/phonon_backend/
if [ -d $DEPTH/depend/QtGui.framework/Versions/4/Resources/qt_menu.nib ] ; then
cp -R $DEPTH/depend/QtGui.framework/Versions/4/Resources/qt_menu.nib $DEPTH/MINDMAP.app/Contents/Resources
fi
cp $DEPTH/depend/v8/lib/libv8.dylib $DEPTH/MINDMAP.app/Contents/Frameworks/v8/
mkdir $DEPTH/MINDMAP
mv $DEPTH/MINDMAP.app $DEPTH/MINDMAP/
ln -s /Applications $DEPTH/MINDMAP/
TARGET=$DEPTH/MINDMAP-`cat $DEPTH/tmp/macos-opt/mindmapapp/versionnumber.txt`-`cat $DEPTH/tmp/macos-opt/mindmapapp/buildnumber.txt`.dmg
hdiutil create -srcfolder $DEPTH/MINDMAP/ $TARGET
hdiutil internet-enable -yes -verbose $TARGET
rm -rf $DEPTH/MINDMAP/
INSTALLER_PATH=$DEPTH/installers
if [ ! -d $INSTALLER_PATH ] ; then
   mkdir $INSTALLER_PATH
fi
mv $TARGET $INSTALLER_PATH
