var dmz =
   { stance: require("stanceConst")
   , messaging: require("dmz/runtime/messaging")
   , mind: require("mindConst")
   , object: require("dmz/components/object")
   , mask: require("dmz/types/mask")
   , vector: require("dmz/types/vector")
   }
   // Consts
   , OBJECT_RADIUS = 700
   , MIN_Z = 0
   , MAX_Z = 40000
   // Variables
   , Votes = {}
   // Functions
   , getPosition
   , getVoteTime
   , getLastLockedVoteZ
   , arrangeVotes
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
     , nextZ = MIN_Z + minimumDistance
     , lockedList
     ;

   Object.keys(Votes).forEach(function (key) { voteList.push(Votes[key].handle); });
   voteList = voteList.filter(function (voteHandle) {

      var state = dmz.object.state(voteHandle, dmz.mind.MindState) || dmz.mask.create();
      return state.and(dmz.mind.ShowIconState).bool();
   });
   lockedList = voteList.filter(function (voteHandle) { return Votes[voteHandle].locked; });
   nextZ = getLastLockedVoteZ(lockedList) + minimumDistance;
   voteList = voteList.filter(function (voteHandle) { return !Votes[voteHandle].locked; });
   voteList.sort(function (vote1, vote2) { return getVoteTime(vote1) - getVoteTime(vote2); });
   voteList.forEach(function (voteHandle, index) {

      dmz.object.position(voteHandle, dmz.mind.MindServerPosition, [0, 0, nextZ]);
      nextZ += minimumDistance;
   });
};

dmz.object.position.observe(self, dmz.mind.MindServerPosition, function (handle, attr, value) {

   if (Votes[handle]) { Votes[handle].position = value; }
});

dmz.messaging.subscribe(self, "Vote_Auto_Place_Message",  arrangeVotes);
