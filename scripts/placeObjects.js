var dmz =
   { stance: require("stanceConst")
   , mind: require("mindConst")
   , object: require("dmz/components/object")
   , vector: require("dmz/types/vector")
   }
   // Consts
   , OBJECT_RADIUS = 700
   // Variables
   , voteList = {}
   , objectList = {}
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

   var currTime
     , nextTime
     , objData = objectList[objectHandle]
     , idx
     ;

   if (voteList[voteHandle]) {

      if (!objData) { objectList[objectHandle] = []; objData = objectList[objectHandle]; }

      if (objData.length) {

         currTime = getVoteTime(objData[0]);
         nextTime = getVoteTime(voteHandle);
         if (nextTime && (nextTime < currTime)) {

            idx = voteList[objData[0]].links.indexOf(objectHandle);
            if (idx !== -1) { voteList[objData[0]].links.splice(idx, 1); }
            voteList[voteHandle].links.push(objectHandle);
         }
      }
      else { voteList[voteHandle].links.push(objectHandle); }

      if (objectList[objectHandle].indexOf(voteHandle) === -1) {

         objectList[objectHandle].push(voteHandle);
      }
      objectList[objectHandle].sort(function (vote1, vote2) {

         return getVoteTime(vote1) - getVoteTime(vote2);
      });
   }
};

dmz.object.link.observe(self, dmz.mind.CanvasLink,
function (linkObjHandle, attrHandle, superHandle, subHandle) {

   var superType = dmz.object.type(superHandle)
     , subType = dmz.object.type(subHandle)
     , currTime
     , nextTime
     ;

   if (superType && subType) {

      if (superType.isOfType(dmz.mind.ToolLinkType) ||
         subType.isOfType(dmz.mind.ToolLinkType)) {}
      else if (voteList[superHandle] && voteList[subHandle]) {} // Don't move votes when connected votes move
      else if (voteList[superHandle]) { addLink(superHandle, subHandle); }
      else if (voteList[subHandle]) { addLink(subHandle, superHandle); }
   }
});

removeLink = function (voteHandle, objectHandle) {

   var item = voteList[voteHandle]
     , idx
     ;

   if (item && !voteList[objectHandle]) {

      idx = item.links.indexOf(objectHandle);
      if (idx !== -1) {

         item.links.splice(idx, 1);
         idx = objectList[objectHandle].indexOf(voteHandle);
         if (idx !== -1) {

            objectList[objectHandle].splice(idx, 1);
            if ((idx === 0) && objectList[objectHandle].length) {

               item = voteList[objectList[objectHandle][0]];
               if (item) { item.links.push(objectHandle); }
            }
         }
      }
   }
};

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

updateVoteObjectPositions = function (voteHandle, attr) {

   var data = voteList[voteHandle];
   if (data && data.position && data.links) {

      data.links.forEach(function (objectHandle, index) {

         var state = dmz.object.state(objectHandle, dmz.mind.MindState)
           , position = dmz.object.position(objectHandle, attr)
           , delta
           ;

         if (position && state && state.and(dmz.mind.LockState).bool() && data.lastPos) {

            delta = position.subtract(data.lastPos);
         }
         else { delta = getPosition(index, data.links.length); }
         if (delta) { dmz.object.position(objectHandle, attr, delta.add(data.position)); }
      });
   }
}

dmz.object.position.observe(self, dmz.mind.MindPosition, function (handle, attr, value, prev) {

   if (voteList[handle]) {

      voteList[handle].position = value;
      voteList[handle].lastPos = prev;
      updateVoteObjectPositions(handle, attr);
   }
});
