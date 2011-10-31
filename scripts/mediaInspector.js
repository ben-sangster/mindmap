var dmz =
   { mind: require("mindConst")
   , stance: require("stanceConst")
   , defs: require("dmz/runtime/definitions")
   , object: require("dmz/components/object")
   , objectType: require("dmz/runtime/objectType")
   , module: require("dmz/runtime/module")
   , resources: require("dmz/runtime/resources")
   , util: require("dmz/types/util")
   , ui:
      { consts: require('dmz/ui/consts')
      , graph: require("dmz/ui/graph")
      , layout: require("dmz/ui/layout")
      , label: require("dmz/ui/label")
      , loader: require('dmz/ui/uiLoader')
      , messageBox: require("dmz/ui/messageBox")
      , mainWindow: require("dmz/ui/mainWindow")
      , graph: require("dmz/ui/graph")
      }
   }
   , DateJs = require("datejs/time")
   // CONSTS
   , AVATAR_WIDTH = 50
   , AVATAR_HEIGHT = 50
   // Functions
   , _updatePostedAt
   , _updateMessage
   , _updateTags
   // Variables
   , _inUpdate = false
   , _object
   , _form = dmz.ui.loader.load("PostItem")
   , _postedAt = _form.lookup("postedAtLabel")
   , _message = _form.lookup("messageLabel")
   , _tags = _form.lookup("tagLabel")
   ;

(function () {

   _form.lookup("avatarLabel").hide();
   _form.lookup("postedByLabel").hide();
}());

_updateTags = function (handle) {

   if (handle === _object) { _tags.text(dmz.mind.getDataTags(handle).toString()); }
};

_updatePostedAt = function (handle) {

   var timestamp;
   if (handle === _object) {

      timestamp = dmz.object.timeStamp(handle, dmz.stance.CreatedAtServerTimeHandle) || 0;
      _postedAt.text(dmz.util.timeStampToDate(timestamp).toString(dmz.stance.TIME_FORMAT));
   }
};

_updateMessage = function (handle) {

   if (handle === _object) { _message.text(dmz.object.text(handle, dmz.stance.TitleHandle)); }
}

dmz.object.text.observe(self, dmz.stance.TitleHandle, _updateMessage);
dmz.object.timeStamp.observe(self, dmz.stance.CreatedAtServerTimeHandle, _updatePostedAt);
dmz.object.data.observe(self, dmz.stance.TagHandle, _updateTags);

dmz.module.subscribe(self, "objectInspector", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.addInspector(self, _form, dmz.mind.MediaType, function (handle) {

         _object = handle;
         _updatePostedAt(handle);
         _updateMessage(handle);
         _updateTags(handle);
      });
   }
});
