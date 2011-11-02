var dmz =
   { stance: require("stanceConst")
   , mind: require("mindConst")
   , object: require("dmz/components/object")
   , mask: require("dmz/types/mask")
   , messaging: require("dmz/runtime/messaging")
   }
   // Variables
   , Tags = {}
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

      var handle = parseInt(handleStr);
      Links[handleStr].forEach(function (objectHandle) {

         if (!dmz.object.linkHandle(dmz.mind.CanvasLink, handle, objectHandle) &&
            !dmz.object.linkHandle(dmz.mind.CanvasLink, objectHandle, handle)) {

            dmz.object.link(dmz.mind.CanvasLink, handle, objectHandle);
         }
      });
   });
});
