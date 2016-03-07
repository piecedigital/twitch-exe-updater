var clientId = "1xb1e12mtrfjt0r0p805cu00bu6x4xn";
Twitch.init({ "clientId" : clientId }, function(error, status) {
});
// set the token
var twitchToken = Twitch.getToken();
var concurrentData = {};

remote.require("./handle-data").loadConcurrentData(function(data) {
  concurrentData = JSON.parse(data);
});
//////////////////////////////
// app ///////////////////////
//////////////////////////////
var R = React;
R.CC = React.createClass;
R.CE = React.createElement;
delete R.createClass;
delete R.createElement;

// page wrap and section element components
var pageWrapSmall = function(attrs, content) {
  var initAttrs = { "className" : "page-wrap-960" };

  for(var key in attrs) {
    initAttrs[key] = (initAttrs[key]) ? `${initAttrs[key]} ${attrs[key]}` : `${attrs[key]}`;
  };

  return R.CE(
    "div",
    initAttrs,
    content
  );
};
var pageWrapNormal = function(attrs, content) {
  var initAttrs = { "className" : "page-wrap-1200" };

  for(var key in attrs) {
    initAttrs[key] = (initAttrs[key]) ? `${initAttrs[key]} ${attrs[key]}` : `${attrs[key]}`;
  };

  return R.CE(
    "div",
    initAttrs,
    content
  );
};
var section = function(attrs, content) {
  return R.CE(
    "section",
    attrs,
    content
  );
};

var normalSeparator = R.CE(
  "span",
  { className : "normal-separator" },
  R.CE(
    "span",
    null
  )
);
var smallSeparator = R.CE(
  "span",
  { className : "small-separator" },
  R.CE(
    "span",
    null
  )
);

// view parent
// renders every part of the app
var ViewParent = R.CC({
  displayName: "ViewParent",

  getInitialState: function() {
    return { "streamers" : [], "streamerInView" : 0, "streamerPanels" : [], "hoveredStreamer" : null, "historyPoint" : 0, "history" : [{ page : "HomePage", search : "" }], "streamSearchResults" : [], "channelSearchResults" : [], "limit" : 6*4, "streamOffset" : 0, "channelOffset" : 0, "gameOffset" : 0 };
  },
  // go back in history
  changeViewPrev: function(e) {
    if(this.state.history.length > 1) {
      this.state.history.pop();
      var historyPoint = this.state.history[this.state.history.length-1];

      this.state.streamSearchResults = [];
      this.state.channelSearchResults = [];
      this.state.streamOffset = 0;
      this.state.channelOffset = 0;
      this.state.gameOffset = 0;

      if(historyPoint.page === "StreamsListPage") {
        this.searchForStreamData();
        this.searchForChannelData();
      }
      if(historyPoint.page === "GamesListPage") {
        this.searchForTopGame();
      } else {
        this.setState({});
      }
    }
  },
  // ajax for streams data and update the requestResults in the state
  searchForStreamData: function(offset) {
    console.log("running")
    // sets variable to access the class object
    var elemInstance = this;
    var historyPoint = this.state.history[this.state.history.length-1];

    var url = (historyPoint.search) ? `https://api.twitch.tv/kraken/search/streams?limit=${this.state.limit}&offset=${this.state.limit * this.state.streamOffset}&q=${historyPoint.search.toLowerCase()}` : `https://api.twitch.tv/kraken/streams/featured?limit=${this.state.limit}&offset=${this.state.limit * this.state.streamOffset}`;

    ajax({
      url: url,
      success: function(data) {
        console.log("Streams", (JSON.parse(data)));
        JSON.parse(data).streams.map(function(streamData) {
          elemInstance.state.streamSearchResults.push(streamData);
        });

        elemInstance.setState({ "streamOffset" : (offset || elemInstance.state.streamOffset+1), search : "" });
      },
      error: function(data) {
        //console.log(data)
      }
    });
  },
  searchForChannelData: function(offset) {
    // sets variable to access the class object
    var elemInstance = this;
    var historyPoint = this.state.history[this.state.history.length-1];

    var url = (historyPoint.search) ? `https://api.twitch.tv/kraken/search/channels?limit=${this.state.limit}&offset=${this.state.limit * this.state.channelOffset}&q=${historyPoint.search.toLowerCase()}` : `https://api.twitch.tv/kraken/channels/featured?limit=${this.state.limit}&offset=${this.state.limit * this.state.channelOffset}`;

    ajax({
      url: url,
      success: function(data) {
        //console.log("Channels", (JSON.parse(data)));
        JSON.parse(data).channels.map(function(channelData) {
          elemInstance.state.channelSearchResults.push(channelData);
        });

        elemInstance.setState({ "channelOffset" : (offset || elemInstance.state.channelOffset+1), search : "" });
      },
      error: function(data) {
        //console.log(data)
      }
    });
  },
  // ajax for games data and update the requestResults in the state
  searchForTopGame: function(offset) {
    var elemInstance = this;
    ajax({
      url: `https://api.twitch.tv/kraken/games/top?limit=${elemInstance.state.limit}&offset=${elemInstance.state.limit * elemInstance.state.gameOffset}`,
      success: function(data) {
        //console.log("Top Games", JSON.parse(data).top);
        JSON.parse(data).top.map(function(gameData) {
          elemInstance.state.streamSearchResults.push(gameData);
        });

        elemInstance.setState({ "gameOffset" : elemInstance.state.gameOffset+1, search : "" });
      },
      error: function(data) {
        //console.log(data)
      }
    });
  },
  // search function for feeding data to "searchForStreamData" and "searchForTopGame"
  pingForData: function(e) {
    var historyPoint = this.state.history[this.state.history.length-1];
    var searchText = (e) ? ( (e.target.attributes["data-search"]) ? e.target.attributes["data-search"].value : historyPoint.search ) : historyPoint.search;
    //console.log(searchText)
    var searchPage = (e) ? e.target.attributes["data-page-link"].value : historyPoint.page;

    if(historyPoint.page !== searchPage) {
      this.state.history.push({ page : searchPage, search : searchText });
    }
    historyPoint.search = searchText;
    historyPoint.page = searchPage;
    this.state.streamSearchResults = [];
    this.state.channelSearchResults = [];
    this.state.streamOffset = 0;
    this.state.channelOffset = 0;
    this.state.gameOffset = 0;

    if(historyPoint.page === "StreamsListPage") {
      console.log(true)
      this.searchForStreamData();
      this.searchForChannelData();
    } else
    if(historyPoint.page === "GamesListPage") {
      console.log(false)
      this.searchForTopGame();
    } else {
      console.log(null)
      this.setState({});
    }
  },
  // opens up the stream viewer
  viewStream: function(e) {
    // event for closing the viewer
    if(e.target.hasClass("close")) {
      var viewer = document.querySelector("#stream-viewer");

      viewer.removeClass("open");
      document.body.style.overflow = "";
      this.setState({ "streamers" : { length : 0 } })
    } else
    // event for changing the display of the viewer
    if(e.target.hasClass("display")) {
      var viewer = document.querySelector("#stream-viewer");

      viewer.toggleClass("shrink");
      if(document.body.style.overflow) {
        document.body.style.overflow = "";
      } else {
        document.body.style.overflow = "hidden";
      }
    } else
    // event for changing the display of the chat
    if(e.target.hasClass("chat")) {
      var viewer = document.querySelector("#stream-viewer");

      viewer.toggleClass("hidden-chat");
    } else
    // event for following the current channel
    if(e.target.hasClass("follow")) {
      var streamer = e.target.attributes["data-streamer"].value

      ajax({
        url: `https://api.twitch.tv/kraken/users/${concurrentData.username.toLowerCase()}/follows/channels/${streamer}?notifications=true&oauth_token=${twitchToken}`,
        type: "PUT",
        success: function(data) {
          document.querySelector(".follow").addClass("hide");
          document.querySelector(".unfollow").removeClass("hide");
        },
        error: function(err) {
          //console.log(`Status: ${err.status}`, `Message: ${err.message}`)
        }
      });
    } else
    // event for unfollowing the current channel
    if(e.target.hasClass("unfollow")) {
      var streamer = e.target.attributes["data-streamer"].value

      ajax({
        url: `https://api.twitch.tv/kraken/users/${concurrentData.username.toLowerCase()}/follows/channels/${streamer}?notifications=true&oauth_token=${twitchToken}`,
        type: "DELETE",
        success: function(data) {
          document.querySelector(".unfollow").addClass("hide");
          document.querySelector(".follow").removeClass("hide");
        },
        error: function(err) {
          //console.log(`Status: ${err.status}`, `Message: ${err.message}`)
        }
      });
    } else
    // default event for opening streams
    {
      var streamer = e.target.attributes["data-stream-link"].value;
      this.state.streamers = { 0 : streamer, length : 1 };
      this.setState({ "streamerInView" : 0 });
      var viewer = document.querySelector("#stream-viewer");

      ajax({
        url: `https://api.twitch.tv/kraken/users/${concurrentData.username.toLowerCase()}/follows/channels/${streamer}`,
        type: "GET",
        success: function(data) {
          document.querySelector(".follow").addClass("hide");
          document.querySelector(".unfollow").removeClass("hide");
        },
        error: function(err) {
          document.querySelector(".follow").removeClass("hide");
          document.querySelector(".unfollow").addClass("hide");
          //console.log(`Status: ${err.status}`, `Message: ${err.message}`)
        }
      });

      viewer.addClass("open").removeClass("shrink");
      document.body.style.overflow = "hidden";
    }
  },
  toggleChat: function(e) {
    var newStreamerInView = e.target.attributes["data-chat"].value;

    this.setState({ "streamerInView" : parseInt(newStreamerInView) });

    // change the follow/unfollow button for the currently "in view" streamer
    var streamer = this.state.streamers[newStreamerInView];
    //console.log("streamer", streamer);
    ajax({
      url: `https://api.twitch.tv/kraken/users/${concurrentData.username.toLowerCase()}/follows/channels/${streamer}`,
      type: "GET",
      success: function(data) {
        document.querySelector(".follow").addClass("hide");
        document.querySelector(".unfollow").removeClass("hide");
      },
      error: function(err) {
        document.querySelector(".follow").removeClass("hide");
        document.querySelector(".unfollow").addClass("hide");
        //console.log(`Status: ${err.status}`, `Message: ${err.message}`)
      }
    });
  },
  loginUser: function() {
    Twitch.login({
      scope: ["user_blocks_edit", "user_blocks_read", "user_follows_edit", "channel_read", "channel_editor", "channel_commercial", "channel_stream", "channel_subscriptions", "user_subscriptions", "channel_check_subscription", "chat_login"]
    });
  },
  appendStreamer: function() {
    if(this.state.streamers.length < 4 && !this.state.streamers.include(this.state.hoveredStreamer)) {
      this.state.streamers.push(this.state.hoveredStreamer);
      document.querySelector("#stream-viewer").addClass("open").removeClass("shrink");
      document.body.style.overflow = "hidden";
      this.setState({});

      // change the follow/unfollow button for the currently "in view" streamer
      var streamer = this.state.streamers[this.state.streamerInView];
      ajax({
        url: `https://api.twitch.tv/kraken/users/${concurrentData.username.toLowerCase()}/follows/channels/${streamer}`,
        type: "GET",
        success: function(data) {
          document.querySelector(".follow").addClass("hide");
          document.querySelector(".unfollow").removeClass("hide");            
        },
        error: function(err) {
          document.querySelector(".follow").removeClass("hide");
          document.querySelector(".unfollow").addClass("hide");            
          //console.log(`Status: ${err.status}`, `Message: ${err.message}`)
        }
      });
    }
  },
  getPanels: function(e) {
    var elemInstance = this;
    var streamer = e.target.attributes["data-streamer"].value;

    ajax({
      url: `https://api.twitch.tv/api/channels/${streamer}/panels`,
      type: "GET",
      success: function(data) {
        console.log( JSON.parse(data) );
        elemInstance.setState({ "streamerPanels" : JSON.parse(data) });
      },
      error: function(err) {
        //console.log(`Status: ${err.status}`, `Message: ${err.message}`)
      }
    });
  },
  closePanels: function() {
    this.setState({ "streamerPanels" : [] });
  },
  fullScreenify: function(e) {
    var bw = remote.BrowserWindow.getAllWindows()[0];
    e.target.parentNode.parentNode[((!bw.isFullScreen()) ? "addClass" : "removeClass")]('full-screen');

    bw.setFullScreen( ((!bw.isFullScreen()) ? true : false) );
  },
  componentDidMount: function() {
    var elemInstance = this;

    document.addEventListener("mousedown", function(e) {
      ////console.log(e);
      if(e.button === 0) {
        if(e.target.hasClass("streamer-opt")) {
          elemInstance.appendStreamer()
        }
        document.querySelector("#context-menu.streamer-options").addClass("hide");
      } else
      if(e.button === 2) {
        if(e.target.hasClass(["featured-stream-item", "following-stream-item", "followers-stream-item"])) {
          elemInstance.state.hoveredStreamer = event.target.attributes["data-stream-link"].value;
          document.querySelector("#context-menu.streamer-options").removeClass("hide");
          document.querySelector("#context-menu.streamer-options").css({
            "top": `${e.clientY}px`,
            "left": `${e.clientX}px`
          });
        } else
        if(e.target.hasClass("toggle-chat")) {
          //elemInstance.closeVideo(e);
          console.log("\r\nSure, right clicks are still recognized, but we're testing soemthing else here.\r\n");
        } else {
          document.querySelector("#context-menu.streamer-options").addClass("hide");
        }
      }
    });
    document.addEventListener("keydown", function(e) {
      if(e.keyCode === 27) {
        document.querySelector(".video.full-screen").removeClass("full-screen");
        remote.BrowserWindow.getAllWindows()[0].setFullScreen(false);
      }
    });
    // splash setup
    setTimeout(function() {
      document.querySelector("body").css({
        "overflow": "hidden"
      });
      document.querySelector("#opening-splash div").css({
        "opacity": 1
      });
      setTimeout(function() {
        document.querySelector("#opening-splash").css({
          "opacity": 0
        });
        setTimeout(function() {
          document.querySelector("body").css({
            "overflow": ""
          });
          document.querySelector("#opening-splash").remove();
        }, 1000);
      }, 3000);
    }, 0);
  },
  reloadVideo: function(e) {
    // reloads the video player
    var target = e.target.parent().parent().querySelector("iframe");
    var originalSource = target.src;
    // ... by reassigning its own "src"
    target.src = originalSource;
  },
  closeVideo: function(e) {
    if(this.state.streamers.length > 1) {
      this.state.streamers.splice( parseInt(e.target.attributes["data-chat"].value), 1 );
      if(parseInt(e.target.attributes["data-chat"].value) > this.state.streamers.length-1) {
        this.state.streamerInView = this.state.streamers.length-1;
      }
      document.querySelector("#context-menu.streamer-options").addClass("hide");
      this.setState({});
    }
  },
  render: function render() {
    var elemInstance = this;
    return R.CE(
      "div",
      { "id" : "view-parent" },
      // render component for the main section of the page
      R.CE(window[this.state.history[this.state.history.length-1].page], { "parentAPI" : this }),
      // render component for the stream viewer (top-left corner)
      R.CE(
        "div",
        { "id" : "stream-viewer" },
        R.CE(
          "div",
          { "id" : "viewer-controls"},
          R.CE(
            "div",
            { "className" : "ctrl close", "onClick" : this.viewStream }
          ),
          R.CE(
            "div",
            { "className" : "ctrl display", "onClick" : this.viewStream }
          ),
          R.CE(
            "div",
            { "className" : "ctrl chat", "onClick" : this.viewStream }
          ),
          R.CE(
            "div",
            { "className" : "ctrl follow", "data-streamer" : `${this.state.streamers[this.state.streamerInView]}`, "onClick" : this.viewStream },
            `Follow ${this.state.streamers[this.state.streamerInView]}`
          ),
          R.CE(
            "div",
            { "className" : "ctrl unfollow", "data-streamer" : `${this.state.streamers[this.state.streamerInView]}`, "onClick" : this.viewStream },
            `Unfollow ${this.state.streamers[this.state.streamerInView]}`
          ),
          this.state.streamers.map(function(streamer, ind) {
            //ind = parseInt(ind);
            return R.CE(
              "div",
              { "className" : "ctrl toggle-chat", "data-chat" : ind, "onClick" : elemInstance.toggleChat, "title" : `${streamer}`, "key" : `toggle${ind}` },
              `Chat ${ind+1}`
            )
          })
        ),
        R.CE(
          "div",
          { "id" : `embed-area`},
          R.CE(
            "div",
            { "className" : `video-embed embedded-${this.state.streamers.length}` },
            this.state.streamers.map(function(streamer, ind) {
              //ind = parseInt(ind);
              return R.CE(
                "div",
                { "className" : `video embed-size-${elemInstance.state.streamers.length}${(ind === elemInstance.state.streamerInView) ? " in-view" : " out-view"}`, "key" : `${streamer}` },
                R.CE(
                  "iframe",
                  { "src" : `http://player.twitch.tv/?channel=${streamer}`, "frameBorder" : "0" }
                ),
                R.CE(
                  "div",
                  { "className" : "video-options" },
                  R.CE(
                    "div",
                    { "className" : "option info", "title" : "info", "data-streamer" : streamer, "onClick" : elemInstance.getPanels }
                  ),
                  R.CE(
                    "div",
                    { "className" : "option full-screenify", "title" : "fullscreen", "onClick" : elemInstance.fullScreenify }
                  ),
                  R.CE(
                    "div",
                    { "className" : "option reload", "title" : "reload", "data-chat" : ind, "onClick" : elemInstance.reloadVideo },
                    "RELOAD"
                  ),
                  (elemInstance.state.streamers.length > 1) ? R.CE(
                    "div",
                    { "className" : "option close", "title" : "close", "data-chat" : ind, "onClick" : elemInstance.closeVideo }
                  ) : null
                )
              )
            }),
            R.CE(
              "div",
              { "className" : `panels-box${(this.state.streamerPanels.length > 0) ? " open" : ""}` },
              R.CE(
                "div",
                { "className" : "close-panels", "onClick" : this.closePanels },
                "X"
              ),
              R.CE(
                "div",
                null,
                /*R.CE(
                  "span",
                  { "className" : "streamer-name" },
                  this.state.streamerPanels[0].channels
                ),*/
                this.state.streamerPanels.map(function(panel, ind) {
                  return R.CE(
                    "div",
                    { "className" : "col-3-2-1 panel-parent", "key" : `panel${ind}` },
                    R.CE(
                      "div",
                      { "className" : "panel" },
                      R.CE(
                        "div",
                        { "className" : "head" },
                        (!panel.data.title) ? "" : R.CE(
                          "span",
                          { "className" : "title" },
                          panel.data.title
                        ),
                        R.CE(
                          "a",
                          { "className" : "img-link", "href" : panel.data.link || "#" },
                          (!panel.data.image) ? "" : R.CE(
                            "img",
                            { "src" : panel.data.image }
                          )
                        )
                      ),
                      (!panel.data.description) ? "" : R.CE(
                        "div",
                        { "className" : "desc", "dangerouslySetInnerHTML" : { "__html" : panel.html_description } }
                      )
                    )
                  )
                })
              )
            )
          ),
          this.state.streamers.map(function(streamer, ind) {
            //ind = parseInt(ind);
            return R.CE(
              "div",
              { "className" : `chat-embed${(ind === elemInstance.state.streamerInView) ? "" : " hide"}`, "key" : `${streamer}` },
              R.CE(
                "div",
                { "className" : `chat-${ind}` },
                R.CE(
                  "div",
                  { "className" : "chat-cover", "onClick" : elemInstance.loginUser }
                ),
                R.CE(
                  "iframe",
                  { "src" : `http://twitch.tv/${streamer}/chat`, "frameBorder" : "0" }
                )
              )
            )
          })
        )
      ),
      // render component for the options bar (top-right corner)
      R.CE(OptionsBar, { "parentAPI" : this }),
      R.CE(
        "ul",
        { "id" : "context-menu", "className" : "streamer-options hide" },
        R.CE(
          "li",
          { "className" : "streamer-opt" },
          "Add Streamer To View"
        )
      )
    )
  }
});

// options - nav, search, login/out
var OptionsBar = R.CC({
  "displayName": "OptionsBar",

  componentDidMount: function() {
    //console.log(this.props)

    // elemInstance in any declaration is so that scoped variables still have access to "this"
    var elemInstance = this;

    // event listeners for option elements
    document.querySelector(".nav.search").addEventListener("submit", function(e) {
      e.preventDefault();
      if( e.target[0].value.match(/^(http(s)?:\/\/(www(\.)?)?multitwitch.tv)?(ms:\/\/)?/) && e.target[0].value.match(/^(http(s)?:\/\/(www(\.)?)?multitwitch.tv)?(ms:\/\/)?/).shift() ) {
        var arr = e.target[0].value.match(/(com)?\/(\/)?([\/\w]*)$/).pop().split("/");
        arr.map(function(elem) {
          if(elem) {
            console.log(elemInstance)
            elemInstance.props.parentAPI.state.hoveredStreamer = elem;
            elemInstance.props.parentAPI.appendStreamer();
          }
        });
      } else {
        accessView.pingForData({
          "target": {
            "attributes": {
              "data-search": {
                "value": e.target[0].value
              },
              "data-page-link": {
                "value": "StreamsListPage"
              }
            }
          }
        });
      }

      e.target[0].value = "";
    });

    // click event for back navigation
    document.querySelector(".nav.prev").addEventListener("click", function() {
      accessView.changeViewPrev()
    });

    // check for user login data
    remote.getCurrentWebContents().session.cookies.get({
      "name": "name"
    }, function(err, cookies) {
      ////console.log(cookies);
      if(cookies.length > 0 && twitchToken) {
        // if user is logged in, hide connect button
        document.querySelector(".nav.log").addClass("hide");
        document.querySelector("#embed-area").addClass("logged-in");

        // sets the current user name if it doesn't exist
        if(!concurrentData.username) {
          ajax({
            url: `https://api.twitch.tv/kraken/channel?oauth_token=${twitchToken}`,
            success: function(data) {
              data = JSON.parse(data);
              //console.log(data);
              concurrentData.username = data.display_name;
              concurrentData.links = data._links;
              remote.require("./handle-data").saveConcurrentData(concurrentData);
            },
            error: function(data) {
              //console.log(data)
            }
          });
        }
      }
    });
  },
  // function to log the user in
  loginUser: function(e) {
    Twitch.login({
      scope: ["channel_read", /*"user_blocks_edit", "user_blocks_read", */"user_follows_edit", /*"channel_editor", "channel_commercial", "channel_stream", "channel_subscriptions", "user_subscriptions", "channel_check_subscription", */"chat_login"]
    });
  },
  // function to log the user out
  logoutUser: function() {
    var elemInstance = this;

    remote.getCurrentWebContents().session.clearStorageData({
      storages: ["cookies"]
    }, function(err) {
      if(err) throw err;

      //console.log("storage data cleared");
        document.querySelector(".nav.log").removeClass("hide");
        document.querySelector("#embed-area").removeClass("logged-in");
    });
    twitchToken = null;
    concurrentData.username = null;
    concurrentData.links = null;
    //console.log("user logged out");
    var newHistory = elemInstance.props.parentAPI.state.history.filter(function(elem) {
      if( !elem.page.match(/AccountInfoPage/i) ) {
        return elem;
      }
    });
    elemInstance.props.parentAPI.setState({ "history" : newHistory });

  },
  render: function render() {
    var elemInstance = this;
    return R.CE(
      "div",
      { "id" : "options-bar"},
      R.CE(
        "div",
        { "className" : "nav prev" }
      ),
      R.CE(
        "form",
        { "className" : "nav search" },
        R.CE(
          "input",
          { "type" : "text", "name" : "search", "min" : "1", "placeholder" : "Search..." }
        ),
        R.CE(
          "input",
          { "type" : "submit", "value" : "GO" }
        )
      ),
      R.CE(
        "div",
        { "className" : "nav log"
        },
        R.CE(
          "img",
          { "src" : "http://ttv-api.s3.amazonaws.com/assets/connect_light.png", "className" : "twitch-connect", href : "#", "onClick" : this.loginUser }
        ),
        R.CE(
          "span",
           { "onClick" : this.logoutUser },
          "Logout"
        ),
        R.CE(
          "span",
           { "data-page-link" : "AccountInfoPage", "onClick" : this.props.parentAPI.pingForData },
          "Account"
        )
      )
    )
  }
});
// react pages
//////////////////////////////
var HomePage = R.CC({
  displayName: "HomePage",

  render: function render() {
    return R.CE(
      "div",
      { "id" : "home-page" },
      section(
        { "className" : "off-black" },
        R.CE(TopStreams)
      ),
      pageWrapSmall(
        null,
        normalSeparator
      ),
      section(
        null,
        pageWrapSmall(
          null,
          R.CE(
            "h1",
            { className : "section-title" },
            "Top Games"
          )
        )
      ),
      section(
        null,
        R.CE(TopGames)
      ),
      pageWrapSmall(
        null,
        normalSeparator
      ),
      section(
        null,
        pageWrapSmall(
          null,
          R.CE(
            "h1",
            { className : "section-title" },
            "Featured Streams"
          )
        )
      ),
      section(
        null,
        R.CE(FeaturedStreams)
      )
    );
  }
});
var GamesListPage = R.CC({
  displayName: "GamesListPage",

  componentDidMount: function() {
    this.props.parentAPI.searchForTopGame();
  },
  render: function render() {
    return R.CE(
      "div",
      { "id" : "games-list-page" },
      section(
        null,
        R.CE(GamesPage)
      )
    );
  }
});
var StreamsListPage = R.CC({
  displayName: "StreamsListPage",

  componentDidMount: function() {
    this.props.parentAPI.searchForStreamData();
    this.props.parentAPI.searchForChannelData();
  },
  render: function render() {
    return R.CE(
      "div",
      { "id" : "streams-page" },
      section(
        null,
        R.CE(StreamsPage)
      )
    )
  }
});
var AccountInfoPage = R.CC({
  displayName: "AccountInfoPage",

  render: function render() {
    return R.CE(
      "div",
      { "id" : "account-page" },
      section(
        null,
        R.CE(AccountPage)
      )
    )
  }
});

// page components
//////////////////////////////
/* home page */
var TopStreams = R.CC({
  displayName: "TopStreams",

  getStreams: function() {
    // sets variable to access the class object
    var elemInstance = this;
    ajax({
      url: "https://api.twitch.tv/kraken/streams/featured?limit=6",
      success: function(data) {
        elemInstance.setState({streams: JSON.parse(data)});
        //console.log("Top Streams", JSON.parse(data));
      },
      error: function(data) {
        //console.log(data)
      }
    });
  },
  getInitialState: function() {
    return { "streams" : {}, "index" : 0 };
  },
  componentDidMount: function() {
    this.getStreams();
  },
  setStream: function(e) {
    if(!e.target.parentNode.className.match(/selected/gi)) {
      this.setState({ "index" : e.target.parentNode.attributes["data-item-index"].value });
      document.querySelector(".top-stream-item.selected").removeClass("selected");
      e.target.parentNode.addClass("selected");
    }
  },
  render: function render() {
    if(!this.state.streams.featured) {
      return false;
    }
    // sets variable to access the class object
    var elemInstance = this;

    return pageWrapSmall(
      { "className" : "" },
      R.CE(
        "div",
        { "id" : "top-streams", "className" : "right-justify" },
        R.CE(
          "div",
          { "className" : "top-streams-viewer" },
          R.CE(
            "iframe",
            { "className" : "video", "src" : `http://player.twitch.tv?channel=${this.state.streams.featured[this.state.index].stream.channel.name}`, "width" : "100%", "height" : "100%", "frameBorder" : "0" }
          )
        ),
        R.CE(
          "div",
          { "className" : "top-streams-info" },
          R.CE(
            "div",
            { "className" : "top-stream-channel" },
            R.CE(
              "div",
              { "className" : "image-div" },
              R.CE(
                "img",
                { "className" : "", "src" : this.state.streams.featured[this.state.index].stream.channel.logo }
              )
            ),
            R.CE(
              "div",
              { "className" : "details-div" },
              R.CE(              "span",
                { "className" : "" },
                `${this.state.streams.featured[this.state.index].stream.channel.display_name}`
              ),
              R.CE(
                "br",
                null
              ),
              R.CE(
                "span",
                null,
                `playing ${this.state.streams.featured[this.state.index].stream.game}`
              )
            )
          ),
          R.CE(
            "h1",
            { "className" : "section-title" },
            this.state.streams.featured[this.state.index].title
          ),
          R.CE(
            "p",
            null,
            this.state.streams.featured[this.state.index].text.replace(/<br>[\n]*.*/gi, "").replace(/<(\/)?p>/gi, ""),
            R.CE(
              "br",
              null
            ),
            R.CE(
              "br",
              null
            ),
            R.CE(
              "a",
              { "href" : "#", "className" : "stream-link", "data-stream-link" : this.state.streams.featured[this.state.index].stream.channel.name, "onClick" : accessView.viewStream },
              "watch this stream"
            )
          )
        ),
        R.CE(
          "ul",
          { "id" : "top-streams-list", "className" : "" },
          this.state.streams.featured.map(function(item, ind) {
            return R.CE(
              "li",
              { "key" : "top-stream-item" + ind, "className" : `${(ind === elemInstance.state.index) ? "selected" : ""} top-stream-item col-6-5-4-3-2-1`, "data-item-index" : ind },
              R.CE(
                "img",
                { "src" : item.stream.preview.medium, "onClick" : elemInstance.setStream }
              )
            )
          })
        )
      )
    )
  }
});
var TopGames = R.CC({
  displayName: "TopGames",

  getGames: function() {
    var elemInstance = this;
    ajax({
      url: "https://api.twitch.tv/kraken/games/top?limit=12",
      success: function(data) {
        elemInstance.setState({games: JSON.parse(data)});
        //console.log("Top Games", JSON.parse(data));
      },
      error: function(data) {
        //console.log(data)
      }
    });
  },
  getInitialState: function() {
    return { games : {} };
  },
  componentDidMount: function() {
    this.getGames();
  },
  componentWillUpdate: function(nextProps, nextState) {
    ////console.log(nextState)
  },
  render: function render() {
    if(!this.state.games.top) {
      return false;
    }
    return pageWrapSmall(
      null,
      R.CE(
        "div",
        { "id" : "top-games" },
        R.CE(
          "ul",
          { "id" : "games-list", "className" : "" },
          this.state.games.top.map(function(item, ind) {
            return R.CE(
              "li",
              { "key" : "game-item" + ind, "className" : "game-item col-6-5-4-3-2-1", "data-page-link" : "StreamsListPage", "data-search": item.game.name, "onClick" : accessView.pingForData },
              R.CE(
                "img",
                { "src" : item.game.box.large }
              ),
              R.CE(
                "h1",
                { "className" : "title" },
                `${item.game.name}`
              ),
              R.CE(
                "span",
                { "className" : "stats" },
                R.CE(
                  "span",
                  null,
                  `Viewers: ${item.viewers}`
                ),
                smallSeparator,
                R.CE(
                  "span",
                  null,
                  `Channels: ${item.channels}`
                )
              )
            )
          })
        ),
        R.CE(
          "div",
          { "className" : "right-justify" },
          R.CE(
            "div",
            { "className" : "pointer link bold inline-block", "data-page-link" : "GamesListPage", "onClick" : accessView.pingForData },
            "View all games"
          )
        )
      )
    )
  }
});
var FeaturedStreams = R.CC({
  displayName: "FeaturedStreams",

  getStreams: function() {
    var elemInstance = this;
    ajax({
      url: "https://api.twitch.tv/kraken/streams/featured?limit=6",
      success: function(data) {
        elemInstance.setState({streams: JSON.parse(data)});
        //console.log("Top Streams", JSON.parse(data));
      },
      error: function(data) {
        //console.log(data)
      }
    });
  },
  getInitialState: function() {
    return { streams : {} };
  },
  componentDidMount: function() {
    this.getStreams();
  },
  componentWillUpdate: function(nextProps, nextState) {
    ////console.log(nextState)
  },
  render: function render() {
    if(!this.state.streams.featured) {
      return false;
    }
    return pageWrapSmall(
      null,
      R.CE(
        "div",
        { "id" : "featured-streams" },
        R.CE(
          "ul",
          { "id" : "featured-streams-list", "className" : "" },
          this.state.streams.featured.map(function(item, ind) {
            return R.CE(
              "li",
              { "key" : "featured-stream-item" + ind, "className" : "featured-stream-item col-3-2-1", "data-stream-link" : item.stream.channel.name, "onClick" : accessView.viewStream },
              R.CE(
                "img",
                { "src" : item.stream.preview.large }
              ),
              R.CE(
                "h1",
                { "className" : "title"},
                `${item.title}`
              ),
              R.CE(
                "span",
                { "className" : "stats" },
                R.CE(
                  "span",
                  null,
                  `${item.stream.viewers} viewers on `,
                  R.CE(
                    "span",
                    { "className" : "bold" },
                    `${item.stream.channel.display_name}`
                  )
                )
              )
            )
          })
        ),
        R.CE(
          "div",
          { "className" : "right-justify" },
          R.CE(
            "div",
            { "className" : "pointer link bold inline-block", "data-page-link" : "StreamsListPage", "onClick" : accessView.pingForData },
            "View all streams"
          )
        )
      )
    )
  }
});

/* pages page */
var GamesPage = R.CC({
  displayName: "TopGames",

  render: function render() {
    return pageWrapSmall(
      null,
      R.CE(
        "div",
        { "id" : "top-games" },
        R.CE(
          "ul",
          { "id" : "games-list", "className" : "" },
          accessView.state.streamSearchResults.map(function(item, ind) {
            return R.CE(
              "li",
              { "key" : "game-item" + ind, "className" : "game-item col-6-5-4-3-2-1", "data-page-link" : "StreamsListPage", "data-search": item.game.name, "onClick" : accessView.pingForData },
              R.CE(
                "img",
                { "src" : item.game.box.large }
              ),
              R.CE(
                "h1",
                { "className" : "title" },
                `${item.game.name}`
              ),
              R.CE(
                "span",
                { "className" : "stats" },
                R.CE(
                  "span",
                  null,
                  `Viewers: ${item.viewers}`
                ),
                smallSeparator,
                R.CE(
                  "span",
                  null,
                  `Channels: ${item.channels}`
                )
              )
            )
          })
        ),
        R.CE(
          "div",
          { "className" : "right-justify" },
          R.CE(
            "div",
            { "className" : "pointer link bold inline-block", "onClick" : accessView.searchForTopGame },
            "Load more games"
          )
        )
      )
    )
  }
});
/* streams page */
var StreamsPage = R.CC({
  "displayName": "StreamsPage",

  render: function render() {
    var elemInstance = this;
    var historyPoint = accessView.state.history[accessView.state.history.length-1];
    // console.log(historyPoint)
    // console.log(accessView.state.streamSearchResults);
    // console.log(accessView.state.channelSearchResults);

    return pageWrapNormal(
      null,
      R.CE(
        "div",
        { "id" : "top-streams" },
        /* section title */
        pageWrapNormal(
          null,
          R.CE(
            "h1",
            { "className" : "section-title" },
            `Live Streams ${(historyPoint.search) ? `for "${historyPoint.search}"` : ""}`
          )
        ),
        /* section */
        R.CE(
          "ul",
          { "id" : "featured-streams-list", "className" : "" },
          accessView.state.streamSearchResults.map(function(item, ind) {
            return R.CE(
              "li",
              { "key" : "featured-stream-item" + ind, "className" : "featured-stream-item col-6-5-4-3-2-1", "data-stream-link" : ((item.stream) ? item.stream.channel.name : item.channel.name), "onClick" : accessView.viewStream },
              R.CE(
                "img",
                { "src" : (((item.stream) ? item.stream.preview.large : item.preview.large)) || "http://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_150x150.png" }
              ),
              R.CE(
                "h1",
                { "className" : "title"},
                `${((item.title) ? item.title : item.channel.status)}`
              ),
              R.CE(
                "span",
                { "className" : "stats" },
                R.CE(
                  "span",
                  null,
                  `${((item.stream) ? item.stream.viewers : item.viewers)} viewers on `,
                  R.CE(
                    "span",
                    { "className" : "bold" },
                    `${((item.stream) ? item.stream.channel.name : item.channel.display_name)}`
                  )
                )
              )
            )
          })
        ),
        /* section manual pagination */
        R.CE(
          "div",
          { "className" : "right-justify" },
          R.CE(
            "div",
            { "className" : "pointer link bold inline-block", "onClick" : accessView.searchForStreamData },
            "Load more streams"
          )
        ),
        /* separator */
        pageWrapSmall(
          null,
          normalSeparator
        ),
        /* section title */
        pageWrapNormal(
          null,
          R.CE(
            "h1",
            { "className" : "section-title" },
            `Channel results ${(historyPoint.search) ? `for "${historyPoint.search}"` : ""}`
          )
        ),
        /* section */
        R.CE(
          "ul",
          { "id" : "featured-streams-list", "className" : "" },
          accessView.state.channelSearchResults.map(function(item, ind) {
            return R.CE(
              "li",
              { "key" : "featured-stream-item" + ind, "className" : "featured-stream-item col-6-5-4-3-2-1", "data-stream-link" : item.name, "onClick" : accessView.viewStream },
              R.CE(
                "img",
                { "src" : item.logo || "http://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_150x150.png" }
              ),
              R.CE(
                "h1",
                { "className" : "title"},
                `${item.display_name}`
              )
            )
          })
        ),
        /* section manual pagination */
        R.CE(
          "div",
          { "className" : "right-justify" },
          R.CE(
            "div",
            { "className" : "pointer link bold inline-block", "onClick" : accessView.searchForChannelData },
            "Load more streams"
          )
        )
      )
    )
  }
});
/* account page */
var AccountPage = R.CC({
  "displayName": "AccountPage",

  getInitialState: function() {
    return { "following" : [], "followingLimit" : 6*4, "followingOffset" : 0, "followers" : [], "followersLimit" : 6*4, "followersOffset" : 0, "filter" : "all" };
  },
  componentDidMount: function() {
    var elemInstance = this;

    // get list of streams the current user is following
    this.loadFollowingChannels();

    // get list of user following the current user
    this.loadFollowerChannels();
  },
  loadFollowingChannels: function(offset) {
    if(typeof offset !== "number") {
      offset = this.state.followingOffset+1;
    }
    var elemInstance = this;

    // get list of streams the current user is following
    ajax({
      url: `https://api.twitch.tv/kraken/users/${concurrentData.username.toLowerCase()}/follows/channels?offset=${elemInstance.state.followingOffset * elemInstance.state.followingLimit}&limit=${elemInstance.state.followingLimit}`,
      success: function(data) {
        data = JSON.parse(data);

        // check the live status of each stream
        data.follows.map(function(elem) {
          ajax({
            url: `https://api.twitch.tv/kraken/streams/${elem.channel.name}`,
            success: function(dataToCheckLive) {
              dataToCheckLive = JSON.parse(dataToCheckLive)

              // sets a key value to online or offline, depending on the status of the stream
              elem.stream = dataToCheckLive.stream;

              // push the stream object to the array
              elemInstance.state.following.push(elem);

              // refresh the state-dependent components
              elemInstance.setState({ "followingOffset" : offset });
            },
            error: function(err) {
              //console.log(`Status: ${err.status}`, `Message: ${err.message}`)
            }
          });
        });
      },
      error: function(err) {
        //console.log(`Status: ${err.status}`, `Message: ${err.message}`)
      }
    });
  },
  loadFollowerChannels: function(offset) {
    if(typeof offset !== "number") {
      offset = this.state.followingOffset+1;
    }
    var elemInstance = this;

    // get list of user following the current user
    ajax({
      url: `${concurrentData.links.follows}?offset=${elemInstance.state.followersOffset * elemInstance.state.followersLimit}&limit=${elemInstance.state.followersLimit}`,
      success: function(data) {
        data = JSON.parse(data);
        data.follows.map(function(elem) {
          elemInstance.state.followers.push(elem);
        });
        elemInstance.setState({ "followersOffset" : offset });
      },
      error: function(err) {
        //console.log(`Status: ${err.status}`, `Message: ${err.message}`)
      }
    });
  },
  refreshStreams: function(e) {
    var elemInstance = this;

    if(e.target.attributes["data-section"].value === "following") {
      this.state.following.map(function(elem, ind) {
        ajax({
          url: `https://api.twitch.tv/kraken/streams/${elem.channel.name}`,
          success: function(dataToCheckLive) {
            dataToCheckLive = JSON.parse(dataToCheckLive)

            // sets a key value to online or offline, depending on the status of the stream
            elemInstance.state.following[ind].stream = dataToCheckLive.stream;
            // //console.log(elemInstance.state.following[ind])

            // refresh the state-dependent components
            elemInstance.setState({ "following" : elemInstance.state.following });
          },
          error: function(err) {
            //console.log(`Status: ${err.status}`, `Message: ${err.message}`)
          }
        });
      });
    }
  },
  filterList: function(e) {
    var filter = e.target.attributes["data-filter"].value;

    this.setState({ "filter" : filter });
  },
  render: function render() {
    var elemInstance = this;

    return pageWrapNormal(
      null,
      R.CE(
        "div",
        { "id" : "top-streams" },
        // page title
        pageWrapNormal(
          null,
          R.CE(
            "h1",
            { "className" : "section-title" },
            `Account Info of ${concurrentData.username}`
          )
        ),
        // separator
        pageWrapSmall(
          null,
          normalSeparator
        ),
        // section title
        pageWrapNormal(
          null,
          R.CE(
            "div",
            null,
            R.CE(
              "div",
              { "className" : "col-2 left-justify" },
              R.CE(
                "h1",
                { "className" : "section-title" },
                `Streams you follow`
              )
            ),
            R.CE(
              "div",
              { "className" : "col-2 right-justify" },
              R.CE(
                "div",
                { "className" : `btn btn-spaced${(this.state.filter === "all") ? " btn-selected" : "" }`, "data-section" : "following", "data-filter" : "all", "onClick" : this.filterList },
                `Show All`
              ),
              R.CE(
                "div",
                { "className" : `btn btn-spaced${(this.state.filter === "online") ? " btn-selected" : "" }`, "data-section" : "following", "data-filter" : "online", "onClick" : this.filterList },
                `Show Online`
              ),
              R.CE(
                "div",
                { "className" : `btn btn-spaced`, "data-section" : "following", "onClick" : this.refreshStreams },
                `Refresh streams`
              )
            )
          )
        ),
        // section
        R.CE(
          "ul",
          { "id" : "following-streams-list", "className" : `filter-${this.state.filter}` },
          this.state.following.map(function(item, ind) {
            return R.CE(
              "li",
              { "key" : "following-stream-item" + ind, "className" : `following-stream-item col-6-5-4-3-2-1${(item.stream) ? "" : " offline" }`, "data-stream-link" : item.channel.name, "onClick" : accessView.viewStream },
              R.CE(
                "img",
                { "src" : item.channel.logo || "http://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_150x150.png" }
              ),
              R.CE(
                "h1",
                { "className" : "title"},
                `${item.channel.display_name}`
              ),
              R.CE(
                "span",
                { "className" : "stats" },
                R.CE(
                  "span",
                  { "className" : `bold${(item.stream) ? " online" : " offline"} ` },
                  `${(item.stream) ? `Online playing ${item.channel.game}` : "Offline" }`
                )
              )
            )
          })
        ),
        // section manual pagination
        R.CE(
          "div",
          { "className" : "right-justify" },
          R.CE(
            "div",
            { "className" : "pointer link bold inline-block", "data-section" : "following", "onClick" : elemInstance.loadFollowingChannels },
            "Load more streams"
          )
        ),
        // separator
        pageWrapSmall(
          null,
          normalSeparator
        ),
        // section title
        pageWrapNormal(
          null,
          R.CE(
            "h1",
            { "className" : "section-title" },
            `Users that follow you`
          )
        ),
        // section
        R.CE(
          "ul",
          { "id" : "followers-streams-list", "className" : "" },
          this.state.followers.map(function(item, ind) {
            return R.CE(
              "li",
              { "key" : "followers-stream-item" + ind, "className" : "followers-stream-item col-6-5-4-3-2-1", "data-stream-link" : (item.user.name), "onClick" : accessView.viewStream },
              R.CE(
                "img",
                { "src" : item.user.logo || "http://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_150x150.png" }
              ),
              R.CE(
                "h1",
                { "className" : "title"},
                `${item.user.display_name}`
              )
            )
          })
        ),
        // section manual pagination
        R.CE(
          "div",
          { "className" : "right-justify" },
          R.CE(
            "div",
            { "className" : "pointer link bold inline-block", "data-section" : "followers", "onClick": elemInstance.loadFollowerChannels },
            "Load more users"
          )
        )
      )
    )
  }
});

var accessView = ReactDOM.render(R.CE(ViewParent, null), document.getElementById("main-content"));