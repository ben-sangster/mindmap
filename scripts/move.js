var dmz =
       { data: require("dmz/runtime/data")
       , messaging: require("dmz/runtime/messaging")
       , object: require("dmz/components/object")
       , undo: require("dmz/runtime/undo")
       , vector: require("dmz/types/vector")
       , mind: require("mindConst")
       , stance: require("stanceConst")
       }
  // Variables
  , _firstMove = false
  , _item
  , _offset
  , _pos
  ;

dmz.messaging.subscribe(self, "Select_Object_Message", function (data) {

  if (data) { dmz.object.select(data.handle("object", 0)); }
});

dmz.messaging.subscribe(self, "Select_Move_Object_Message", function (data) {

   var pos
     , state
     ;

   _firstMove = true;

   if (data) {

      _item = data.handle("object", 0);
      _offset = data.vector("position", 0);
      dmz.object.select(_item);
      state = dmz.object.state(_item, dmz.mind.MindState);

      if (_item && _offset && dmz.object.isObject(_item) &&
         (!state || !state.and(dmz.mind.LockState).bool())) {

         pos = dmz.object.position(_item, dmz.mind.MindPosition);

         if (pos) { _offset = pos.subtract(_offset); }
         else { _offset = dmz.vector.create(); }
      }
      else {

         _item = null;
         _offset = null;
      }
   }
});

dmz.messaging.subscribe(self, "Unselect_Move_Object_Message", function (data) {

   if (_item && _pos && dmz.stance.isAllowed(dmz.object.hil(), dmz.stance.TagDataFlag)) {

      dmz.object.position(_item, dmz.mind.MindServerPosition, _pos);
   }

   _item = null;
   _offset = null;
   _firstMove = false;
   _pos = false;
});

dmz.messaging.subscribe(self, "Move_Selected_Object_Message", function (data) {

   var undo
     , pos
     ;

   if (_item && data) {

      if (_firstMove) {

         undo = dmz.undo.startRecord("Move Node");
         _firstMove = false;
      }

      pos = data.vector("position", 0);

      if (_item && pos) {

         _pos = pos.add(_offset);
         dmz.object.position(_item, dmz.mind.MindPosition, _pos);
      }

      if (undo) {  dmz.undo.stopRecord(undo); }
   }
});

dmz.object.position.observe(self, dmz.mind.MindServerPosition, function (handle, attr, value) {

   var canvas = dmz.object.position(handle, dmz.mind.MindPosition);
   if (!canvas || (canvas.x != value.x) || (canvas.y != value.y) || (canvas.z != value.z)) {

      dmz.object.position(handle, dmz.mind.MindPosition, value);
   }
});
