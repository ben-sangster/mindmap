var dmz =
   { mind: require("mindConst")
   , data: require("dmz/runtime/data")
   , object: require("dmz/components/object")
   , mask: require("dmz/types/mask")
   , messaging: require("dmz/runtime/messaging")
   }
   ;

dmz.messaging.subscribe(self, "Object_Lock_Message",  function (data) {

   var handle = dmz.data.unwrapHandle(data)
     , state
     ;

   if (handle && dmz.object.isObject(handle) && dmz.stance.isAllowed(dmz.object.hil(), dmz.stance.TagDataFlag)) {

      if (dmz.object.type(handle).isOfType(dmz.mind.CanvasLinkData)) {}
      else {

         state = dmz.object.state(handle, dmz.mind.MindState);
         if (!state) { self.log.error ("Locking object with no state:", handle); }
         else {

            dmz.object.state(
               handle,
               dmz.mind.MindState,
               state.and(dmz.mind.LockState).bool() ?
                  state.unset(dmz.mind.LockState) :
                  state.or(dmz.mind.LockState));
         }
      }
   }
});
