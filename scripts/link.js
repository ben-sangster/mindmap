var dmz =
      { mind: require("mindConst")
      , data: require("dmz/runtime/data")
      , defs: require("dmz/runtime/definitions")
      , mask: require("dmz/types/mask")
      , messaging: require("dmz/runtime/messaging")
      , object: require("dmz/components/object")
      , objectType: require("dmz/runtime/objectType")
      , module: require("dmz/runtime/module")
      }
   // Variables
   , _firstHandle = dmz.object.create(dmz.mind.ToolLinkType)
   , _secondHandle = dmz.object.create(dmz.mind.ToolLinkType)
   , _toolLink
   , _startNode
   , Exiting = false
   , addToCanvas
   ;

dmz.messaging.subscribe(self, "DMZ_NORMAL_EXIT_MESSAGE", function () { Exiting = true; });

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

         pos = dmz.object.position(_startNode, dmz.mind.MindPosition);

         if (pos) {

            dmz.object.position(_firstHandle, dmz.mind.MindPosition, pos);
            dmz.object.position(_secondHandle, dmz.mind.MindPosition, pos);
            _toolLink = dmz.object.link(dmz.mind.CanvasLink, _firstHandle, _secondHandle);
         }
      }
   }
});

dmz.messaging.subscribe(self, "Update_Link_Position_Message", function (data) {

   var pos;
   if (data) {

      pos = data.vector("position", 0);
      if (pos && _secondHandle) { dmz.object.position(_secondHandle, dmz.mind.MindPosition, pos); }
   }
});

dmz.messaging.subscribe(self, "Second_Link_Object_Message", function (data) {

   var handle
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

            linkHandle = dmz.object.link(dmz.mind.CanvasLink, _startNode, endNode);
            if (linkHandle) {

               handle = dmz.object.create(dmz.mind.CanvasLinkData);
               dmz.object.activate(handle);
               dmz.object.linkAttributeObject(linkHandle, handle);
            }
         }
      }
   }

   _startNode = null;
});

dmz.messaging.subscribe(self, "Failed_Link_Objects_Message", function () {

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
     , state
     , linkHandle
     , handle
     ;

   if (superType && subType) {

      if (superType.isOfType(dmz.mind.ToolLinkType) ||
         subType.isOfType(dmz.mind.ToolLinkType)) {

      }
      else {

         linkHandle =
            dmz.object.linkHandle(dmz.mind.ServerLink, superHandle, subHandle) ||
            dmz.object.linkHandle(dmz.mind.ServerLink, subHandle, superHandle) ||
            dmz.object.link(dmz.mind.ServerLink, superHandle, subHandle);
         if (linkHandle) {

            state = dmz.object.state(superHandle, dmz.mind.MindState);
            if (!state || !state.and(dmz.mind.ShowIconState).bool()) { addToCanvas(superHandle); }

            state = dmz.object.state(subHandle, dmz.mind.MindState);
            if (!state || !state.and(dmz.mind.ShowIconState).bool()) { addToCanvas(subHandle); }

            if (dmz.object.state(superHandle, dmz.mind.MindState))
            handle = dmz.object.linkAttributeObject(linkHandle) || dmz.object.create(dmz.mind.LinkData);
            dmz.object.flag(handle, dmz.mind.MindActive, true);
            if (!dmz.object.isActivated(handle)) { dmz.object.activate(handle); }
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

   if (dmz.object.flag(linkObjHandle, dmz.mind.MindActive)) {

      linkHandle =
         dmz.object.linkHandle(dmz.mind.CanvasLink, superHandle, subHandle) ||
         dmz.object.linkHandle(dmz.mind.CanvasLink, subHandle, superHandle) ||
         dmz.object.link(dmz.mind.CanvasLink, superHandle, subHandle);

      if (linkHandle) {

         handle = dmz.object.linkAttributeObject(linkHandle) || dmz.object.create(dmz.mind.CanvasLinkData);
         if (!dmz.object.isActivated(handle)) { dmz.object.activate(handle); }
         dmz.object.linkAttributeObject(linkHandle, handle);
      }
   }
});

dmz.object.unlink.observe(self, dmz.mind.CanvasLink,
function (linkObjHandle, attrHandle, superHandle, subHandle) {

   var linkHandle
     , handle
     ;

   linkHandle =
      dmz.object.linkHandle(dmz.mind.ServerLink, superHandle, subHandle) ||
      dmz.object.linkHandle(dmz.mind.ServerLink, subHandle, superHandle);

   if (linkHandle && !Exiting) {

      handle = dmz.object.linkAttributeObject(linkHandle);
      dmz.object.flag(handle, dmz.mind.MindActive, false);
   }
   if (linkObjHandle) { dmz.object.destroy(linkObjHandle); }
});

dmz.object.linkAttributeObject.observe(self, dmz.mind.ServerLink,
function (linkHandle, attrHandle, superHandle, subHandle, attrObjHandle, prevAttrObjHandle) {

   var linkHandle
     , handle
     ;

   if (dmz.object.flag(attrObjHandle, dmz.mind.MindActive)) {

      linkHandle =
         dmz.object.linkHandle(dmz.mind.CanvasLink, superHandle, subHandle) ||
         dmz.object.linkHandle(dmz.mind.CanvasLink, subHandle, superHandle) ||
         dmz.object.link(dmz.mind.CanvasLink, superHandle, subHandle);

      if (linkHandle) {

         handle = dmz.object.linkAttributeObject(linkHandle) || dmz.object.create(dmz.mind.CanvasLinkData);
         if (!dmz.object.isActivated(handle)) { dmz.object.activate(handle); }
         dmz.object.linkAttributeObject(linkHandle, handle);
      }
   }
});

dmz.object.flag.observe(self, dmz.mind.MindActive, function (handle, attr, value, prev) {

   var links = dmz.object.attributeObjectLinks(handle) || [];
   links.forEach(function (linkHandle) {

      var linkedObjects = dmz.object.linkedObjects(linkHandle)
        , linkHandle
        ;

      if (linkedObjects.super && linkedObjects.sub &&
         (linkedObjects.attribute == dmz.mind.ServerLink)) {

         linkHandle =
            dmz.object.linkHandle(dmz.mind.CanvasLink, linkedObjects.super, linkedObjects.sub) ||
            dmz.object.linkHandle(dmz.mind.CanvasLink, linkedObjects.sub, linkedObjects.super);
         if (linkHandle && !value && prev) { dmz.object.unlink(linkHandle); }
         else if (!linkHandle && value && (prev === false)) {

            dmz.object.link(dmz.mind.CanvasLink, linkedObjects.super, linkedObjects.sub);
         }
      }
   });
});

dmz.module.subscribe(self, "dataDock", function (Mode, module) {

   if (Mode === dmz.module.Activate) { addToCanvas = module.addToCanvas; }
});
