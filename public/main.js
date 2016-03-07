var appVersion = "0.6.3";

window.$ = module.exports;
window.jQuery = module.exports;
var remote = require("remote");

var restartApp = function() {
  var app = remote.require("app")
  var exec = require("child_process").exec;
  exec("electron .");
  app.quit();
};

var ajax = function(optionsObj) {
  //console.log(optionsObj)
  optionsObj = optionsObj || {};

  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function(data) {
    if(httpRequest.readyState === 4) {
      if(httpRequest.status < 400) {
        optionsObj.success(data.target.response);
      } else {
        optionsObj.error({
          "status": data.target.status,
          "message": data.target.statusText
        });
      }
    }
  }
  contentTypes = {
    json: "application/json",
    text: "text/plain"
  }

  httpRequest.open(((optionsObj.type || "").toUpperCase() || "GET"), optionsObj.url);
  httpRequest.setRequestHeader("Content-Type", `${contentTypes[(optionsObj.dataType || "json")]}; charset=UTF-8`);
  //httpRequest.send((JSON.stringify(optionsObj.data) || null));
  httpRequest.send((optionsObj.data || null));
};

Array.prototype.include = function(data) {
  return this.indexOf(data) >= 0;
};

Object.prototype.push = function(value) {
  var keys = Object.keys(this);
  this[keys.length-1] = value;
  this.length = keys.length;

  keys = undefined;
  return this;
};

Object.prototype.include = function(value) {
  var keys = Object.keys(this);
  for(var key in keys) {
    if(this[key] === value) {
      return true;
    }
  }

  keys = undefined;
  return false;
};

Object.prototype.resortObject = function() {
  var keys = Object.keys(this), values = [];

  for(var i = 0; i < keys.length; i++) {
    if(keys[i] !== "length") {
      values[i] = this[keys[i]];
      delete this[keys[i]];
      this[i] = values[i];
    }
  }
  return this;
};

Object.prototype.splice = function(startValue, endValue) {
  endValue = endValue + startValue;
  for(var i = startValue; i < endValue; i++) {
    delete this[i];
  }
  var keys = Object.keys(this);
  this.length = keys.length-1;
  this.resortObject();

  keys = undefined;
  return this;
};

Object.prototype.map = function(callback) {
  try {
    var arr = [];
    var keys = Object.keys(this);

    for(var i = 0; i < keys.length; i++) {
      if(keys[i] !== "length") {
        if(keys[i].match(/^[0-9]*$/)) {
          keys[i] = parseInt(keys[i]);
        }
        var returnData = callback(this[keys[i]], keys[i], this);
        if(returnData) { arr.push(returnData) };
        returnData = null;
      }
    }
    return arr;
  }
  catch(e) {
    if(e.toString().match("TypeError: callback is not a function")) {
      //console.error("No callback provided");
    } else {
      //console.error(e);
    }
  }
};

var parseBufferData = function(data) {
  if(Array.isArray(data)) {
    return data.map(function(buff) {
      return String.fromCharCode( parseInt( buff.toString(2), 2 ) );
    }).join("");
  }
}

HTMLElement.prototype.addClass = function() {
  if(this) {
    //console.log("ADD CLASS");
    var classNameArr = (this.className || "").split(" ");
    //console.log("classNameArr", classNameArr);

    for(var i = 0; i < arguments.length; i++) {
      if(!this.className.match(arguments[i])) {
        classNameArr.push(arguments[i]);
      }
    }

    //console.log("className", this.className);
    this.className = classNameArr.join(" ");
    //console.log("className", this.className);

    classNameArr = null;

    return this;
  }
};

HTMLElement.prototype.removeClass = function() {
  if(this) {
    //console.log("REMOVE CLASS");
    var classNameArr = this.className.split(" ") || [];
    //console.log("classNameArr", classNameArr);

    if( classNameArr.indexOf(arguments[0]) >= 0 ) {
      classNameArr.splice( classNameArr.indexOf(arguments[0]), 1 );
    }

    //console.log("className", this.className);  
    this.className = classNameArr.join(" ");
    //console.log("className", this.className);

    classNameArr = null;

    return this;
  }
};

HTMLElement.prototype.toggleClass = function() {
  if(this) {
    if(this.className.match(arguments[0])) {
      this.removeClass(arguments[0]);
    } else {
      this.addClass(arguments[0]);
    }
    return this;
  }
};

HTMLElement.prototype.hasClass = function(className) {
  if(this) {
    var thisClassName = this.className.split(" ");
    //console.log("HAS CLASS");

    if(typeof className === "object") {
      var classNameArr = className;
    } else {
      var classNameArr = [className];
    }
    var result = false;

    for(var i = 0; i < classNameArr.length; i++) {
      for(var j = 0; j < thisClassName.length; j++) {
        //console.log("classnames", classNameArr[i], thisClassName[j])
        if(classNameArr[i] === thisClassName[j]) {
          result = true;
          i = classNameArr.length;
        }
      }
      if(result) i = thisClassName.length;
    }

    //console.log("result", result);

    return result;
  }
};

HTMLElement.prototype.css = function(property, value) {
  if(this) {
    //console.log("APPLY CSS");

    if(typeof property === "string") {
      this.style[property] = value;
    } else {
      for(var prop in property) {
        this.style[prop] = property[prop];
      }
    }

    //console.log("style", this.style);

    return this;
  }
};

HTMLElement.prototype.parent = function(property, value) {
  if(this) {
    //console.log("RETURN PARENT");
    try {
      return this.parentNode;
    }
    catch(e) {
      console.error(e);
    }
  }
};
HTMLElement.prototype.remove = function() {
  if(this) {
    //console.log("REMOVE NODE");

    //console.log(this);
    this.parentNode.removeChild(this);
    //console.log(this);
  }
};