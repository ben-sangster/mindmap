var dmz =
   { mind: require("mindConst")
   , stance: require("stanceConst")
   , data: require("dmz/runtime/data")
   , object: require("dmz/components/object")
   , messaging: require("dmz/runtime/messaging")
   }
   // Consts
   , MAX_LINE_LENGTH = 40
   // Functions
   , getZoomLength
   , updateObject
   , breakStr
   // Variables
   , zoomTable = []
   , objectTable = {}
   , attrTable = {}
   , currentLength = 0
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

getZoomLength = function (zoom) {

   var result = 0;
//   self.log.warn ("  Zoom: ", zoom);
   zoomTable.forEach(function (data) {

//      self.log.warn ("        ", data.zoom, (!result && (zoom >= data.zoom)));
      if (!result && (zoom >= data.zoom)) { result = data.length; }
   });
   return result;
};

updateObject = function (objectData) {

   var text;
   if (objectData) {

      text = dmz.object.text(objectData.handle, objectData.attr);
      if (text.length > currentLength) { text = text.substr(0, currentLength) + "..."; }
//      self.log.warn ("     ", objectData.handle, objectData.attr, text);
      dmz.object.text(objectData.handle, dmz.mind.MindLabel, breakStr(text));
   }
};

(function () {

   var dataList = self.config.get("data");
   dataList.forEach(function (dataConfig) {

      zoomTable.push({ zoom: dataConfig.number("zoom"), length: dataConfig.number("length") });
//      self.log.warn ("Zoom:", dataConfig.number("zoom"), "Length:", dataConfig.number("length"));
   });
   zoomTable.sort(function (obj1, obj2) { return obj2.zoom - obj1.zoom; });
   zoomTable.forEach(function (data) { self.log.warn (data.zoom, data.length); });
}());

dmz.messaging.subscribe(self, "Canvas_Zoom_Message",  function (data) {

   var labelLength = getZoomLength(dmz.data.unwrapNumber(data) || 0)
     ;

//   self.log.warn ("Zoom:", dmz.data.unwrapNumber(data), "Length:", labelLength, currentLength);
   if (labelLength != currentLength) {

//      self.log.warn ("  Update:");
      currentLength = labelLength;
      Object.keys(objectTable).forEach(function (key) { updateObject(objectTable[key]); });
   }
});

dmz.object.create.observe(self, function (handle, type) {

   var attr;
   if (type.isOfType(dmz.stance.PostType) ||
      type.isOfType(dmz.stance.CommentType) ||
      type.isOfType(dmz.stance.QuestionType) ||
      type.isOfType(dmz.stance.AnswerType)) {

      attr = dmz.stance.TextHandle;
   }
   else if (type.isOfType(dmz.stance.MemoType) ||
      type.isOfType(dmz.stance.NewspaperType) ||
      type.isOfType(dmz.stance.VideoType) ||
      type.isOfType(dmz.stance.LobbyistType) ||
      type.isOfType(dmz.stance.PdfItemType)) {

      attr = dmz.stance.TitleHandle;
   }

   if (attr) {

      if (!attrTable[attr]) {

         attrTable[attr] = true;
         dmz.object.text.observe(self, attr, function (handle, attrHandle, value) {

            updateObject(objectTable[handle]);
         });
      }
      objectTable[handle] = { handle: handle, attr: attr };
   }
});
