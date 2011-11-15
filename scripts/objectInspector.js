var dmz =
   { ui:
      { consts: require('dmz/ui/consts')
      , loader: require('dmz/ui/uiLoader')
      , mainWindow: require('dmz/ui/mainWindow')
      }
   , mind: require("mindConst")
   , mask: require("dmz/types/mask")
   , object: require("dmz/components/object")
   , module: require("dmz/runtime/module")
   }
  // Constants
  , DockName = "Object Inspector"
  // Functions
  , _findInspector
  // Variables
  , _exports = {}
  , _table = {}
  , _selfTable = {}
  , _selected
  , _form = dmz.ui.loader.load("ObjectInspector")
  , _dock =
       dmz.ui.mainWindow.createDock
          (DockName
          , { area: dmz.ui.consts.RightToolBarArea
            , allowedAreas: [dmz.ui.consts.AllToolBarAreas]
            , floating: true
            , visible: true
            }
          , _form
          )
  , _stack = _form.lookup("stack")
  ;

self.shutdown = function () { dmz.ui.mainWindow.removeDock(DockName); };

_findInspector = function (handle) {

   var result
     , type = dmz.object.type(handle)
     ;

   while (type && !result) {

      result = _table[type.name()];
      type = type.parent();
   }

   return result;
};

dmz.object.flag.observe(self, dmz.object.SelectAttribute, function (handle, attr, value) {

   var inspector
     , state
     ;

   if (!value && (handle === _selected)) {

      state = dmz.object.state(handle, dmz.mind.MindState);

      if (state) {

         state = state.unset(dmz.mind.SelectedState);
         dmz.object.state(handle, dmz.mind.MindState, state);
      }

      _stack.currentIndex(0);
      _selected = undefined;
   }
   else if (value && (handle !== _selected)) {

      state = dmz.object.state(handle, dmz.mind.MindState) || dmz.mask.create();
      if (state) {

         state = state.or(dmz.mind.SelectedState);
         dmz.object.state(handle, dmz.mind.MindState, state);
      }

      inspector = _findInspector(handle);

      if (inspector) {

         inspector.func(handle);
         _stack.currentIndex(inspector.index);
      }
      else { _stack.currentIndex(0); }

      _selected = handle;
   }
});

dmz.object.destroy.observe(self, function (handle) {

   if (handle === _selected) {

      _stack.currentIndex(0);
      _selected = undefined;
   }
});

_exports.addInspector = function (obj, widget, type, func) {

   if (obj && obj.name && widget && type && func) {

      _table[type.name()] =
         { widget: widget
         , func: func
         , type: type
         , index: _stack.add(widget)
         };

      _selfTable[obj.name] = type.name();
   }
};

// Publish module
dmz.module.publish(self, _exports);
