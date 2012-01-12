var dmz =
   { stance: require("stanceConst")
   , messaging: require("dmz/runtime/messaging")
   , mind: require("mindConst")
   , object: require("dmz/components/object")
   , mask: require("dmz/types/mask")
   , vector: require("dmz/types/vector")
   , data: require("dmz/runtime/data")
   , module: require("dmz/runtime/module")
   }
   // Consts
   , OBJECT_RADIUS = 350
   , MIN_Z = 0
   , MAX_Z = 40000
   , DELTA_RESOLUTION = 3600 // Convert all timestamps from seconds to hours
   // Variables
   , Votes = {}
   , CreateMsg = dmz.messaging.create("DisplayObjectMessage")
   // Functions
   , getPosition
   , getVoteTime
   , getLastLockedVoteZ
   , arrangeVotes
   , addToCanvas
   ;

dmz.object.create.observe(self, function (handle, type) {

   var state;
   if (type.isOfType(dmz.stance.VoteType)) {

      Votes[handle] =
         { handle: handle
         , position: dmz.object.position(handle, dmz.mind.MindServerPosition)
         };

      state = dmz.object.state(handle, dmz.mind.MindState);
      Votes[handle].locked = state && state.and(dmz.mind.LockState).bool();
   }
});

dmz.object.state.observe(self, dmz.mind.MindState, function (handle, attr, value) {

   if (Votes[handle]) { Votes[handle].locked = value.and(dmz.mind.LockState).bool(); }
});

getVoteTime = function (voteHandle) {

   var attr
     , result
     ;
   if (Votes[voteHandle]) {

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
      Votes[voteHandle].time = result || 0;
   }
   return result || 0;
};

getLastLockedVoteZ = function (list) {

   var result = MIN_Z;
   if (list) {

      list.forEach(function (voteHandle) {

         if (Votes[voteHandle] && Votes[voteHandle].position &&
            (Votes[voteHandle].position.z > result)) {

            result = Votes[voteHandle].position.z;
         }
      });
   }
   return result;
};

arrangeVotes = function () {

   var voteList = []
     , minimumDistance = OBJECT_RADIUS * Math.SQRT2 * 1.3
     , nextZ
     , lockedList
     , idx
     , state
     , data
     ;

   Object.keys(Votes).forEach(function (key) { voteList.push(Votes[key].handle); });
   lockedList = voteList.filter(function (voteHandle) { return Votes[voteHandle].locked; });
   voteList.sort(function (vote1, vote2) { return getVoteTime(vote1) - getVoteTime(vote2); });
   voteList = voteList.filter(function (voteHandle) { return !Votes[voteHandle].locked; });

   if (dmz.stance.isAllowed(dmz.object.hil(), dmz.stance.TagDataFlag)) {

      for (idx = 0; idx < voteList.length; idx += 1) {

         if (!idx) { nextZ = getLastLockedVoteZ(lockedList) + minimumDistance; }
         else { nextZ += minimumDistance; }
         state = dmz.object.state(voteList[idx], dmz.mind.MindState) || dmz.mask.create();
         if (!state.and(dmz.mind.ShowIconState).bool()) {

            addToCanvas(voteList[idx], [0, 0, nextZ]);
         }
         else { dmz.object.position(voteList[idx], dmz.mind.MindServerPosition, [0, 0, nextZ]); }
      }
   }
};

dmz.object.position.observe(self, dmz.mind.MindServerPosition, function (handle, attr, value) {

   if (Votes[handle]) { Votes[handle].position = value; }
});

dmz.messaging.subscribe(self, "Vote_Auto_Place_Message",  arrangeVotes);
dmz.module.subscribe(self, "dataDock", function (Mode, module) {

   if (Mode === dmz.module.Activate) { addToCanvas = module.addToCanvas; }
});
