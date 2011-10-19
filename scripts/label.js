var dmz =
   { stance: require("stanceConst")
   , mind: require("mindConst")
   , object: require("dmz/components/object")
   }
   ;


dmz.object.data.observe(self, dmz.stance.TagHandle, function (handle, attr, data) {

   var links;
   dmz.object.text(handle, dmz.mind.MindLabel, dmz.stance.getTags(data).toString());
   links = dmz.object.superLinks(handle, dmz.mind.ServerLink) || [];
   links.forEach(function (superHandle) {

      var linkHandle = dmz.object.linkHandle(dmz.mind.ServerLink, superHandle, handle);
      dmz.object.text(
         dmz.object.linkAttributeObject(linkHandle),
         dmz.mind.MindLabel,
         dmz.mind.getLinkTags(superHandle, handle));
   });
   links = dmz.object.subLinks(handle, dmz.mind.ServerLink) || [];
   links.forEach(function (subHandle) {

      var linkHandle = dmz.object.linkHandle(dmz.mind.ServerLink, handle, subHandle);
      dmz.object.text(
         dmz.object.linkAttributeObject(linkHandle),
         dmz.mind.MindLabel,
         dmz.mind.getLinkTags(handle, subHandle));
   });
});

dmz.object.linkAttributeObject.observe(self, dmz.mind.CanvasLink,
function (linkHandle, attrHandle, superHandle, subHandle, attrObjHandle, prevAttrObjHandle) {

   dmz.object.text(
      attrObjHandle,
      dmz.mind.MindLabel,
      dmz.mind.getLinkTags(superHandle, subHandle).toString());
});
