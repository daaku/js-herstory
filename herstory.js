/**
 * A port of the jquery.history plugin by Mikage that does not rely on jquery.
 *
 * http://www.mikage.to/jquery/jquery_history.html
 */
var Herstory = {
  /**
   * The current hash value.
   *
   * @access private
   */
  current: undefined,

  /**
   * Callback handler for when a change is seen.
   *
   * Is called after:
   *  - init
   *  - load
   *  - back/forward button
   *
   * @access private
   */
  callback: undefined,

  /**
   * The work horse iframe for IE.
   *
   * @access private
   */
  iframe: undefined,

  /**
   * What has the world come to. Oh wait.
   *
   * @access private
   */
  safari: /webkit/.test(navigator.userAgent.toLowerCase()),
  msie: (
    /msie/.test(navigator.userAgent.toLowerCase()) &&
    !/opera/.test(navigator.userAgent.toLowerCase())
  ),

  /**
   * Initialize the history management system.
   *
   * @access public
   * @param callback {Function} the callback function for when the hash changes
   * @param src      {String}   the src for the iframe used in IE
   * @param delegate {Boolean}  boolean indicating automatic href handling in IE
   *                             (defaults to true)
   */
  init: function(callback, src, delegate) {
    Herstory.current  = location.hash.replace(/\?.*$/, '');
    Herstory.callback = callback;

    if (Herstory.msie) {
      // To stop the callback firing twice during initilization if no hash
      // present
      if (Herstory.current === '') {
        Herstory.current = '#';
      }

      // add hidden iframe for IE
      var div = document.body.appendChild(document.createElement('div'));
      div.innerHTML = (
        '<iframe style="display: none;"' +
          (src ? ' src="' + src + '"' : '') +
        '></iframe>'
      );
      Herstory.iframe = div.firstChild;

      var iframe = Herstory.iframe.contentWindow.document;
      iframe.open();
      iframe.close();
      iframe.location.hash = Herstory.current;

      if (typeof delegate == 'undefined' || delegate) {
        // delegate all click events from the document and do some work
        // if its got a href
        document.attachEvent(
          'onclick',
          function(event) {
            var href = (event &&
                        event.srcElement &&
                        event.srcElement.href) || '';
            if (Herstory.handleHrefFragment(href)) {
              event.returnValue = false;
              window.scrollTo(0, 0);
            }
          }
        );
      }
    } else if (Herstory.safari) {
      // etablish back/forward stacks
      Herstory.rwStack        = [];
      Herstory.rwStack.length = history.length;
      Herstory.ffStack        = [];
      Herstory.lastLength     = history.length;
      Herstory.isFirst        = true;
    }

    Herstory.callback(Herstory.current.replace(/^#/, ''));
    setInterval(Herstory.check, 100);
  },

  /**
   * Handle the given href, if necessary. This is used in IE for
   * handling click events.
   *
   * @access private
   * @param href {String} the href to process
   * @returns {Boolean} true if a fragment was handled
   */
  handleHrefFragment: function(href) {
    var hashPos = href.indexOf('#');
    if (hashPos < 0) {
      // no fragment, nothing to do
      return false;
    } else if (hashPos !== 0) {
      // url & fragment, check if its on the current page
      if (href.charAt(0) == '/' &&
          href.substr(0, hashPos) != window.location.path) {
        // relative path and a mismatch
        return false;
      } else {
        var
          currentHash = window.location.href.indexOf('#'),
          currentPage = window.location.href.substr(
            0, (currentHash < 0 ? undefined : currentHash));
        if (href.substr(0, hashPos) != currentPage) {
          // absolute path and a mismatch
          return false;
        }
      }
    }

    // if we get here, its a match
    Herstory.load(href.substr(hashPos + 1));
    return true;
  },

  add: function(hash) {
    // This makes the looping function do something
    Herstory.rwStack.push(hash);
    Herstory.ffStack.length = 0; // clear forwardStack (true click occured)
    Herstory.isFirst = true;
  },

  check: function() {
    if (Herstory.msie) {
      // On IE, check for location.hash of iframe
      var
        fr           = Herstory.iframe,
        iframe       = fr.contentDocument || fr.contentWindow.document,
        current_hash = iframe.location.hash.replace(/\?.*$/, '');

      if (current_hash != Herstory.current) {
        location.hash = current_hash;
        Herstory.current = current_hash;
        Herstory.callback(current_hash.replace(/^#/, ''));
      }
    } else if (Herstory.safari) {
      if (
          Herstory.lastLength == history.length &&
          Herstory.rwStack.length > Herstory.lastLength) {
        Herstory.rwStack.shift();
      }

      if (!Herstory.dontCheck) {
        var historyDelta = history.length - Herstory.rwStack.length;
        Herstory.lastLength = history.length;

        if (historyDelta) { // back or forward button has been pushed
          Herstory.isFirst = false;
          if (historyDelta < 0) { // back button has been pushed
            // move items to forward stack
            for (var i = 0; i < Math.abs(historyDelta); i++) {
              Herstory.ffStack.unshift(Herstory.rwStack.pop());
            }
          } else { // forward button has been pushed
            // move items to back stack
            for (var j = 0; j < historyDelta; j++) {
              Herstory.rwStack.push(Herstory.ffStack.shift());
            }
          }
          var cachedHash = Herstory.rwStack[Herstory.rwStack.length - 1];
          if (cachedHash !== undefined) {
            Herstory.current = location.hash.replace(/\?.*$/, '');
            Herstory.callback(cachedHash);
          }
        } else if (
                  Herstory.rwStack[Herstory.rwStack.length - 1] === undefined &&
                  !Herstory.isFirst) {
          // back button has been pushed to beginning and URL already pointed
          // to hash (e.g. a bookmark)
          // document.URL doesn't change in Safari
          if (location.hash) {
            var current_hash = location.hash;
            Herstory.callback(location.hash.replace(/^#/, ''));
          } else {
            var current_hash = '';
            Herstory.callback('');
          }
          Herstory.isFirst = true;
        }
      }
    } else {
      // otherwise, check for location.hash
      var current_hash = location.hash.replace(/\?.*$/, '');
      if (current_hash != Herstory.current) {
        Herstory.current = current_hash;
        Herstory.callback(current_hash.replace(/^#/, ''));
      }
    }
  },

  load: function(hash) {
    var newhash;
    hash = decodeURIComponent(hash.replace(/\?.*$/, ''));

    if (Herstory.safari) {
      newhash = hash;
    } else {
      newhash = '#' + hash;
      location.hash = newhash;
    }
    Herstory.current = newhash;

    if (Herstory.msie) {
      var iframe = Herstory.iframe.contentWindow.document;
      iframe.open();
      iframe.close();
      iframe.location.hash = newhash;
      Herstory.lastLength = history.length;
      Herstory.callback(hash);
    } else if (Herstory.safari) {
      Herstory.dontCheck = true;
      // Manually keep track of the history values for Safari
      Herstory.add(hash);

      // Wait a while before allowing checking so that Safari has time to
      // update the "history" object correctly (otherwise the check loop would
      // detect a false change in hash).
      window.setTimeout(function() {Herstory.dontCheck = false;}, 200);
      Herstory.callback(hash);
      // N.B. "location.hash=" must be the last line of code for Safari as
      // execution stops afterwards.  By explicitly using the "location.hash"
      // command (instead of using a variable set to "location.hash") the URL
      // in the browser and the "history" object are both updated correctly.
      location.hash = newhash;
    } else {
      Herstory.callback(hash);
    }
  }
};
