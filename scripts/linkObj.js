var dmz =
      { mind: require("mindConst")
      , defs: require("dmz/runtime/definitions")
      , object: require("dmz/components/object")
      }
   // Variables
   , objectList = {}
   , updateLinkObjPosition
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
