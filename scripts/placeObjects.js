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

      voteList[handle] = { position: false, links: [], handle: handle };
   }
});

getVoteTime = function (voteHandle) {

   var attr
     , result
     ;
   if (voteList[voteHandle]) {

      if (dmz.object.scalar(voteHandle, dmz.stance.VoteState) === dmz.stance.VOTE_DENIED) {

         attr = dmz.stance.PostedAtServerTimeHandle;
      }
      else { attr = dmz.stance.CreatedAtServerTimeHandle; }
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
            if (idx !== -1) {

               voteList[objData[0]].links.splice(idx, 1);
               updateVoteObjectPositions(objData[0]);
            }
            voteList[voteHandle].links.push(objectHandle);
            updateVoteObjectPositions(voteHandle);
         }
      }
      else {

         voteList[voteHandle].links.push(objectHandle);
         updateVoteObjectPositions(voteHandle);
      }

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
         updateVoteObjectPositions(voteHandle);
         idx = objectList[objectHandle].indexOf(voteHandle);
         if (idx !== -1) {

            objectList[objectHandle].splice(idx, 1);
            if ((idx === 0) && objectList[objectHandle].length) {

               item = voteList[objectList[objectHandle][0]];
               if (item) {

                  item.links.push(objectHandle);
                  updateVoteObjectPositions(item.handle);
               }
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

getPosition = function (ratio) {

//   var angle = -((ratio * 5 * Math.PI / 4) - (Math.PI / 8));
   var angle = -(ratio * Math.PI);
   return dmz.vector.create(Math.cos(angle), 0, Math.sin(angle)).multiply(OBJECT_RADIUS);
};

updateVoteObjectPositions = function (voteHandle) {

   var data = voteList[voteHandle]
     , length
     ;
   if (data && data.position) {

      length = (data.links.length > 1) ? (data.links.length - 1) : 1;
      data.links.forEach(function (objectHandle, index) {

         dmz.object.position(
            objectHandle,
            dmz.mind.MindPosition,
            data.position.add(getPosition(index / data.links.length)));
      });
   }
}

dmz.object.position.observe(self, dmz.mind.MindPosition, function (handle, attr, value, prev) {

   if (voteList[handle]) {

      voteList[handle].position = value;
      updateVoteObjectPositions(handle);
   }
});
