var dmz =
      { mind: require("mindConst")
      , stance: require("stanceConst")
      , defs: require("dmz/runtime/definitions")
      , object: require("dmz/components/object")
      , mask: require("dmz/types/mask")
      }
   // Variables
   , objectList = {}
   , updateLinkObjPosition
   , updateLinkFlow
   ;

updateLinkObjPosition = function (handle) {

   var list = objectList[handle];
   if (list) {

      Object.keys(list).forEach(function (index) {

         var link = list[index]
           , superPos = dmz.object.position(link.superLink, dmz.mind.MindPosition)
           , subPos = dmz.object.position(link.subLink, dmz.mind.MindPosition)
           , attrPos
           ;

         if (superPos && subPos) {

            attrPos = superPos.add((subPos.subtract(superPos)).multiply(0.5));
            dmz.object.position(link.attr, dmz.mind.MindPosition, attrPos);
         }
      });
   }
};

updateLinkFlow = function (superHandle, subHandle, attrObjHandle) {

   var superTime
     , subTime
     , state
     ;

   superTime =
      dmz.object.timeStamp(superHandle, dmz.stance.PostedAtServerTimeHandle) ||
      dmz.object.timeStamp(superHandle, dmz.stance.CreatedAtServerTimeHandle);
   subTime =
      dmz.object.timeStamp(subHandle, dmz.stance.PostedAtServerTimeHandle) ||
      dmz.object.timeStamp(subHandle, dmz.stance.CreatedAtServerTimeHandle);
   if (superTime && subTime) {

      state = dmz.object.state(attrObjHandle, dmz.mind.MindState) || dmz.mask.create();
      state = state.unset(dmz.mind.FlowForwardState.or(dmz.mind.FlowReverseState));
      self.log.warn (superHandle, subHandle, superTime, subTime, (superTime <= subTime) ? "Forward" : "Reverse");
      dmz.object.state(
         attrObjHandle,
         dmz.mind.MindState,
         state.or((superTime <= subTime) ? dmz.mind.FlowForwardState : dmz.mind.FlowReverseState));
   }
};

dmz.object.position.observe(self, dmz.mind.MindPosition, updateLinkObjPosition);
dmz.object.destroy.observe(self, function (handle) {

   var list = objectList[handle];
   if (list) {

      Object.keys(list).forEach(function (index) {

         var link = list[index];
         if (objectList[link.superLink]) { delete objectList[link.superLink][link.linkHandle]; }
         if (objectList[link.subLink]) { delete objectList[link.subLink][link.linkHandle]; }
      });
      delete objectList[handle];
   }
});

dmz.object.linkAttributeObject.observe(self, dmz.mind.CanvasLink,
function (linkHandle, attrHandle, superHandle, subHandle, attrObjHandle, prevAttrObjHandle) {

   var link;
   if (attrObjHandle) {

      link = { superLink: superHandle, subLink: subHandle, attr: attrObjHandle, linkHandle: linkHandle };
      if (!objectList[superHandle]) { objectList[superHandle] = {}; }
      objectList[superHandle][linkHandle] = link;
      if (!objectList[subHandle]) { objectList[subHandle] = {}; }
      objectList[subHandle][linkHandle] = link;
      updateLinkFlow(superHandle, subHandle, attrObjHandle);
      updateLinkObjPosition(superHandle);
   }
   else if (objectList[superHandle] && objectList[superHandle][linkHandle] &&
         (objectList[superHandle][linkHandle].attr === prevAttrObjHandle)) {

      delete objectList[superHandle][linkHandle];
      delete objectList[subHandle][linkHandle];
   }
   if (prevAttrObjHandle && dmz.object.isObject(prevAttrObjHandle)) {

      dmz.object.destroy(prevAttrObjHandle);
   }
});

dmz.object.timeStamp.observe(self, dmz.stance.PostedAtServerTime, function (handle, attr, value) {

   if (objectList[handle]) {

      updateLinkFlow(objectList[handle].superLink, objectList[handle].subLink, objectList[handle].attr);
   }
});

dmz.object.timeStamp.observe(self, dmz.stance.CreatedAtServerTime, function (handle, attr, value) {

   if (objectList[handle]) {

      updateLinkFlow(objectList[handle].superLink, objectList[handle].subLink, objectList[handle].attr);
   }
});
