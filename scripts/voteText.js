var dmz =
   { stance: require("stanceConst")
   , mind: require("mindConst")
   , object: require("dmz/components/object")
   }
   // Consts
   , MAX_LINE_LENGTH = 40
   // Variables
   , Votes = {}
   // Functions
   , breakStr
   ;

breakStr = function (str, prevStr) {

   var retStr = ""
     , idx
     ;

   if (str && str.length) {

      if (str.length > MAX_LINE_LENGTH) {

         idx = str.lastIndexOf(" ", MAX_LINE_LENGTH);
         if (idx === -1) {

            retStr = str.substr(0, MAX_LINE_LENGTH) + "-\n" + breakStr(str.substr(MAX_LINE_LENGTH), str);
         }
         else {

            retStr = str.substr(0, idx) + "\n" + breakStr(str.substr(idx + 1), str);
         }
      }
      else { retStr = str; }
   }

   return retStr;
};

dmz.object.create.observe(self, function (handle, type) {

   if (type.isOfType(dmz.stance.VoteType)) { Votes[handle] = true; }
});

dmz.object.text.observe(self, dmz.stance.TextHandle, function (handle, attr, value) {

   if (Votes[handle]) { dmz.object.text(handle, dmz.mind.MindLabel, breakStr(value)); }
});
