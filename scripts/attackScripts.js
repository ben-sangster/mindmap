var dmz =
       { attack: require("attackAPI")
       , archive: require("dmz/components/archive")
       , file: require("dmz/system/file")
       , fileDialog: require("dmz/ui/fileDialog")
       , io: require("dmz/runtime/configIO")
       , main: require("dmz/ui/mainWindow")
       , messaging: require("dmz/runtime/messaging")
       , messageBox: require("dmz/ui/messageBox")
       , module: require("dmz/runtime/module")
       , script: require("dmz/runtime/script")
       , uiConst: require("dmz/ui/consts")
       , uiLoader: require("dmz/ui/uiLoader")
       , undo: require("dmz/runtime/undo")
       , zip: require("dmz/system/zip")
       }
  // Constants
  , DockName = "Attack Scripts"
  , ListFileName = "AttackScriptList.json"
  , FileExt = ".js"
  // Functions
  , _compile_script
  // Variables
  , _playMode = false
  , _exports = {}
  , _form = dmz.uiLoader.load("AttackScripts")
  , _startButton = _form.lookup("startButton")
  , _mb = dmz.messageBox.create
       ( { type: dmz.messageBox.Warn
         , text: "Script already loaded"
         , informativeText: "Reload script?"
         , standardButtons: [dmz.messageBox.Ok, dmz.messageBox.Cancel]
         , defaultButton: dmz.messageBox.Ok
         }
       , dmz.main.window() // _form
       )
  , _dock = dmz.main.createDock
       ( DockName
       , { area: dmz.uiConst.RightToolBarArea
         , allowedAreas: [dmz.uiConst.NoToolBarArea]
         , floating: true
         , visible: true
         }
       , _form
       )
  , _list = _form.lookup("fileList")
  ;

self.shutdown = function () { dmz.main.removeDock(DockName); };

dmz.script.observe(self, dmz.script.InstanceDestroy,
function (name, handle, script, file) {

   var found = _list.findItems(file);

   if (found && (found.length > 0)) {

      found.forEach(function(item) { _list.takeItem(item); });
   }
});

_compile_script = function (item) {

   var data = item ? item.data() : undefined
     , name = item ? item.text() : undefined
     ;

   if (data && data.script) {

      if (data.instance) { dmz.script.destroy(data.instance); delete data.instance; }
      if (data.handle) { data.handle = dmz.script.compile(data.handle, data.script); }
      else { data.handle = dmz.script.compile(name, data.script); }

      if (data.handle) {

         data.instance = dmz.script.instance(data.handle);
      }
      else {

         delete data.handle;
         delete data.instance;
         _list.takeItem(item);
      }
   }
   else if (item) { _list.takeItem(item); }
};

_startButton.observe(self, "clicked", function (button) {

   if (_playMode) { button.text("Start"); dmz.attack.controlAPI.stop(); }
   else { button.text("Stop"); dmz.attack.controlAPI.start(); }

   _playMode = !_playMode;
});

_form.observe(self, "resetButton", "clicked", function (button) {

   var count = _list.count()
     , item
     , data
     , index = 0
     ;

   _startButton.text("Start");
   _playMode = false;
   dmz.attack.controlAPI.reset();

   for (index= 0; index < count; index++) {

      item = _list.item(index);

      if (item) {

         _compile_script(item);
         _list.addItem(item.text(), item.data());
      }
   }
});

_form.observe(self, "exportButton", "clicked", function () {

   var item = _list.currentItem()
     , file
     , split
     , data
     ;

   if (item) {

      file = dmz.fileDialog.getSaveFileName(
         { caption: "Export attack script file", filter: "JavaScript File (*.js)" },
         _form);

      data = item.data();
   }

   if (file && data && data.script) {

      split = dmz.file.split(file);

      if (split) {

         if (split.ext !== FileExt) { file = file + FileExt; }
      }

      dmz.file.write(file, data.script);
   }
});

_form.observe(self, "addButton", "clicked", function () {

   var file = dmz.fileDialog.getOpenFileName(
          { caption: "Load attack script file", filter: "JavaScript File (*.js)" },
          _form)
     , split
     , name
     , script
     , found
     ;

   if (file && file[0]) {

      file = file[0]

      split = dmz.file.split(file);

      if (split) {

         name = split.file + split.ext;

         found = _list.findItems(name);

         if (found && (found.length > 0)) {

            _mb.text("Script " + name + " already loaded.");

            _mb.open(self, function (value) {

               var data;

               found = found[0];

               if (found && (value === dmz.messageBox.Ok)) {

                  data = found.data();

                  if (data) {

                     data.script = dmz.file.read(file); 
                     _compile_script(found);
                     _list.addItem(found.text(), found.data());
                  }
               }
            });
         }
         else {

            script = dmz.file.read(file);

            if (script) {

               found = _list.addItem(name, {script: script});

               _compile_script(found);
            }
         }
      }
   }
});

_form.observe(self, "removeButton", "clicked", function () {

   var item = _list.currentItem()
     , script
     ;

   if (item) {

      script = item.data();

      if (script && script.handle) { dmz.script.destroy(script.handle); }

      _list.takeItem(item);
   }
});

_exports.load = function (file) {

   var listStr = dmz.zip.read(file, ListFileName)
     , list
     ;

   try {

      if (listStr) { list = JSON.parse(listStr); }
      else { self.log.error("Failed to load JSON file:", ListFileName); }
   }
   catch (error) {

      self.log.error("Failed to parse JSON file:", ListFileName); 
   }

   if (list) {

      list.forEach(function(data) {

         var script = dmz.zip.read(file, data)
           , item
           ;

         if (script) {

            item = _list.addItem(data, {script: script});
            _compile_script(item);
         }
      });
   }
};

_exports.save = function () {

   var result = []
     , count = _list.count()
     , item
     , index = 0
     , list = []
     ;

   for (index= 0; index < count; index++) {

      item = _list.item(index);

      if (item) {

         list.push(item.text());
         result.push({name: item.text(), data: item.data().script});
      }
   }

   result.push({name: ListFileName, data: JSON.stringify(list)});

   return result;
};

_exports.clear = function () {

   var count = _list.count()
     , item
     , data
     , index = 0
     ;

   for (index= 0; index < count; index++) {

      item = _list.item(index);

      if (item) {

         data = item.data();

         if (data && data.handle) { dmz.script.destroy(data.handle); }
      }
   }

   _list.clear();
   dmz.attack.controlAPI.stop();
   _startButton.text("Start");
   _playMode = false;
};

dmz.module.publish(self, _exports);
