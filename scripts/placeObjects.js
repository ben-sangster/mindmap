var dmz =
   { stance: require("stanceConst")
   , mind: require("mindConst")
   , object: require("dmz/components/object")
   , vector: require("dmz/types/vector")
   }
   // Consts
   , OBJECT_RADIUS = 350
   // Variables
   , voteList = {}
   , objectList = {}
   , timeList = {}
   // Functions
   , breakStr
   , getPosition
   , updateVoteObjectPositions
   , addLink
   , getVoteTime
   , removeLink
   ;

dmz.object.create.observe(self, function (handle, type) {

   if (type.isOfType(dmz.stance.VoteType)) {

      voteList[handle] = { position: false, lastPos: false, links: [], handle: handle };
   }
});

getVoteTime = function (voteHandle) {

   var attr
     , result
     ;

   if (voteList[voteHandle]) {

      switch (dmz.object.scalar(voteHandle, dmz.stance.VoteState)) {
      case dmz.stance.VOTE_DENIED:
      case dmz.stance.VOTE_APPROVAL_PENDING:
         attr = dmz.stance.PostedAtServerTimeHandle;
         break;
      case dmz.stance.VOTE_ACTIVE:
      case dmz.stance.VOTE_YES:
      case dmz.stance.VOTE_NO:
      case dmz.stance.VOTE_EXPIRED:
         attr = dmz.stance.CreatedAtServerTimeHandle;
         break;
      }

      result = dmz.object.timeStamp(voteHandle, attr);
   }
   return result || 0;
};

addLink = function (voteHandle, objectHandle) {

   var currentTime
     , newTime
     , oldHandle
     ;

   if (voteList[voteHandle] && !voteList[objectHandle]) {

      voteList[voteHandle].links.push(objectHandle);
      currentTime = getVoteTime(objectList[objectHandle]);
      newTime = getVoteTime(voteHandle);
      oldHandle = objectList[objectHandle];
      if (!oldHandle || (newTime && (!currentTime || (newTime < currentTime)))) {

         updateVoteObjectPositions(oldHandle);
         objectList[objectHandle] = voteHandle;
         updateVoteObjectPositions(objectList[objectHandle]);
      }
   }
};

removeLink = function (voteHandle, objectHandle) {

   var idx
     , links
     ;
   if (voteList[voteHandle] && !voteList[objectHandle]) {

      idx = voteList[voteHandle].links.indexOf(objectHandle);
      if (idx !== -1) { voteList[voteHandle].links.splice(idx, 1); }
      if (objectList[objectHandle] === voteHandle) {

         links = (dmz.object.subLinks(objectHandle, dmz.mind.CanvasLink) || []);
         links = links.concat(dmz.object.superLinks(objectHandle, dmz.mind.CanvasLink) || []);
         links = links.filter(function (objectHandle) { return voteList[objectHandle]; });
         links.sort(function (vote1, vote2) { return getVoteTime(vote1) - getVoteTime(vote2); });
         objectList[objectHandle] = links[0];
         if (objectList[objectHandle]) {

            updateVoteObjectPositions(voteHandle);
            updateVoteObjectPositions(objectList[objectHandle]);
         }
      }
   }
};

dmz.object.link.observe(self, dmz.mind.CanvasLink,
function (linkObjHandle, attrHandle, superHandle, subHandle) {

   var superType = dmz.object.type(superHandle)
     , subType = dmz.object.type(subHandle)
     ;

   if (superType && subType) {

      if (superType.isOfType(dmz.mind.ToolLinkType) ||
         subType.isOfType(dmz.mind.ToolLinkType)) {}
      else if (voteList[superHandle] && voteList[subHandle]) {}
      else if (voteList[superHandle]) { addLink(superHandle, subHandle); }
      else if (voteList[subHandle]) { addLink(subHandle, superHandle); }
   }
});

dmz.object.unlink.observe(self, dmz.mind.CanvasLink,
function (linkObjHandle, attrHandle, superHandle, subHandle) {

   if (voteList[superHandle]) { removeLink(superHandle, subHandle); }
   else { removeLink(subHandle, superHandle); }
});

getPosition = function (index, length) {

   var angle = -Math.PI;
   if (length > 1) { angle *= (1 - (index / (length - 1))); }
   return dmz.vector.create(Math.cos(angle), 0, Math.sin(angle)).multiply(OBJECT_RADIUS);
};

updateVoteObjectPositions = function (voteHandle) {

   var data = voteList[voteHandle]
     , list
     ;
   if (data && data.position && data.links) {

      list = data.links.filter(function (obj1) { return (objectList[obj1] === voteHandle); });
      list.sort(function (obj1, obj2) {

         return (timeList[obj1] || 0) - (timeList[obj2] || 0);
      });
      list.forEach(function (objectHandle, index) {

         var state = dmz.object.state(objectHandle, dmz.mind.MindState)
           , position = dmz.object.position(objectHandle, dmz.mind.MindPosition)
           , delta
           ;

         if (position && state && state.and(dmz.mind.LockState).bool() && data.lastPos) {

            delta = position.subtract(data.lastPos);
         }
         else { delta = getPosition(index, data.links.length); }
         if (delta) { dmz.object.position(objectHandle, dmz.mind.MindPosition, delta.add(data.position)); }
      });
   }
}

dmz.object.position.observe(self, dmz.mind.MindPosition, function (handle, attr, value, prev) {

   if (voteList[handle]) {

      voteList[handle].position = value;
      voteList[handle].lastPos = prev || value;
      updateVoteObjectPositions(handle);
   }
});

dmz.object.timeStamp.observe(self, dmz.stance.CreatedAtServerTimeHandle, function (handle, attr, value) {

   timeList[handle] = value;
});
