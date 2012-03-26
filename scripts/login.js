require ("datejs/date");
var dmz =
       { object: require("dmz/components/object")
       , data: require("dmz/runtime/data")
       , message: require("dmz/runtime/messaging")
       , time: require("dmz/runtime/time")
       , defs: require("dmz/runtime/definitions")
       , objectType: require("dmz/runtime/objectType")
       , util: require("dmz/types/util")
       , stance: require("stanceConst")
       , sys: require("sys")
       , ui:
          { mainWindow: require("dmz/ui/mainWindow")
          , messageBox: require("dmz/ui/messageBox")
          }
       }
    // UI
    , disabledDialog =
         dmz.ui.messageBox.create(
            { type: dmz.ui.messageBox.Warning
            , text: "Your account has been disabled. Please contact your professor to get it reenabled. STANCE will now exit."
            , standardButtons: [dmz.ui.messageBox.Ok]
            , defaultButton: dmz.ui.messageBox.Ok
            }
            , dmz.ui.mainWindow.centralWidget()
            )
    , failedDialog =
         dmz.ui.messageBox.create(
            { type: dmz.ui.messageBox.Warning
            , text: "Unable to connect to game server!"
            , informativeText: "You are now in offline use mode!"
            , standardButtons: [dmz.ui.messageBox.Ok]
            , defaultButton: dmz.ui.messageBox.Ok
            }
            , dmz.ui.mainWindow.centralWidget()
            )

    // Constants
    , LoginSuccessMessage = dmz.message.create("Login_Success_Message")
    , LogoutMessage = dmz.message.create("Logout_Message")
    , LoginSkippedMessage = dmz.message.create("Login_Skipped_Message")
    , LoginErrorMessage = dmz.message.create("Login_Error_Message")

    // Variables
    , _gameHandle
    , _userList = []
    , _userName
    , _userHandle
    , _loginQueue = false
    , _hasLoggedIn = false
    , _loginSkipped = false

    // Functions
    , toTimeStamp = dmz.util.dateToTimeStamp
    , toDate = dmz.util.timeStampToDate
    , _activateUser
    , _login
    ;

_activateUser = function (name) {

   var handle
     , logins
     ;

   if (_userName && (name === _userName)) {

      handle = _userList[_userName];
      if (handle) {

         if (_userHandle) { dmz.object.flag(_userHandle, dmz.object.HILAttribute, false); }
         if (dmz.object.flag(handle, dmz.stance.ActiveHandle)) {

            dmz.object.flag(handle, dmz.object.HILAttribute, true);
            dmz.object.flag(_userHandle, dmz.stance.UpdateLastLoginTimeHandle, true);
         }
         else { disabledDialog.open(self, function () { dmz.sys.requestExit(); }); }
      }
   }
};

dmz.object.flag.observe(self, dmz.stance.ActiveHandle,
function (objHandle, attrHandle, newVal, oldVal) {

   dmz.time.setTimer(self, 2, function () {

      var type = dmz.object.type(objHandle)
        , value = dmz.object.text(objHandle, dmz.stance.NameHandle)
        ;

      if (type && type.isOfType(dmz.stance.UserType)) {

         _userList[value] = objHandle;
         _activateUser (value);
      }
   });
});

_login = function (data) {

   if (data && dmz.data.isTypeOf(data)) {

      dmz.time.setTimer(self, 2, function () {

         _userName = data.string(dmz.stance.NameHandle);
         _activateUser(_userName);
      });
   }
}

LoginSuccessMessage.subscribe(self, function (data) {

   if (_gameHandle) { _login (data); }
   else { _loginQueue = data; }
});

LoginSkippedMessage.subscribe(self, function () {

   var handle = dmz.object.hil();
   _loginSkipped = true;
   dmz.object.flag(handle, dmz.object.HILAttribute, false);
   dmz.object.flag(handle, dmz.object.HILAttribute, true);
});

LoginErrorMessage.subscribe(self, function () {

   failedDialog.open(self, function () {});
});

LogoutMessage.subscribe(self, function () {

   if (_userHandle) { dmz.object.flag(_userHandle, dmz.object.HILAttribute, false); }
});

dmz.object.create.observe(self, function (handle, type) {

   if (type.isOfType(dmz.stance.GameType)) {

      if (!_gameHandle) {

         _gameHandle = handle;
         if (_loginQueue) {

            _login (_loginQueue);
            _loginQueue = false;
         }
      }
   }
});

dmz.object.text.observe(self, dmz.stance.NameHandle, function (handle, attr, value) {

   dmz.time.setTimer(self, 2, function () {

      var type = dmz.object.type(handle);
      if (type && type.isOfType (dmz.stance.UserType)) {

         _userList[value] = handle;
         _activateUser (value);
      }
   });
});

dmz.object.flag.observe(self, dmz.object.HILAttribute, function (handle, attr, value) {

   var type = dmz.object.type(handle);
   if ((handle === _userHandle) && !value) { _userHandle = 0; }
   if (value && type && type.isOfType(dmz.stance.UserType)) { _userHandle = handle; }
});
