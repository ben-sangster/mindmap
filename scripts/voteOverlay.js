var dmz =
   { object: require("dmz/components/object")
   , mind: require("mindConst")
   , stance: require("stanceConst")
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
