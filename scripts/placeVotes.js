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
   , arrangeVotes
   ;

dmz.object.create.observe(self, function (handle, type) {

   if (type.isOfType(dmz.stance.VoteType)) {

      Votes[handle] = { handle: handle, position: false };
   }
});

getVoteTime = function (voteHandle) {

   var attr
     , result
     ;
   if (Votes[voteHandle]) {

      if (dmz.object.scalar(voteHandle, dmz.stance.VoteState) === dmz.stance.VOTE_DENIED) {

         attr = dmz.stance.PostedAtServerTimeHandle;
      }
      else { attr = dmz.stance.CreatedAtServerTimeHandle; }
      result = dmz.object.timeStamp(voteHandle, attr);
   }
   return result || 0;
};

arrangeVotes = function () {

   var voteList = []
     , minimumDistance = OBJECT_RADIUS * Math.SQRT2 * 1.3
     , nextZ = MIN_Z + minimumDistance
     ;

   Object.keys(Votes).forEach(function (key) { voteList.push(Votes[key].handle); });
   voteList = voteList.filter(function (voteHandle) {

      var state = dmz.object.state(voteHandle, dmz.mind.MindState) || dmz.mask.create();
      return state.and(dmz.mind.ShowIconState).bool();
   });
   voteList.sort(function (vote1, vote2) { return getVoteTime(vote1) - getVoteTime(vote2); });
   voteList.forEach(function (voteHandle, index) {

      dmz.object.position(voteHandle, dmz.mind.MindServerPosition, [0, 0, nextZ]);
      nextZ += minimumDistance;
   });
};

dmz.messaging.subscribe(self, "Vote_Auto_Place_Message",  arrangeVotes);
