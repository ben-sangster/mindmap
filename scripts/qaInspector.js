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
   , _updatePostedBy
   , _updatePostedAt
   , _updateMessage
   , _updateTags
   // Variables
   , _inUpdate = false
   , _object
   , _form = dmz.ui.loader.load("PostItem")
   , _avatar = _form.lookup("avatarLabel")
   , _postedBy = _form.lookup("postedByLabel")
   , _postedAt = _form.lookup("postedAtLabel")
   , _message = _form.lookup("messageLabel")
   , _tags = _form.lookup("tagLabel")
   ;

_updatePostedBy = function (handle) {

   var authorHandle
     , avatar
     ;
   if (handle === _object) {

      authorHandle = dmz.stance.getAuthorHandle(handle);
      if (!dmz.object.scalar(authorHandle, dmz.stance.Permissions)) { }
      else {

         if (dmz.object.type(handle).isOfType(dmz.stance.AnswerType)) {

            handle = (dmz.object.subLinks(handle, dmz.stance.QuestionLinkHandle) || [])[0];
         }
         if (handle && dmz.object.type(handle).isOfType(dmz.stance.QuestionType)) {

            authorHandle = (dmz.object.subLinks(handle, dmz.stance.QuestionLinkHandle) || [])[0];
         }
      }

      if (authorHandle) {

         _postedBy.text("<b>" + dmz.stance.getDisplayName(authorHandle) + "</b>");
         avatar = dmz.object.text(authorHandle, dmz.stance.PictureHandle);
         avatar = dmz.resources.findFile(avatar);
         if (avatar) { avatar = dmz.ui.graph.createPixmap(avatar); }
         if (avatar) { avatar = avatar.scaled(AVATAR_WIDTH, AVATAR_HEIGHT); }
         _avatar.pixmap(avatar);
      }
   }
};


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

   if (handle === _object) { _message.text(dmz.object.text(handle, dmz.stance.TextHandle)); }
}

dmz.object.text.observe(self, dmz.stance.TextHandle, _updateMessage);
dmz.object.timeStamp.observe(self, dmz.stance.CreatedAtServerTimeHandle, _updatePostedAt);
dmz.object.data.observe(self, dmz.stance.TagHandle, _updateTags);
dmz.object.link.observe(self, dmz.stance.CreatedByHandle,
function (linkObjHandle, attrHandle, superHandle, subHandle) {

   _updatePostedBy(superHandle, subHandle);
});

dmz.module.subscribe(self, "objectInspector", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.addInspector(self, _form, dmz.mind.QAType, function (handle) {

         _object = handle;
         _updatePostedBy(handle);
         _updatePostedAt(handle);
         _updateMessage(handle);
         _updateTags(handle);
      });
   }
});
