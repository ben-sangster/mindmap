var dmz =
   { defs: require("dmz/runtime/definitions")
   , data: require("dmz/runtime/data")
   , object: require("dmz/components/object")
   , objectType: require("dmz/runtime/objectType")
   , module: require("dmz/runtime/module")
   , util: require("dmz/types/util")
   , mask: require("dmz/types/mask")
   , stance: require("stanceConst")
   }
   , _exports = {}

   , ObjectTypes =
        { LinkData: dmz.objectType.lookup("LinkData")
        , CanvasLinkData: dmz.objectType.lookup("CanvasLinkData")
        , ToolLinkType: dmz.objectType.lookup("Tool Link Node")
        }

   , Handles =
        { MindPosition: dmz.defs.createNamedHandle("mind_position") // Position on canvas
        , MindServerPosition: dmz.defs.createNamedHandle("mind_server_position")
        , MindActive: dmz.defs.createNamedHandle("mind_active")
        , MindLabel: dmz.defs.createNamedHandle("mind_label") // Label on canvas
        , MindState: dmz.defs.createNamedHandle("mind_state")
        }

   , AttrHandles =
        { CanvasLink: dmz.defs.createNamedHandle("canvas_link") // Links visible on canvas, not on server or archive
        , ServerLink: dmz.defs.createNamedHandle("server_link") // Links visible on server / archive
        }
   , States =
        { GroupColorAllState: dmz.defs.lookupState("Group_Color_All")
        , GroupColor0State: dmz.defs.lookupState("Group_Color_0")
        , GroupColor1State: dmz.defs.lookupState("Group_Color_1")
        , GroupColor2State: dmz.defs.lookupState("Group_Color_2")
        , GroupColor3State: dmz.defs.lookupState("Group_Color_3")
        , GroupColor4State: dmz.defs.lookupState("Group_Color_4")
        , GroupColor5State: dmz.defs.lookupState("Group_Color_5")
        , GroupColor6State: dmz.defs.lookupState("Group_Color_6")
        , ShowIconState: dmz.defs.lookupState("Show_Icon")
        , HighlightState: dmz.defs.lookupState("Highlight")
        }

   , Functions =
        { getDataTags: false
        , getLinkTags: false
        , getStanceObject: false
        , getGroupID: false
        }
   , getDataTags
   , getLinkTags
   , getStanceObject
   , getGroupHandles
   , getGroupID
   ;

getDataTags = function (handle) {

   return dmz.stance.getTags(dmz.object.data(handle, dmz.stance.TagHandle));
};

getLinkTags = function (superHandle, subHandle) {

   var superTags = getDataTags(superHandle)
     , subTags = getDataTags(subHandle)
     , result = superTags.filter(function (tag) { return subTags.indexOf(tag) !== -1; })
     ;

   return result.length ? result : ["-"];
};

getGroupHandles = function (handle) {

   var type = dmz.object.type(handle)
     , result
     ;

   if (type) {

      if (type.isOfType(dmz.stance.VoteType)) {

         result = dmz.object.subLinks(handle, dmz.stance.VoteGroupHandle);
      }
      else if (type.isOfType(dmz.stance.QuestionType)) {

         handle = (dmz.object.subLinks(handle, dmz.stance.QuestionLinkHandle) || [])[0];
         result = dmz.object.subLinks(handle, dmz.stance.AdvisorGroupHandle);
      }
      else if (type.isOfType(dmz.stance.AnswerType)) {

         handle = (dmz.object.subLinks(handle, dmz.stance.QuestionLinkHandle) || [])[0];
         handle = (dmz.object.subLinks(handle, dmz.stance.QuestionLinkHandle) || [])[0];
         result = dmz.object.subLinks(handle, dmz.stance.AdvisorGroupHandle);
      }
      else if (type.isOfType(dmz.stance.PostType)) {

         handle = (dmz.object.subLinks(handle, dmz.stance.ParentHandle) || [])[0];
         result = dmz.object.subLinks(handle, dmz.stance.ForumLink);
      }
      else if (type.isOfType(dmz.stance.CommentType)) {

         handle = (dmz.object.subLinks(handle, dmz.stance.ParentHandle) || [])[0];
         handle = (dmz.object.subLinks(handle, dmz.stance.ParentHandle) || [])[0];
         result = dmz.object.subLinks(handle, dmz.stance.ForumLink);
      }
      else if (type.isOfType(dmz.stance.MemoType) || type.isOfType(dmz.stance.NewspaperType) ||
              type.isOfType(dmz.stance.VideoType) || type.isOfType(dmz.stance.PdfItemType) ||
              type.isOfType(dmz.stance.LobbyistType)) {

         handle = dmz.object.subLinks(handle, dmz.stance.MediaHandle) || [];
         result = handle.filter(function (handle) {

            return dmz.object.type(handle).isOfType(dmz.stance.GroupType);
         });
      }
   }
   return result;
}

getGroupID = function (handle) {

   var groups = getGroupHandles(handle)
     , result = 0
     ;

   if (groups && groups.length) {

      result = (groups.length > 1) ? -1 : dmz.object.scalar(groups[0], dmz.stance.ID);
   }
   return result;
};

Functions.getDataTags = getDataTags;
Functions.getLinkTags = getLinkTags;
Functions.getStanceObject = getStanceObject;
Functions.getGroupHandles = getGroupHandles;
Functions.getGroupID = getGroupID;


(function () {

   dmz.object.allowDefaultAttribute(false);
   Object.keys(ObjectTypes).forEach(function (objectTypeName) {

      dmz.util.defineConst(exports, objectTypeName, ObjectTypes[objectTypeName]);
   });

   Object.keys(Functions).forEach(function (fncName) {

      dmz.util.defineConst(exports, fncName, Functions[fncName]);
   });

   Object.keys(Handles).forEach(function (handle) {

      dmz.util.defineConst(exports, handle, Handles[handle]);
   });

   Object.keys(AttrHandles).forEach(function (attrHandle) {

      dmz.util.defineConst(exports, attrHandle, AttrHandles[attrHandle]);
   });

   Object.keys(States).forEach(function (state) {

      dmz.util.defineConst(exports, state, States[state]);
   });
}());
