var dmz =
   { mind: require("mindConst")
   , data: require("dmz/runtime/data")
   , object: require("dmz/components/object")
   , messaging: require("dmz/runtime/messaging")
   , stance: require("stanceConst")
   }
   ;

dmz.messaging.subscribe(self, "Object_Delete_Message",  function (data) {

   var handle = dmz.data.unwrapHandle(data)
     , state
     , links
     ;

   if (handle && dmz.stance.isAllowed(dmz.object.hil(), dmz.stance.TagDataFlag)) {

      if (dmz.object.isObject(handle)) {

         if (dmz.object.type(handle).isOfType(dmz.mind.CanvasLinkData)) {

            links = dmz.object.attributeObjectLinks(handle);
            links.forEach(dmz.object.unlink);
         }
         else {

            dmz.object.unlinkSubObjects(handle, dmz.mind.CanvasLink);
            dmz.object.unlinkSuperObjects(handle, dmz.mind.CanvasLink);
            state = dmz.object.state(handle, dmz.mind.MindState);
            if (!state) {

               if (dmz.object.type(handle).isOfType(dmz.mind.CanvasLinkData)) {}
               else { self.log.error ("Deleting object with no state:", handle); }
            }
            else {

               dmz.object.state(
                  handle,
                  dmz.mind.MindState,
                  state.unset(dmz.mind.ShowIconState.or(dmz.mind.LockState)));
            }
         }
      }
      else if (dmz.object.isLink(handle)) { dmz.object.unlink(handle); }
   }
});
