var dmz =
      { consts: require("cssConst")
      , data: require("dmz/runtime/data")
      , defs: require("dmz/runtime/definitions")
      , mask: require("dmz/types/mask")
      , messaging: require("dmz/runtime/messaging")
      , object: require("dmz/components/object")
      , objectType: require("dmz/runtime/objectType")
      , undo: require("dmz/runtime/undo")
      }
   // Constants
   , NetType = dmz.objectType.lookup("Network Node")
   // Functions
   , _findWhiteList
   // Variables
   , _firstHandle = dmz.object.create("Tool Link Node")
   , _secondHandle = dmz.object.create("Tool Link Node")
   , _toolLink
   , _startNode
   , _typeCache = {}
   ;


(function () {

   if (_firstHandle) { dmz.object.activate(_firstHandle); }
   if (_secondHandle) { dmz.object.activate(_secondHandle); }
}());

_findWhiteList = function (type) {

   var result = _typeCache[type.name()]
     , list
     ;

   if (!result) {

      list = type.find("link-list.object-type").config().get("link-list.object-type");

      result = [];

      list.forEach(function (config) {

         var type = config.objectType("name");
         if (type) { result.push(type); }
         else { self.log.error ("Unknown object type:", config.string("name")); }
      });

      _typeCache[type.name()] = result;
   }

   return result;
};

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
            _toolLink = dmz.object.link(dmz.consts.NetLink, _firstHandle, _secondHandle);
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
     ;

   if (_toolLink) {

      dmz.object.unlink(_toolLink);
      _toolLink = null;
   }

   if (dmz.data.isTypeOf(data)) {

      handle = data.handle("object", 0);

      if (handle) {


         if (handle === _startNode) {

            _startNode = null;
            handle = null;
         }
         else if (dmz.object.isObject(handle) && _startNode) {

            undo = dmz.undo.startRecord("Create Network Link");

            linkHandle = dmz.object.link(dmz.consts.NetLink, _startNode, handle);

            if (dmz.object.isLink(linkHandle)) {

               dmz.undo.stopRecord(undo);
            }
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
