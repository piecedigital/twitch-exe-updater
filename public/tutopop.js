var tutoPop = function(tutArr, color, index, nextCB, closeCB) {
	// This variable is the structure for our tutorial dialog box
	var tutBox = function(text, x, y, side, offset, maxWidth) {
	  text = text || "???";
	  x = x + "px" || "50%";
	  y = y + "px" || "50%";
	  side = side || "top";
	  offset = offset || 0;
	  var minWidth = 10 * 16;
	  maxWidth = maxWidth || 15 * 16;

	  return $("<div>").css({
	  	"z-index": "1000",
	  	"position": "fixed",
	    "top": y,
	    "left": x,
	  	"transform": "translate(-50%, -50%) scale(0.9)",
	  	"min-width": minWidth + "px",
	  	"max-width": maxWidth + "px",
	  	"padding": "16px",
	  	"border-radius": "16px",
	  	"background-color": bgColor,
	  	"color": textColor,
	  	"box-shadow": "0 0 " + .4 * 16 + "px 0 black",
	  	"opacity": "0"
	  }).html(
	    $("<div>").append(
	      $("<div>").addClass("arrow " + side).css({
	      	"overflow": "hidden",
	      	"position": "absolute",
	      	"width": 3.5 * 16 + "px",
	      	"height": 1.75 * 16 + "px",
	      	"top": (side === "top") ? -1.75 * 16 + "px" : (side === "right") ? 50+offset+"%" : (side === "bottom") ? "100%" : 50+offset+"%",
	      	"left": (side === "top") ? 50+offset+"%" : (side === "right") ? "100%" : (side === "bottom") ? 50+offset+"%" : "0%",
	      	"transform": (side === "top") ? "translate(-50%, 0) rotateZ(0deg)" : (side === "right") ? "translate(-25%, -50%) rotateZ(90deg)" : (side === "bottom") ? "translate(-50%, 1%) rotateZ(180deg)" : "translate(-75%, -50%) rotateZ(-90deg)",
	      	"box-shadow": "0 20px 0 -6px " + bgColor
	      }).html( $("<div>").css({
	      	"transform": "rotateZ(45deg)",
	      	"display": "block",
	      	"margin": .75 * 16 + "px auto 0",
	      	"background-color": bgColor,
	      	"width": "32px",
	      	"height": "32px",
	      	"box-shadow": "0 0 " + .4 * 16 + "px 0 black"
	      }) ),
	      $("<p>").css({
	      	"word-wrap": "break-word"
	      }).html(text),
	      $("<div>").css({
	      	"background-color": textColor,
	      	"height": "1px",
	      	"margin": .5 * 16 + "px 0",
	      	"opacity": "0.5"
	      }),
	      $("<div>").css({
	      	"width": "50%",
	      	"display": "inline-block",
	      	"text-align": "left"
	      }).html(
	        $("<span>").addClass("quit").css({
	        	"cursor": "pointer"
	        }).html("X")
	      ),
	      $("<div>").css({
	      	"width": "50%",
	      	"display": "inline-block",
	      	"text-align": "right"
	      }).html(
	        $("<span>").addClass("next").css({
	        	"cursor": "pointer"
	        }).html("Next")
	      )
	    )
	  );
	};

	return {
		timeline: function(options) {
			options = options || {};
			var fadeIn = (typeof options.fadeIn === "number") ? options.fadeIn : .5;
			bgColor = "#9be0ff",
			textColor = "#017ab1";
			
			if(color && typeof color === "object") {
				bgColor = (color[0]) ? color[0] : bgColor,
				textColor = (color[1]) ? color[1] : textColor;
			}
			
			tutArr = tutArr || [],
			index = index || 0,
			nextCB = nextCB || null,
			closeCB = closeCB || null;

			// box for highlighting
			var tutHighlight = function(x, y, width, height, radius) {
			  x = x + "px" || "50%";
			  y = y + "px" || "50%";
			  width = ((width + 32) || "100") + "px";
			  height = ((height + 32) || "100") + "px";
			  radius = (radius || "16") + "px";

			  var opacity = options.opacity || ".5";
			  var color = options.color || "black";

			  return $("<div>").css({
			  	"z-index": "1000",
		  		"position": "fixed",
		  		"top": 0,
		  		"left": 0,
		  		"width": "100%",
		  		"height": "100%",
		  		"pointer-events": "all"
		  	}).html(
		  		$("<div>").css({
				    "position": "fixed",
				    "top": y,
				    "left": x,
				    "width": width,
				    "height": height,
				  	"transform": "translate(-50%, -50%)",
				  	"box-shadow": "0 0 0 1920px " + color + ", inset 0 0 16px 10px " + color,
	          "border-radius": radius,
	          "opacity": opacity
				  })
		  	);
			};

			// This is the function that brings together all of the components created above
			// It initiates the tutorial dialog box.
			// Here we pass in the array, index (optional), callback for next (optional), and callback for close (optional)
			var tutRun = function(arr, ind, nextFunc, closeFunc) {
			  ind = ind || 0;
			  var thisHLBox = (options.highlight) ? new tutHighlight(arr[ind].highlightX + 16, arr[ind].highlightY + 16, arr[ind].highlightWidth, arr[ind].highlightHeight, arr[ind].highlightRadius) : "";
			  var thisTutBox = new tutBox(arr[ind].msg, arr[ind].dialogX + 16, arr[ind].dialogY + 16, arr[ind].side, arr[ind].offset, arr[ind].maxWidth);

			  $("body").append($(thisHLBox), $(thisTutBox));
			  setTimeout(function() {
			    $(thisTutBox).css({
			    	"transition": fadeIn + "s all",
			    	"opacity": "1",
			    	"transform": "translate(-50%, -50%) scale(1)"
			    });
			  }, 100);

			  if( Math.ceil($(thisTutBox).offset().left + $(thisTutBox).width() + 16) >= $(document).width() ) {
			    $(thisTutBox).css("left", ($(document).width() - ($(thisTutBox).width() / 2)) - 16);
			  }

			  if( Math.floor($(thisTutBox).offset().left) <= 0 ) {
			    $(thisTutBox).css("left", (0 + $(thisTutBox).width() / 2) + 16);
			  }
			  
			  if( Math.ceil($(thisTutBox).offset().top + $(thisTutBox).height() + 16) >= $(document).height() ) {
			    $(thisTutBox).offset().css("top", $(document).height() - $(thisTutBox).height());
			  }
			  
			  if( Math.floor($(thisTutBox).offset().top) <= 0 ) {
			    $(thisTutBox).offset().css("top", 0 + 16);
			  }
			  
			  $(thisTutBox).find(".next").on("click", function() {
			  	$(thisHLBox).remove();
			  	thisHLBox = null;
			    $(thisTutBox)[0].remove();
			    thisTutBox = null;
			    if(nextFunc && typeof nextFunc === "function") { nextFunc(arr, ind, nextFunc, closeFunc); };
			    if(ind < arr.length-1) { tutRun(arr, ind+1, nextFunc, closeFunc); nextFunc = null; };
			  });
			  $(thisTutBox).find(".quit").on("click", function() {
			    if(closeFunc && typeof closeFunc === "function") { closeFunc(arr, ind, nextFunc, closeFunc); nextFunc = null; };
			    $(thisHLBox).remove();
			    thisHLBox = null;
			    $(thisTutBox)[0].remove();
			    thisTutBox = null;
			  });
			}
			tutRun(tutArr, index, nextCB, closeCB);
		},
		oneTime: function(options) {
			bgColor = "#9be0ff",
			textColor = "#017ab1";
			
			if(color && typeof color === "object") {
				bgColor = (color[0]) ? color[0] : bgColor,
				textColor = (color[1]) ? color[1] : textColor;
			}
			
			tutArr = tutArr || [],
			index = index || 0,
			nextCB = nextCB || null,
			closeCB = closeCB || null;
			var fadeIn = (typeof options.fadeIn === "number") ? options.fadeIn : .5;

			// This is the function that brings together all of the components created above
			// It initiates the tutorial dialog box.
			// Here we pass in the array, index (optional), callback for next (optional), and callback for close (optional)
			var tutRun = function(tut, ind, nextFunc, closeFunc) {
			  ind = ind || 0;
			  var thisTutBox = new tutBox(tut.msg, tut.dialogX + 16, tut.dialogY + 16, tut.side);

			  $("body").append($(thisTutBox));
			  setTimeout(function() {
			    $(thisTutBox).css({
			    	"transition": fadeIn + "s all",
			    	"opacity": "1",
			    	"transform": "translate(-50%, -50%) scale(1)"
			    });
			  }, 100);

			  if( Math.ceil($(thisTutBox).offset().left + $(thisTutBox).width() + 16) >= $(document).width() ) {
			    $(thisTutBox).css("left", ($(document).width() - ($(thisTutBox).width() / 2)) - 16);
			  }

			  if( Math.floor($(thisTutBox).offset().left) <= 0 ) {
			    $(thisTutBox).css("left", (0 + $(thisTutBox).width() / 2) + 16);
			  }
			  
			  if( Math.ceil($(thisTutBox).offset().top + $(thisTutBox).height() + 16) >= $(document).height() ) {
			    $(thisTutBox).offset().css("top", $(document).height() - $(thisTutBox).height());
			  }
			  
			  if( Math.floor($(thisTutBox).offset().top) <= 0 ) {
			    $(thisTutBox).offset().css("top", 0 + 16);
			  }
			  
			  $(thisTutBox).find(".next").on("click", function() {
			    $(thisTutBox)[0].remove();
			    thisTutBox = null;
			    if(nextFunc && typeof nextFunc === "function") { nextFunc(tut, ind, nextFunc, closeFunc); };
			  });
			  $(thisTutBox).find(".quit").on("click", function() {
			    if(closeFunc && typeof closeFunc === "function") { closeFunc(tut, ind, nextFunc, closeFunc); nextFunc = null; };
			    $(thisTutBox)[0].remove();
			    thisTutBox = null;
			  });
			}
			for(var tut in tutArr) {
				tutRun(tutArr[tut], index, nextCB, closeCB);
			}
		}
	}
};

if(module && module.exports) module.exports.tutoPop = tutoPop;