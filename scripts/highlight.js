var dmz =
      { defs: require("dmz/runtime/definitions")
      , data: require("dmz/runtime/data")
      , object: require("dmz/components/object")
      , message: require("dmz/runtime/messaging")
      , mask: require("dmz/types/mask")
      , mind: require("mindConst")
      }
   // variables
   , _object = 0
   ;

dmz.message.subscribe (self, "Mouse_Move_Message", function (data) {

   var handle
     , state
     , prev
     ;

   if (dmz.data.isTypeOf(data)) {

      handle = data.handle("object", 0);
      if (handle && dmz.object.isLink(handle)) {

         handle = dmz.object.linkAttributeObject(handle);
      }

      if (handle && dmz.object.isObject(handle)) {

         state = dmz.object.state(handle, dmz.mind.MindState) || dmz.mask.create();
         state = state.or(dmz.mind.HighlightState);
         dmz.object.state(handle, dmz.mind.MindState, state);
      }

      if (handle !== _object) {

         if (_object) {

            prev = _object;
            _object = handle;
            if (dmz.object.isObject(prev)) {

               state = dmz.object.state(prev, dmz.mind.MindState);
               if (state && state.contains(dmz.mind.HighlightState)) {

                  state = state.unset(dmz.mind.HighlightState);
                  dmz.object.state(prev, dmz.mind.MindState, state);
               }
            }
         }
         else { _object = handle; }
      }
   }
});

