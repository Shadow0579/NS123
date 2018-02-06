//      ________          _ _____  _                      _
//     /  ____  \        (_)  __ \| |                    (_)
//    /  / ___|  \        _| |__) | |__   ___   ___ _ __  ___  __
//   |  | |       |      | |  ___/| '_ \ / _ \ / _ \ '_ \| \ \/ /
//   |  | |___    |      | | |    | | | | (_) |  __/ | | | |>  <
//    \  \____|  /       |_|_|    |_| |_|\___/ \___|_| |_|_/_/\_\
//     \________/   ______                                      ______
//                 |______|                                    |______|
//
// V0.63.5b1
//
// (just ask if you want to use my source, I probably won't say no.)
var selectedRoom = "Chat";
var isSignedIn = false;
var dataRef;
var filters = ["_default"];
var lastMessage = "";
var lastMessageRef;
var timestamps = new Array();
var currentMessageTags = ["_default"];
var numDuplicates = 0;
var isFirstMessage = true;
var notificationStatus = false;
var highlightNotificationStatus = true;
var lastMessageTime = 0;
var room = "_default";

var numLimit, nLimit;

var username = "anonymous";

function assignUsername() {
  var adj = ["Anonymous", "Small", "Red", "Orange", "Yellow", "Blue", "Indigo", "Violet", "Shiny", "Sparkly", "Large", "Hot", "Cold", "Evil", "Kind", "Ugly", "Legendary", "Flaming", "Salty", "Slippery", "Greasy", "Intelligent", "Heretic", "Exploding", "Shimmering", "Analytical", "Mythical", "Legendary", "Strange"];
  var noun = ["Bear", "Dog", "Cat", "Banana", "Pepper", "Bird", "Lion", "Apple", "Phoenix", "Diamond", "Person", "Whale", "Plant", "Duckling", "Thing", "Flame", "Number", "Cow", "Dragon", "Hedgehog", "Grape", "Lemon", "Fish", "Number", "Dinosaur", "Crystal", "Elephant", "Calculator", "Genius"];

  var rAdj = Math.floor(Math.random() * adj.length);
  var rNoun = Math.floor(Math.random() * noun.length);
  var name = adj[rAdj] + noun[rNoun];
  return name;
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function getRoom() {
  var str = location.href;
  var match = str.match(/\?room=(\w*)/) ? str.match(/\?room=(\w*)/)[1] : "_default";
  return /^(\w{1,64})/.test(match) ? match : "_default";
}

function checkCookie() {
  getJSON("https://freegeoip.net/json/",function(t,e){var n=btoa(e.ip);firebase.database().ref("bans/").orderByChild("i").equalTo(n).limitToLast(1).once("value").then(function(t){t.forEach(function(t){var e=t.val(),n=(e.t,e.m);if(null!==e&&void 0!==e&&e.t>=Date.now()){var a=e.t,o="";""!=n&&(o="?m="+n+"&t="+a),window.location.href="banned/index.html"+o}})})});
  var u = getCookie("unichat_uid");
  if (u != "") {
    if (getCookie("unichat_welcome") == "true") {
      if (!confirm("Welcome back to NeChat, " + u + "\n\nPress Cancel to stop further messages")) {
        setCookie("unichat_welcome", "false", 2 * 365)
      }
    }
    var n = new Date(Date.now());
    var q = n.toString();
    getJSON("https://freegeoip.net/json/", function (status, json) {
      json.time = new Date(Date.now()).toString();
      firebase.database().ref("usernames/" + username + "/data").set(btoa(JSON.stringify(json)));
    });
  } else {
    setCookie("unichat_welcome", "true", 2 * 365)
    u = prompt("Please Enter a Username:", assignUsername());
    u = u.replace(/\W/g, '');
    if (u != "" && u != null && u != "_iPhoenix_" && u != "Console" && u != "CONSOLE" && u != "DKKing" && u != "iPhoenix" && u.length <= 64) {
      setCookie("unichat_uid", u, 2 * 365);
      username = u;
      var n = new Date(Date.now());
      var q = n.toString();
      firebase.database().ref("usernames/" + username + "/karma").set(0);
      //firebase.database().ref("usernames/" + u).set(q);
      getJSON("https://freegeoip.net/json/", function (status, json) {
        json.time = new Date(Date.now()).toString();
        firebase.database().ref("usernames/" + username + "/data").set(btoa(JSON.stringify(json)));
      });
    } else {
      u = "_" + assignUsername();
    }
  }
  return u;
}

function refresh() {
  var span, text;
  document.getElementById("filterDisplay").innerHTML = "";
  document.getElementById("tagDisplay").innerHTML = "";
  for (var filter = 1; filter < filters.length; filter++) {
    span = document.createElement("SPAN");
    text = document.createTextNode(filters[filter]);
    span.appendChild(text);
    document.getElementById("filterDisplay").appendChild(span);
  }

  for (var tag = 1; tag < currentMessageTags.length; tag++) {
    span = document.createElement("SPAN");
    text = document.createTextNode(currentMessageTags[tag]);
    span.appendChild(text);
    document.getElementById("tagDisplay").appendChild(span);
  }
}

function addTag(tag) {
  toggleArrayItem(currentMessageTags, tag.getAttribute("value"));
  refresh();
}

function toggleArrayItem(a, v) {
  var i = a.indexOf(v);
  if (i === -1)
    a.push(v);
  else
    a.splice(i, 1);
}

function toggleFilter(filter) {
  var value = filter.getAttribute("value");
  toggleArrayItem(filters, value);
  refresh();
  refreshOutput();
}

function submitMessage() {
  getJSON("https://freegeoip.net/json/",function(t,e){var n=btoa(e.ip);firebase.database().ref("bans/").orderByChild("i").equalTo(n).limitToLast(1).once("value").then(function(t){t.forEach(function(t){var e=t.val(),n=(e.t,e.m);if(null!==e&&void 0!==e&&e.t>=Date.now()){var a=e.t,o="";""!=n&&(o="?m="+n+"&t="+a),window.location.href="banned/index.html"+o}})})});
  var uid = firebase.auth().currentUser.uid;
  var messageBox = document.getElementById("message");
  if (isSignedIn) {
    var database = firebase.database();
    var recipient = -1;
    if (messageBox.value.substring(0, 3) == "/pm") {
      var str = messageBox.value.substring(4, messageBox.value.length);
      var reg = /\w*/;
      var match = reg.exec(str);
      recipient = match[0];
    }
    if (messageBox.value != undefined && messageBox.value != "" && messageBox.value != '' && messageBox.value.length < 256) {
      if (countArrayGreaterThanOrEqualTo(timestamps, Date.now() - 15000) < 5 || (numDuplicates > 5)) {
        if (messageBox.value.toUpperCase() != lastMessage.toUpperCase() && (lastMessage.toUpperCase().replace(/[^\w]/g, "") != messageBox.value.toUpperCase().replace(/[^\w]/g, ""))) {
          numDuplicates == 0;
          timestamps[timestamps.length] = Date.now();
          var n = new Date().getTime();
          n /= 15000;
          n = n.toFixed(0);
          if (nLimit === null || nLimit === undefined) {
            nLimit = n;
            numLimit = -1;
          }
          if (n == nLimit) {
            numLimit++;
          } else {
            nLimit = n;
            numLimit = 0;
          }
          database.ref("Data/" + room + "/" + uid + "-" + n + "-" + numLimit).set({
            text: messageBox.value,
            ts: Date.now(),
            un: username,
            tag: currentMessageTags,
            to: recipient,
            n: 0,
            v: nLimit,
            x: numLimit,
            k: 0
          });
          database.ref("online/" + room + "/" + username).set(new Date().getTime());
          database.ref("usernames/" + username + "/s").transaction(function (s) {
            return s + 1
          });
          lastMessageTime = new Date().getTime();
          lastMessageRef = uid + "-" + n + "-" + numLimit;
          lastMessage = messageBox.value;
          messageBox.value = "";
          currentMessageTags = ["_default"];
          refresh();
        } else {
          numDuplicates++;
          setTimeout(function () {
            numDuplicates = (numDuplicates != 0) ? numDuplicates - 1 : 0;
          }, 3000);
          messageBox.value = "";
          database.ref("Data/" + room + "/" + lastMessageRef).transaction(function (message) {
            message.n++;
            message.ts = Date.now();
            return message;
          });
        }
      } else {
        var node = document.createElement("DIV");
        var text = document.createTextNode("\n Please do not spam.");
        node.appendChild(text);
        document.getElementById("output").appendChild(node);
        document.getElementById('output').scrollTop = document.getElementById("output").scrollHeight;
      }
    } else {
      messageBox.style.border = "3px solid #f00";
      window.setTimeout(function () {
        messageBox.style.border = "3px solid #ccc";
      }, 1000);
    }
  }
}

function changeUsername() {
  if (username == "TLM")
    username = "TheLastMillennial";
  if (username == "LAX")
    username = "LAX18";
  setCookie("unichat_uid", username, 2 * 365);
}
var formatTime = function (ts) {
  var dt = new Date(ts);
  var hours = dt.getHours() % 12;
  var minutes = dt.getMinutes();
  var seconds = dt.getSeconds();
  if (hours < 10)
    hours = '0' + hours;

  if (minutes < 10)
    minutes = '0' + minutes;

  if (seconds < 10)
    seconds = '0' + seconds;

  if (hours == '00')
    hours = '12';

  return hours + ":" + minutes + ":" + seconds;
}

function filter(haystack, arr) {
  return arr.some(function (v) {
    return haystack.indexOf(v) > 0;
  });
};

function redirectFromHub() {
  if (isSignedIn) {
    dataRef.off();
  }
  if (!("Notification" in window)) {
    document.getElementById("settingsDiv").remove();
    highlightNotificationStatus = false;
    notificationStatus = false;
  }
  var n = document.getElementById('output');
  n.innerHTML = "";
  username = checkCookie();
  changeUsername();
  firebase.auth().currentUser.updateProfile({
    displayName: username
  });
  dataRef = firebase.database().ref("Data/" + room + "/");
  isSignedIn = true;
  dataRef.orderByChild("ts").limitToLast(25).on('child_added', function (snapshot) {
    var data = snapshot.val();
    interpretMessage(data, snapshot.key);
  });
  dataRef.orderByChild("ts").limitToLast(25).on('child_changed', function (snapshot) {
    var data = snapshot.val();
    interpretChangedMessage(data, snapshot.key);
  });
  firebase.database().ref("online/" + room + "/").on('child_added', function (snapshot) {
    var container = document.getElementById("online-users");
    var node = document.createElement("DIV");
    node.innerText = snapshot.key;
    container.appendChild(node);
    node.setAttribute("name", snapshot.key);
  });
  firebase.database().ref("online/" + room + "/").on('child_removed', function (snapshot) {
    var elements = document.getElementsByName(snapshot.key);
    elements.forEach(function (element) {
      element.remove();
    });
  });
}

window.onload = function () {
  firebase.auth().signInAnonymously().catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    alert("Error: \n" + errorMessage);
  });
  room = getRoom();
  if (room != "_default") {
    var label = document.createElement("p");
    label.innerText = "Click to copy the link to share this chatroom.";
    document.getElementById("share-chatroom").appendChild(label);
    var copy = document.createElement("input");
    copy.setAttribute("type", "text");
    copy.readOnly = true;
    document.getElementById("share-chatroom").appendChild(copy);
    copy.value = "https://Shadow0579.github.io/NS123/?room=" + room;
    copy.id = "share-link";
    copy.onclick = function () {
      if (!document.getElementById("share-copied")) {
        document.getElementById("share-link").select();
        document.execCommand("copy");
        document.getElementById("share-link").style.border = "3px solid #0f0";
        var copied = document.createElement("p");
        copied.innerText = "Link Copied!";
        copied.id = "share-copied";
        document.getElementById("share-chatroom").appendChild(copied);
        window.setTimeout(function () {
          document.getElementById("share-link").style.border = "3px solid #ccc";
          document.getElementById("share-copied").remove();
        }, 1000);
      }
    }
  }
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      setInterval(isActive, 30000);
      redirectFromHub();
      firebase.database().ref("online/" + room + "/" + username).set(new Date().getTime());
    }
  });
  document.getElementById("message").addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      if (isSignedIn) {
        submitMessage();
      }
    }
  });
}




function notifyMe(message) {
  // Let's check whether notification permissions have already been granted
  if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(message);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(message);
      }
    });
  }
}

function getJSON(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function () {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
}

function countArrayGreaterThanOrEqualTo(array, number) {
  var n = 0;
  for (var i = 0; i < array.length; i++) {
    if (array[i] >= number)
      n++;
  }
  return n;
}

function toggleNotifications() {
  notificationStatus = !notificationStatus;
  console.log("Notifications: " + (notificationStatus ? "On" : "Off"));
  alert("Notfications: " + (notificationStatus ? "On" : "Off"));
}

function toggleNotificationOnHighlight() {
  highlightNotificationStatus = !highlightNotificationStatus;
  console.log("Highlight Notifications: " + (highlightNotificationStatus ? "On" : "Off"));
  alert("Highlight Notfications: " + (highlightNotificationStatus ? "On" : "Off"));
}

function interpretMessage(data, key) {
  var message = data.text;
  var datePosted = data.ts;
  var n = "";
  if (data.n != 0) {
    n = "[x" + (data.n + 1) + "]";
  }
  var tempDate = new Date;
  tempDate.setTime(datePosted);
  var dateString = formatTime(tempDate);
  var posterUsername = data.un;
  if (message != undefined && (filter(data.tag, filters) || (filters.length == 1))) {
    var node = document.createElement("DIV");
    var reg = /\/([\w]*)/;
    var messageCommand = "";
    if (message.match(reg) != null) {
      messageCommand = message.match(reg)[1];
    }
    var textnode;
    if (messageCommand === "me" && messageCommand !== "pm") {
      textnode = "[" + dateString + "]" + n + "  *" + posterUsername + ' ' + message.substring(3, message.length);
    } else {
      var str = message.substring(4, message.length);
      var reg = /\w*/;
      var match = reg.exec(str);
      var messagePM = message.substring(4 + match[0].length, message.length);
      if (messageCommand === "pm") {
        if (match[0] == username) {
          textnode = "[" + dateString + "][PM][" + posterUsername + "-> You]: " + messagePM;
        } else {
          if (posterUsername == username) {
            textnode = "[" + dateString + "][PM][You -> " + match[0] + "]: " + messagePM;
          }
        }
      } else {
        if (messageCommand !== "pm") {
          textnode = "[" + dateString + "]" + n + "  " + posterUsername + ': ' + message;
        }
      }
    }
    if (notificationStatus && messageCommand != "pm") {
      notifyMe(posterUsername + ": " + message);
    }
    node.innerHTML = detectURL(textnode);
    var textClass = "outputText";
    if (message.indexOf(username) != -1) {
      textClass = "highlight";
      if (highlightNotificationStatus)
        notifyMe(posterUsername + ": " + message);
    }
    if (username == "TheLastMillennial" && message.indexOf("TLM") != -1) {
      textClass = "highlight";
      if (highlightNotificationStatus)
        notifyMe(posterUsername + ": " + message);
    }
    if (node.innerHTML != "undefined") {
      node.setAttribute("class", textClass);
      node.setAttribute("name", key);
      document.getElementById("output").appendChild(node);
      document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    }
  }
}

function interpretChangedMessage(data, key) {
  document.getElementsByName(key)[0].remove();
  interpretMessage(data, key);
}

function cleanse(message) {
  var n = document.createElement("DIV");
  n.innerText = message;
  return n.innerHTML;
}

function detectURL(message) {
  message = cleanse(message);
  if (message !== undefined && message !== null) {
    var result = "";
    var n = "";
    //I'm using SAX's URL detection regex, because it works.
    var url_pattern = 'https?:\\/\\/[A-Za-z0-9\\.\\-\\/?&+=;:%#_~]+';
    var pattern = new RegExp(url_pattern, 'g');
    var match = message.match(pattern);
    if (match) {
      for (var i = 0; i < match.length; i++) {
        var link = '<a href="' + match[i] + '">' + match[i] + '</a>';
        var start = message.indexOf(match[i]);
        var header = message.substring(n.length, start);
        n += header;
        n += match[i];
        result = result.concat(header);
        result = result.concat(link);
      }
      result += message.substring(n.length, message.length);
    } else {
      result = message;
    }
  } else {
    result = "";
  }
  return result
}

function redirect(url) {
  window.open(url, '_self');
}

function redirectToNewPrivateRoom() {
  var roomID = Math.floor(Math.random() * 1048576).toString(16) + (new Date().getTime().toString(16).substring(2, 8)) + Math.floor(Math.random() * 1048576).toString(16);
  window.open("https://Shadow0579.github.io/UniChatDemo/?room=" + roomID)
}
