var dmz =
   { mind: require("mindConst")
   , data: require("dmz/runtime/data")
   , object: require("dmz/components/object")
   , messaging: require("dmz/runtime/messaging")
   }
   ;

dmz.messaging.subscribe(self, "Object_Delete_Message",  function (data) {

   var handle = dmz.data.unwrapHandle(data)
     , state
     ;

   if (handle) {

      if (dmz.object.isObject(handle)) {

         dmz.object.unlinkSubObjects(handle, dmz.mind.CanvasLink);
         dmz.object.unlinkSuperObjects(handle, dmz.mind.CanvasLink);
         state = dmz.object.state(handle, dmz.mind.MindState);
         if (!state) {

            if (dmz.object.type(handle).isOfType(dmz.mind.CanvasLinkData)) {}
            else { self.log.error ("Deleting object with no state:", handle); }
         }
         else { dmz.object.state(handle, dmz.mind.MindState, state.unset(dmz.mind.ShowIconState)); }
      }
      else if (dmz.object.isLink(handle)) { dmz.object.unlink(handle); }
   }
});
