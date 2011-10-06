var dmz =
      { consts: require("cssConst")
      , data: require("dmz/runtime/data")
      , defs: require("dmz/runtime/definitions")
      , mask: require("dmz/types/mask")
      , mind: require("mindConst")
      , messaging: require("dmz/runtime/messaging")
      , object: require("dmz/components/object")
      , objectType: require("dmz/runtime/objectType")
      , undo: require("dmz/runtime/undo")
      }
   // Variables
   , _firstHandle = dmz.object.create(dmz.mind.ToolLinkType)
   , _secondHandle = dmz.object.create(dmz.mind.ToolLinkType)
   , _toolLink
   , _startNode
   ;


(function () {

   if (_firstHandle) { dmz.object.activate(_firstHandle); }
   if (_secondHandle) { dmz.object.activate(_secondHandle); }
}());

dmz.messaging.subscribe(self, "First_Link_Object_Message", function (data) {

   var handle
     , pos
     ;

   if (_toolLink) {

      dmz.object.unlink(_toolLink);
      _toolLink = null;
   }

   _startNode = null;

   if (dmz.data.isTypeOf(data)) {

      handle = data.handle("object", 0);

      if (handle && dmz.object.isObject(handle)) {

         _startNode = handle;
      }

      if (_startNode && _firstHandle && _secondHandle) {

         pos = dmz.object.position(_startNode);

         if (pos) {

            dmz.object.position(_firstHandle, null, pos);
            dmz.object.position(_secondHandle, null, pos);
            _toolLink = dmz.object.link(dmz.consts.CanvasLink, _firstHandle, _secondHandle);
         }
      }
   }
});

dmz.messaging.subscribe(self, "Update_Link_Position_Message", function (data) {

   var pos;
   if (data) {

      pos = data.vector("position", 0);
      if (pos && _secondHandle) { dmz.object.position(_secondHandle, null, pos); }
   }
});

dmz.messaging.subscribe(self, "Second_Link_Object_Message", function (data) {

   var handle
     , undo
     , linkHandle
     , endNode
     ;

   if (_toolLink) {

      dmz.object.unlink(_toolLink);
      _toolLink = null;
   }

   if (dmz.data.isTypeOf(data)) {

      endNode = data.handle("object", 0);
      if (endNode) {

         if (endNode === _startNode) {

            _startNode = null;
            endNode = null;
         }
         else if (dmz.object.isObject(endNode) && _startNode) {

            undo = dmz.undo.startRecord("Create Network Link");
            linkHandle = dmz.object.link(dmz.consts.CanvasLink, _startNode, endNode);
            if (linkHandle) {

               handle = dmz.object.create(dmz.mind.CanvasLinkData);
               dmz.object.flag(handle, dmz.mind.ActiveHandle, true);
               dmz.object.text(
                  handle,
                  dmz.mind.LabelHandle,
                  dmz.mind.getLinkTags(_startNode, endNode).toString());
               dmz.object.activate(handle);
               dmz.object.linkAttributeObject(linkHandle, handle);
            }

            if (dmz.object.isLink(linkHandle)) { dmz.undo.stopRecord(undo); }
            else { dmz.undo.abortRecord(undo); }
         }
      }
   }

   _startNode = null;
});

dmz.messaging.subscribe(self, "Failed_Link_Objects_Message", function () {

   var state
     ;

   if (_toolLink) {

      dmz.object.unlink(_toolLink);
      _toolLink = null;
   }

   _startNode = null;
});

dmz.object.link.observe(self, dmz.mind.CanvasLink,
function (linkObjHandle, attrHandle, superHandle, subHandle) {

   var superType = dmz.object.type(superHandle)
     , subType = dmz.object.type(subHandle)
     , linkHandle
     , handle
     ;

   if (superType && !superType.isOfType(dmz.mind.ToolLinkType) &&
      subType && !subType.isOfType(dmz.mind.ToolLinkType)) {

      if (!dmz.object.linkHandle(dmz.mind.ServerLink, superHandle, subHandle)) {

         linkHandle = dmz.object.link(dmz.mind.ServerLink, superHandle, subHandle);
         if (linkHandle) {

            handle = dmz.object.create(dmz.mind.LinkData);
            dmz.object.flag(handle, dmz.mind.ActiveHandle, true);
            dmz.object.text(
               handle,
               dmz.mind.LabelHandle,
               dmz.mind.getLinkTags(superHandle, subHandle).toString());
            dmz.object.activate(handle);
            dmz.object.linkAttributeObject(linkHandle, handle);
         }
      }
   }
});

dmz.object.link.observe(self, dmz.mind.ServerLink,
function (linkObjHandle, attrHandle, superHandle, subHandle) {

   var handle
     , linkHandle
     ;

   if (dmz.object.flag(linkObjHandle, dmz.mind.ActiveHandle) &&
      !dmz.object.linkHandle(dmz.mind.CanvasLink, superHandle, subHandle)) {

      linkHandle = dmz.object.link(dmz.mind.CanvasLink, superHandle, subHandle);
      if (linkHandle) {

         handle = dmz.object.create(dmz.mind.CanvasLinkData);
         dmz.object.flag(handle, dmz.mind.ActiveHandle, true);
         dmz.object.text(
            handle,
            dmz.mind.LabelHandle,
            dmz.mind.getLinkTags(superHandle, subHandle).toString());
         dmz.object.activate(handle);
         dmz.object.linkAttributeObject(linkHandle, handle);
      }
   }
});

dmz.object.unlink.observe(self, dmz.mind.CanvasLink,
function (linkObjHandle, attrHandle, superHandle, subHandle) {

   var linkHandle = dmz.object.linkHandle(dmz.mind.ServerLink, superHandle, subHandle)
     , handle
     ;

   if (linkHandle) {

      handle = dmz.object.linkAttributeObject(linkHandle);
      dmz.object.flag(handle, dmz.stance.ActiveHandle, false);
   }
   if (linkObjHandle) { dmz.object.destroy(linkObjHandle); }
});

dmz.object.flag.observe(self, dmz.mind.ActiveHandle, function (handle, attr, value, prev) {

   var links = dmz.object.attributeObjectLinks(handle) || []
     ;

   links.forEach(function (linkHandle) {

      var linkedObjects = dmz.object.linkedObjects(linkHandle)
        , linkHandle
        ;

      if (linkedObjects.super && linkedObjects.sub &&
         (linkedObjects.attribute === dmz.mind.ServerLink)) {

         linkHandle = dmz.object.linkHandle(dmz.mind.CanvasLink, linkedObjects.super, linkedObjects.sub);
         if (linkHandle && !value && prev) {

            dmz.object.unlink(dmz.mind.CanvasLink, linkedObjects.super, linkedObjects.sub);
         }
         else if (!linkHandle && value && (prev === false)) {

            dmz.object.link(dmz.mind.CanvasLink, linkedObjects.super, linkedObjects.sub);
         }
      }
   });
});
