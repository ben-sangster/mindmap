var dmz =
   { mind: require("mindConst")
   , stance: require("stanceConst")
   , defs: require("dmz/runtime/definitions")
   , object: require("dmz/components/object")
   , objectType: require("dmz/runtime/objectType")
   , module: require("dmz/runtime/module")
   , resources: require("dmz/runtime/resources")
   , util: require("dmz/types/util")
   , ui:
      { consts: require('dmz/ui/consts')
      , graph: require("dmz/ui/graph")
      , layout: require("dmz/ui/layout")
      , label: require("dmz/ui/label")
      , loader: require('dmz/ui/uiLoader')
      , messageBox: require("dmz/ui/messageBox")
      , mainWindow: require("dmz/ui/mainWindow")
      , graph: require("dmz/ui/graph")
      }
   }
   , DateJs = require("datejs/date")
   // CONSTS
   , AVATAR_WIDTH = 50
   , AVATAR_HEIGHT = 50
   , ADVISOR_AVATAR_WIDTH = 25
   , ADVISOR_AVATAR_HEIGHT = 25
   // Functions
   , _updatePostedBy
   , _updatePostedAt
   , _updateMessage
   , _updateTags
   , _updateState
   , _updateResponse
   , _updateAdvisorAvatar
   , _updateEndTime
   , _numberOfNonAdminUsers
   // Variables
   , _inUpdate = false
   , _object
   , _form = dmz.ui.loader.load("VoteViewPost")
   , _advisorAvatar = _form.lookup("advisorPictureLabel")
   , _advisorReason = _form.lookup("advisorReasonLabel")
   , _endTime = _form.lookup("endTimeLabel")
   , _startTime = _form.lookup("startTimeLabel")
   , _postedByLabel = _form.lookup("postedByLabel")
   , _avatar = _form.lookup("userPictureLabel")
   , _noVotes = _form.lookup("noVotesLabel")
   , _yesVotes = _form.lookup("yesVotesLabel")
   , _undecVotes = _form.lookup("undecidedVotesLabel")
   , _state = _form.lookup("stateLabel")
   , _message = _form.lookup("questionLabel")
   , _tags = _form.lookup("tagLabel")
   ;

_numberOfNonAdminUsers = function (groupHandle) {

   var userHandles = dmz.object.superLinks(groupHandle, dmz.stance.GroupMembersHandle) || [];
   userHandles = userHandles.filter(function (userHandle) {

      return (dmz.stance.isAllowed(userHandle, dmz.stance.CastVoteFlag) && dmz.object.flag(userHandle, dmz.stance.ActiveHandle));
   });

   return userHandles.length;
};

_updateState = function (handle) {

   var state = dmz.object.scalar(handle, dmz.stance.VoteState)
     , yes
     , no
     , total = _numberOfNonAdminUsers(dmz.stance.getUserGroupHandle(dmz.stance.getAuthorHandle(handle)))
     ;

   _updatePostedAt(handle);
   _updateEndTime(handle);
   if (state === dmz.stance.VOTE_DENIED) {

      _form.styleSheet("* { background-color: rgb(70, 70, 70); color: white; }");
      _state.text(dmz.stance.STATE_STR[state]);
      _yesVotes.text("");
      _noVotes.text("");
      _undecVotes.text("");
      _endTime.text("");
   }
   else if (state === dmz.stance.VOTE_YES) {

      _form.styleSheet("* { background-color: rgb(70, 240, 70); }");
      yes = (dmz.object.superLinks(handle, dmz.stance.YesHandle) || []).length;
      no = (dmz.object.superLinks(handle, dmz.stance.NoHandle) || []).length;
      _state.text(dmz.stance.STATE_STR[state]);
      _yesVotes.text("<b>Yes Votes: " + yes + "</b>");
      _noVotes.text("<b>No Votes: " + no + "</b>");
      _undecVotes.text("<b>Undecided Votes: " + (total - (yes + no)).toString());
   }
   else if (state === dmz.stance.VOTE_NO) {

      _form.styleSheet("* { background-color: rgb(240, 70, 70); }");
      yes = (dmz.object.superLinks(handle, dmz.stance.YesHandle) || []).length;
      no = (dmz.object.superLinks(handle, dmz.stance.NoHandle) || []).length;
      _state.text(dmz.stance.STATE_STR[state]);
      _yesVotes.text("<b>Yes Votes: " + yes + "</b>");
      _noVotes.text("<b>No Votes: " + no + "</b>");
      _undecVotes.text("<b>Undecided Votes: " + (total - (yes + no)).toString());
   }
   else {

      _yesVotes.text("");
      _noVotes.text("");
      _undecVotes.text("");
      _form.styleSheet("* { background-color: rgb(240, 240, 70); }");
      _state.text(dmz.stance.STATE_STR[state]);
   }
};

_updateResponse = function (handle) {

   if (handle === _object) { _advisorReason.text(dmz.object.text(handle, dmz.stance.CommentHandle)); }
};

_updateAdvisorAvatar = function (handle) {

   var avatar;
   if (handle === _object) {

      handle = (dmz.object.subLinks(handle, dmz.stance.VoteLinkHandle) || [])[0];
      avatar = dmz.object.text(handle, dmz.stance.PictureHandle);
      avatar = dmz.resources.findFile(avatar);
      if (avatar) { avatar = dmz.ui.graph.createPixmap(avatar); }
      if (avatar) { avatar = avatar.scaled(ADVISOR_AVATAR_WIDTH, ADVISOR_AVATAR_HEIGHT); }
      _advisorAvatar.pixmap(avatar);
   };
};

_updatePostedBy = function (handle) {

   var authorHandle
     , avatar
     ;
   if (handle === _object) {

      authorHandle = dmz.stance.getAuthorHandle(handle);
      _postedByLabel.text("<b>" + dmz.stance.getDisplayName(authorHandle) + "</b>");
      avatar = dmz.object.text(authorHandle, dmz.stance.PictureHandle);
      avatar = dmz.resources.findFile(avatar);
      if (avatar) { avatar = dmz.ui.graph.createPixmap(avatar); }
      if (avatar) { avatar = avatar.scaled(AVATAR_WIDTH, AVATAR_HEIGHT); }
      _avatar.pixmap(avatar);
   }
};

_updateTags = function (handle) {

   if (handle === _object) { _tags.text(dmz.mind.getDataTags(handle).toString()); }
};

_updatePostedAt = function (handle) {

   var timestamp
     , attr
     , state
     ;
   if (handle === _object) {

      switch (dmz.object.scalar(handle, dmz.stance.VoteState)) {
      case dmz.stance.VOTE_DENIED:
      case dmz.stance.VOTE_APPROVAL_PENDING:
         timestamp = dmz.object.timeStamp(handle, dmz.stance.PostedAtServerTimeHandle) || 0;
         break;
      case dmz.stance.VOTE_ACTIVE:
      case dmz.stance.VOTE_YES:
      case dmz.stance.VOTE_NO:
      case dmz.stance.VOTE_EXPIRED:
         timestamp = dmz.object.timeStamp(handle, dmz.stance.CreatedAtServerTimeHandle) || 0;
         break;
      default: timestamp = 0; break;
      }

      _startTime.text(dmz.util.timeStampToDate(timestamp).toString(dmz.stance.TIME_FORMAT));
   }
};

_updateEndTime = function (handle) {

   var timestamp;
   if (handle === _object) {

      timestamp = dmz.object.timeStamp(handle, dmz.stance.EndedAtServerTimeHandle) || 0;
      if (timestamp) {

         _endTime.text(dmz.util.timeStampToDate(timestamp).toString(dmz.stance.TIME_FORMAT));
      }
      else { _endTime.text(""); }
   }
};


_updateMessage = function (handle) {

   if (handle === _object) { _message.text(dmz.object.text(handle, dmz.stance.TextHandle)); }
}

dmz.object.scalar.observe(self, dmz.stance.VoteState, _updateState);
dmz.object.text.observe(self, dmz.stance.CommentHandle, _updateResponse);
dmz.object.text.observe(self, dmz.stance.TextHandle, _updateMessage);
dmz.object.timeStamp.observe(self, dmz.stance.CreatedAtServerTimeHandle, _updatePostedAt);
dmz.object.timeStamp.observe(self, dmz.stance.PostedAtServerTimeHandle, _updatePostedAt);
dmz.object.timeStamp.observe(self, dmz.stance.EndedAtServerTimeHandle, _updateEndTime);
dmz.object.data.observe(self, dmz.stance.TagHandle, _updateTags);
dmz.object.link.observe(self, dmz.stance.CreatedByHandle,
function (linkObjHandle, attrHandle, superHandle, subHandle) {

   _updatePostedBy(superHandle);
});

dmz.module.subscribe(self, "objectInspector", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.addInspector(self, _form, dmz.stance.VoteType, function (handle) {

         _object = handle;
         _updateAdvisorAvatar(handle);
         _updatePostedBy(handle);
         _updatePostedAt(handle);
         _updateMessage(handle);
         _updateTags(handle);
         _updateState(handle);
         _updateResponse(handle);
      });
   }
});
