var dmz =
   { object: require("dmz/components/object")
   , mask: require("dmz/types/mask")
   , mind: require("mindConst")
   , stance: require("stanceConst")
   , time: require("dmz/runtime/time")
   }

dmz.object.scalar.observe(self, dmz.stance.VoteState, function (handle, attr, value) {

   var state = dmz.object.state(handle, dmz.mind.MindState);
   if (state) {

      state =
         state.unset(dmz.mind.VoteYesState.or(dmz.mind.VoteNoState.or(
            dmz.mind.VoteDeniedState).or(dmz.mind.VoteActiveState)));

      switch (value) {
      case dmz.stance.VOTE_YES: state = state.or(dmz.mind.VoteYesState); break;
      case dmz.stance.VOTE_NO: state = state.or(dmz.mind.VoteNoState); break;
      case dmz.stance.VOTE_DENIED: state = state.or(dmz.mind.VoteDeniedState); break
      case dmz.stance.VOTE_ACTIVE:
      case dmz.stance.VOTE_APPROVAL_PENDING:
         state = state.or(dmz.mind.VoteActiveState);
         break;
      default: break;
      };

      dmz.object.state(handle, dmz.mind.MindState, state);
   }
});

dmz.object.flag.observe(self, dmz.stance.DisturbanceInTheForceHandle, function (handle, attr, value) {

   if (value) {

      dmz.time.setTimer(self, function () {

         var state = dmz.object.state(handle, dmz.mind.MindState) || dmz.mask.create();
         dmz.object.state(handle, dmz.mind.MindState, state.or(dmz.mind.DTFState));
      });
   }
});
