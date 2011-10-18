var dmz =
   { stance: require("stanceConst")
   , mind: require("mindConst")
   , object: require("dmz/components/object")
   }
   ;


dmz.object.data.observe(self, dmz.stance.TagHandle, function (handle, attr, data) {

   var links;
   // Set individual item tag label
   dmz.object.text(handle, dmz.mind.MindLabel, dmz.stance.getTags(data).toString());
   // If linked, get all link attribute objects and update their labels
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

   self.log.warn ("LAO:", linkHandle, attrHandle, superHandle, subHandle, attrObjHandle);
   if (dmz.object.type(superHandle).isOfType(dmz.mind.ToolLinkType) ||
      dmz.object.type(subHandle).isOfType(dmz.mind.ToolLinkType)) {

      // Is this check necessary?
      self.log.error ("LAO with tool type"); // determine if check is necessary
   }
   else {

      self.log.warn ("LinkLabel:", attrObjHandle, dmz.mind.getLinkTags(superHandle, subHandle).toString());
      dmz.object.text(
         attrObjHandle,
         dmz.mind.MindLabel,
         dmz.mind.getLinkTags(superHandle, subHandle).toString());
   }
});
