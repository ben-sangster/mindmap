var dmz =
   { stance: require("stanceConst")
   , mind: require("mindConst")
   , object: require("dmz/components/object")
   , mask: require("dmz/types/mask")
   , messaging: require("dmz/runtime/messaging")
   , data: require("dmz/runtime/data")
   }
   // Variables
   , Tags = {}
   , CreateMsg = dmz.messaging.create("DisplayObjectMessage")
   ;

dmz.object.data.observe(self, dmz.stance.TagHandle, function (handle, attr, data) {

   var tags = dmz.stance.getTags(data)
     , type = dmz.object.type(handle)
     ;
   tags.forEach(function (tag) {

      if (!Tags[tag]) { Tags[tag] = { votes: [], objects: [] }; }
      if (type.isOfType(dmz.stance.VoteType)) { Tags[tag].votes.push(handle); }
      else { Tags[tag].objects.push(handle); }
   });
});

dmz.messaging.subscribe(self, "Auto_Link_Tags_Message", function () {

   var Links = {};
   Object.keys(Tags).forEach(function (tag) {

      var data = Tags[tag];
      data.votes.forEach(function (voteHandle) {

         data.objects.forEach(function (objectHandle) {

            if (!Links[voteHandle]) { Links[voteHandle] = []; }
            Links[voteHandle].push(objectHandle);
         });
      });
   });
   Object.keys(Links).forEach(function (handleStr) {

      var handle = parseInt(handleStr)
        , state = dmz.object.state(handle, dmz.mind.MindState) || dmz.mask.create()
        ;
      Links[handleStr].forEach(function (objectHandle) {

         var data;
         if (!dmz.object.linkHandle(dmz.mind.CanvasLink, handle, objectHandle) &&
            !dmz.object.linkHandle(dmz.mind.CanvasLink, objectHandle, handle)) {

            if (state.and(dmz.mind.ShowIconState).bool()) {

               data = dmz.data.wrapHandle(objectHandle);
               data.vector(dmz.mind.MindPosition, 0, [0, 0, 0]);
               CreateMsg.send(data);
            }
            dmz.object.link(dmz.mind.CanvasLink, handle, objectHandle);
         }
      });
   });
});
