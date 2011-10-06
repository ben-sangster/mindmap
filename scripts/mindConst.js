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
        { StanceDataType: dmz.objectType.lookup("stance")
        , MindDataType: dmz.objectType.lookup("MindData")
        , VoteDataType: dmz.objectType.lookup("VoteData")
        , QADataType: dmz.objectType.lookup("QAData")
        , QuestionDataType: dmz.objectType.lookup("QuestionData")
        , AnswerDataType: dmz.objectType.lookup("AnswerData")
        , ForumDataType: dmz.objectType.lookup("ForumData")
        , PostDataType: dmz.objectType.lookup("PostData")
        , CommentDataType: dmz.objectType.lookup("CommentData")
        , MediaDataType: dmz.objectType.lookup("MediaData")
        , PDFDataType: dmz.objectType.lookup("PDFData")
        , VideoDataType: dmz.objectType.lookup("VideoData")
        , NewsDataType: dmz.objectType.lookup("NewsData")
        , MemoDataType: dmz.objectType.lookup("MemoData")
        , LobbyistData: dmz.objectType.lookup("LobbyistData")
        , LinkData: dmz.objectType.lookup("LinkData")
        , CanvasLinkData: data.objectType.lookup("CanvasLinkData")
        , ToolLinkType: dmz.objectType.lookup("Tool Link Node")
        }

   , Handles =
        { Position: dmz.defs.createNamedHandle("position") // Position on canvas
        , ActiveHandle: dmz.defs.createNamedHandle("Active") // Objects on canvas
        , LabelHandle: dmz.defs.createNamedHandle("label") // Label on canvas
        }

   , AttrHandles =
        { StanceLink: dmz.defs.createNamedHandle("stance_link") // Link to Stance objects
        , CanvasLink: dmz.defs.createNamedHandle("canvas_link") // Links visible on canvas, not on server or archive
        , ServerLink: dmz.defs.createNamedHandle("server_link") // Links visible on server / archive
        }
   , States =
        { GroupColorAllState: dmz.defs.createNamedHandle("Group_Color_All")
        , GroupColor0State: dmz.defs.createNamedHandle("Group_Color_0")
        , GroupColor1State: dmz.defs.createNamedHandle("Group_Color_1")
        , GroupColor2State: dmz.defs.createNamedHandle("Group_Color_2")
        , GroupColor3State: dmz.defs.createNamedHandle("Group_Color_3")
        , GroupColor4State: dmz.defs.createNamedHandle("Group_Color_4")
        , GroupColor5State: dmz.defs.createNamedHandle("Group_Color_5")
        , GroupColor6State: dmz.defs.createNamedHandle("Group_Color_6")
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
   , getGroupID
   ;

getDataTags = function (handle) {

   var type = dmz.object.type(handle)
     , stanceHandle
     ;

   if (type && type.isOfType(ObjectTypes.StanceDataType)) { stanceHandle = handle; }
   else if (type && type.isOfType(MindDataType)) { stanceHandle = getStanceObject(handle); }
   return dmz.stance.getTags(dmz.object.data(stanceHandle, dmz.stance.TagHandle));
};

getLinkTags = function (superHandle, subHandle) {

   var superTags = getDataTags(superHandle)
     , subTags = getDataTags(subHandle)
     , result = superTags.filter(function (tag) { return subTags.indexOf(tag) !== -1; })
     ;

   return result.length ? result : ["-"];
};

getStanceObject = function (handle) {

   return (dmz.object.subLinks(handle, AttrHandles.StanceLink) || [])[0];
};

getGroupID = function (handle) {

   var stanceHandle = getStanceObject(handle)
     , groupHandle = 0
     , type = dmz.object.type(stanceHandle)
     , result = false
     ;

   if (type) {

      if (type.isOfType(dmz.stance.VoteType)) {

         groupHandle = (dmz.object.subLinks(stanceHandle, dmz.stance.VoteGroupHandle) || [])[0];
      }
      else if (type.isOfType(dmz.stance.QuestionType)) {

         stanceHandle = (dmz.object.subLinks(stanceHandle, dmz.stance.QuestionLinkHandle) || [])[0];
         groupHandle = (dmz.object.subLinks(stanceHandle, dmz.stance.AdvisorGroupHandle) || [])[0];
      }
      else if (type.isOfType(dmz.stance.AnswerType)) {

         stanceHandle = (dmz.object.subLinks(stanceHandle, dmz.stance.QuestionLinkHandle) || [])[0];
         stanceHandle = (dmz.object.subLinks(stanceHandle, dmz.stance.QuestionLinkHandle) || [])[0];
         groupHandle = (dmz.object.subLinks(stanceHandle, dmz.stance.AdvisorGroupHandle) || [])[0];
      }
      else if (type.isOfType(dmz.stance.PostType)) {

         stanceHandle = (dmz.object.subLinks(stanceHandle, dmz.stance.ParentHandle) || [])[0];
         groupHandle = (dmz.object.subLinks(stanceHandle, dmz.stance.ForumLink) || [])[0];
      }
      else if (type.isOfType(dmz.stance.CommentType)) {

         stanceHandle = (dmz.object.subLinks(stanceHandle, dmz.stance.ParentHandle) || [])[0];
         stanceHandle = (dmz.object.subLinks(stanceHandle, dmz.stance.ParentHandle) || [])[0];
         groupHandle = (dmz.object.subLinks(stanceHandle, dmz.stance.ForumLink) || [])[0];
      }
      else if (type.isOfType(dmz.stance.MemoType) || type.isOfType(dmz.stance.NewspaperType) ||
              type.isOfType(dmz.stance.VideoType) || type.isOfType(dmz.stance.PDFItem)) {

         stanceHandle = dmz.object.subLinks(stance, dmz.stance.MediaHandle) || [];
         stanceHandle = stanceHandle.filter(function (handle) {

            return dmz.object.type(handle).isOfType(dmz.stance.GroupType);
         });
         if (stanceHandle.length > 1) { result = -1; }
         else { groupHandle = stanceHandle[0]; }
      }
      if (groupHandle) { result = dmz.object.scalar(groupHandle, dmz.stance.ID); }
   }
   return result;
}


Functions.getDataTags = getDataTags;
Functions.getLinkTags = getLinkTags;
Functions.getStanceObject = getStanceObject;
Functions.getGroupID = getGroupID;


(function () {

   dmz.object.allowDefaultAttribute(false);
   Object.keys(ObjectTypes).forEach(function (objectTypeName) {

      dmz.util.defineConst(exports, objectTypeName, ObjectTypes[objectTypeName]);
   });

   Object.keys(Functions).forEach(function (fncName) {

      dmz.util.defineConst(exports, fncName, Functions[fncName]);
   });
}());
