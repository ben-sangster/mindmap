var dmz =
   { ui:
      { button: require("dmz/ui/button")
      , consts: require('dmz/ui/consts')
      , color: require("dmz/ui/palette")
      , label: require("dmz/ui/label")
      , layout: require("dmz/ui/layout")
      , loader: require('dmz/ui/uiLoader')
      , event: require("dmz/ui/event")
      , mainWindow: require('dmz/ui/mainWindow')
      , widget: require("dmz/ui/widget")
      , graph: require("dmz/ui/graph")
      }
   , stance: require("stanceConst")
   , mind: require("mindConst")
   , mask: require("dmz/types/mask")
   , data: require("dmz/runtime/data")
   , defs: require("dmz/runtime/definitions")
   , object: require("dmz/components/object")
   , objectType: require("dmz/runtime/objectType")
   , time: require("dmz/runtime/time")
   , util: require("dmz/types/util")
   , resources: require("dmz/runtime/resources")
   , message: require("dmz/runtime/messaging")
   , module: require("dmz/runtime/module")
   }
   , DateJs = require("datejs/time")

   // UI Elements
   , DataWindow = dmz.ui.loader.load("DataDock.ui")
   , dataFilter = DataWindow.lookup("filterLine")
   , scrollArea = DataWindow.lookup("scrollArea")
   , scrollLayout = dmz.ui.layout.createVBoxLayout()
   , DockName = "Data Dock"
   , dock = dmz.ui.mainWindow.createDock
        ( DockName
        , { area: dmz.ui.consts.RightToolBarArea
          , allowedAreas: [dmz.ui.consts.AllDockWidgetAreas]
          , floating: true
          , visible: true
          }
        , DataWindow
        )

   // Constants
   , TITLE_LENGTH = 20
   , ICON_WIDTH = 64
   , ICON_HEIGHT = 74

   // Variables
   , widgetStack = []
   , DataItems = {}
   , TypeList = {}
   , SelectedWidget = false
   , OrigPalette = false

   // Functions
   , getDataItem
   , updateGroups
   , updateTags
   , updateTitle
   , updateIcon
   , updateDate
   , remove
   , add
   ;

(function () {

   var content = scrollArea.widget();
   if (content) {

      content.layout(scrollLayout);
      scrollLayout.addStretch(1);
   }
   TypeList[dmz.stance.AnswerType] = true;
   TypeList[dmz.stance.CommentType] = true;
//   TypeList[dmz.stance.DecisionType] = true;
//   TypeList[dmz.stance.EmailType] = true;
//   TypeList[dmz.stance.ForumType] = true;
//   TypeList[dmz.stance.GameType] = true;
//   TypeList[dmz.stance.GroupType] = true;
   TypeList[dmz.stance.LobbyistType] = true;
   TypeList[dmz.stance.MemoType] = true;
   TypeList[dmz.stance.NewspaperType] = true;
//   TypeList[dmz.stance.PinType] = true;
   TypeList[dmz.stance.PostType] = true;
   TypeList[dmz.stance.QuestionType] = true;
//   TypeList[dmz.stance.UserType] = true;
   TypeList[dmz.stance.VideoType] = true;
   TypeList[dmz.stance.VoteType] = true;
//   TypeList[dmz.stance.DataType] = true;
//   TypeList[dmz.stance.HelpForumType] = true;
   TypeList[dmz.stance.PdfItemType] = true;
}());

add = function (item) {

   if (item && item.widget && !item.visible) {

      scrollLayout.insertWidget(0, item.widget);
      item.widget.show();
      item.visible = true;
   }
};

remove = function (item) {

   if (item && item.widget) {

      scrollLayout.removeWidget(item.widget);
      item.widget.hide();
      item.visible = false;
   }
};

updateDate = function (handle) {

   var item = DataItems[handle];
   if (item) {

      item.timeStamp = dmz.object.timeStamp(handle, dmz.stance.CreatedAtServerTimeHandle) || 0;
      item.date.text(dmz.util.timeStampToDate(item.timeStamp).toString(dmz.stance.TIME_FORMAT));
   }
};

updateGroups = function (handle) {

   var item = DataItems[handle]
     , list = []
     ;

   if (item) {

      item.groupList = dmz.mind.getGroupHandles(handle) || [];
      item.groupList.forEach(function (groupHandle) {

         list.push(dmz.stance.getDisplayName(groupHandle));
      });
      item.group.text(list.toString());
   }
};

updateTags = function (handle) {

   var item = DataItems[handle];
   if (item) {

      item.tagList = dmz.mind.getDataTags(handle) || [];
      item.tags.text(item.tagList.toString());
   }
};

// Needs to be customized for each object type!
updateTitle = function (handle) {

   var item = DataItems[handle]
     , attr
     ;

   if (item) {

      if (item.type.isOfType(dmz.stance.VoteType) ||
         item.type.isOfType(dmz.stance.PostType) ||
         item.type.isOfType(dmz.stance.CommentType) ||
         item.type.isOfType(dmz.stance.QuestionType) ||
         item.type.isOfType(dmz.stance.AnswerType) ||
         item.type.isOfType(dmz.stance.DecisionType)) {

         attr = dmz.stance.TextHandle;
      }
      else if (item.type.isOfType(dmz.stance.MemoType) ||
         item.type.isOfType(dmz.stance.NewspaperType) ||
         item.type.isOfType(dmz.stance.VideoType) ||
         item.type.isOfType(dmz.stance.LobbyistType) ||
         item.type.isOfType(dmz.stance.PdfItemType)) {

         attr = dmz.stance.TitleHandle;
      }

      if (attr) {

         item.title.text((dmz.object.text(handle, attr) || "").substr(0, TITLE_LENGTH) + "...");
      }
   }
};

updateIcon = function (handle) {

   var item = DataItems[handle]
     , resource
     , config
     ;

   if (item) {

      config = item.type.config() || (item.type.parent() ? item.type.parent().config() : false);
      resource = config.string("icon.resource");
      if (!resource) {

         config = item.type.parent().config();
         resource = config.string("icon.resource");
      }

      if (resource) {

         resource = dmz.ui.graph.createPixmap(dmz.resources.findFile(resource));
         item.icon.pixmap(resource ? resource.scaled(ICON_WIDTH, ICON_HEIGHT) : resource);
      }
   }
}

DataWindow.observe(self, "updateButton", "clicked", function () {

   Object.keys(DataItems).forEach(function (key) {

      updateGroups(DataItems[key].handle);
      updateTags(DataItems[key].handle);
      updateIcon(DataItems[key].handle);
      updateTitle(DataItems[key].handle);
      updateDate(DataItems[key].handle);
   });
});

DataWindow.observe(self, "filterButton", "clicked", function () {

   var filterString = dataFilter.text() || "";
   Object.keys(DataItems).forEach(function (key) {

      var state = dmz.object.state(DataItems[key].handle, dmz.mind.MindState)
        , filter
        ;

      filter = DataItems[key].tagList.filter(function (tag) {

         return tag.indexOf(filterString) !== -1;
      });

      // Should items also be removed from the layout when they are hidden / added when shown?
      if (filter.length && (!state || !state.and(dmz.mind.ShowIconState).bool())) {

         add(DataItems[key]);
      }
      else { remove(DataItems[key]); }
   });
});

getDataItem = function (handle) {

   var type = dmz.object.type(handle)
     , item = DataItems[handle]
     ;

   if (type) {

      if (!item) {

         item = { widget: dmz.ui.loader.load("DataItem.ui") };
         item.icon = item.widget.lookup("iconLabel");
         item.tags = item.widget.lookup("tagLabel");
         item.date = item.widget.lookup("dateLabel");
         item.group = item.widget.lookup("groupLabel");
         item.title = item.widget.lookup("titleLabel");
         item.handle = handle;
         item.type = type;
         item.visible = false;
         item.widget.hide();
         item.widget.eventFilter(self, function (object, event) {

            var type = event.type()
              , palette
              ;

            if (type == dmz.ui.event.MouseButtonPress) {

               if (!SelectedWidget || (SelectedWidget.widget != object)) {

                  if (SelectedWidget) {

                     palette = SelectedWidget.widget.palette();
                     palette.color(dmz.ui.color.Window, OrigPalette);
                     SelectedWidget.widget.palette(palette);
                  }

                  SelectedWidget = item;
                  palette = SelectedWidget.widget.palette();
                  if (!OrigPalette) { OrigPalette = palette.color(dmz.ui.color.Window); }
                  palette.color(dmz.ui.color.Window, { r: .82, g: .71, b: .71 });
                  SelectedWidget.widget.palette(palette);
               }
            }
         });
      }

      DataItems[handle] = item;
      updateTags(handle);
      updateTitle(handle);
      updateIcon(handle);
      updateDate(handle);
      dmz.time.setTimer(self, function () { updateGroups(handle); });
   }
   return item;
};

dmz.object.create.observe(self, function (handle, type) {

   var item
     , text
     ;
   if (TypeList[type]) {

      item = getDataItem(handle);
      if (item) {

         text = dataFilter.text() || "";
         if (item.tagList.length &&
            ((text.length === 0) || (item.tagList.indexOf(text) !== -1))) {

            add(item);
         }
      }
   }
});

dmz.object.data.observe(self, dmz.stance.TagHandle, updateTags);
dmz.object.text.observe(self, dmz.stance.TitleHandle, updateTitle);
dmz.object.text.observe(self, dmz.stance.TextHandle, updateTitle);
dmz.object.timeStamp.observe(self, dmz.stance.CreatedAtServerTimeHandle, updateTags);
dmz.object.text.observe(self, dmz.stance.TitleHandle, updateTitle);
dmz.object.state.observe(self, dmz.mind.MindState, function (handle, attr, value, prev) {

   if (value.and(dmz.mind.ShowIconState).bool()) { remove(DataItems[handle]); }
   else if (prev && prev.and(dmz.mind.ShowIconState).bool()) { add(DataItems[handle]); }
});

dmz.message.subscribe(self, "CreateObjectMessage", function (data) {

   var position = data.vector(dmz.mind.MindPosition, 0)
     , state
     ;
   if (SelectedWidget) {

      dmz.object.position(SelectedWidget.handle, dmz.mind.MindPosition, position);
      state = dmz.object.state(SelectedWidget.handle, dmz.mind.MindState) || dmz.mask.create();
      dmz.object.state(SelectedWidget.handle, dmz.mind.MindState, state.or(dmz.mind.ShowIconState));
      // fix colors of widget to be default
      // set state
      SelectedWidget = false;
   }
});
