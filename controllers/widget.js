$._resizeThreshold = 0;
$._oldFirstVisibleItemIndex = -1;

var _TAG = "ts.chat2",
    _ERRORS = {
        MISSING_FUNCTION_VALIDATE: "A function to determine the sender of messages is required",
        MISSING_MESSAGES: "A Backbone collection of messages is required"
    },
    _CONFIG = {
        validateSender: undefined, // Required by user
        messages: undefined, // Required by user

        /* Customisable */
        backgroundColor: "#fff",
        backgroundColorLeft: '#ddd',
        backgroundColorRight: '#bbb',
        colorLeft: 'black',
        colorRight: 'black',
        backgroundColorBottomBar: '#eee',
        sendButton: {
            title: '>',
            color: "white",
            borderRadius: 25,
            backgroundColor:         "#00AA00",
            backgroundFocusedColor:  "#33CC33",
            backgroundSelectedColor: "#33CC33"
        },
        typingArea: {
            color: "#222",
            backgroundColor: "white"
        },

        /* Fixed, shoudn't be modified */
        maxTypingHeight: Ti.Platform.displayCaps.platformHeight * 0.25, // Not more that 25% of the screen height
        delay: 500 // Before scrolling to the bottom
};

/**
 * @method init
 * Initialize the widget. MUST be called before any further action.
 * @param {Object} config The configuration of the module
 * @param {Object[]} config.messages Initial set of messages [REQUIRED]
 * @param {Function} config.validateSender Function that takes one argument, a model. Must returns TRUE if the message is from you and then has to be displayed on the right side, otherwise it returns FALSE [REQUIRED]
 */
function init(config) {
    /* First of all, ensure that necessary options have been supplied */
    if (config.validateSender === undefined) { throw(_TAG + " " + _ERRORS.MISSING_FUNCTION_VALIDATE); }
    if (config.messages       === undefined) { throw(_TAG + " " + _ERRORS.MISSING_MESSAGES); }

    _.extend(_CONFIG, config);

    /* Syncrhonize external collection with the one in the widget */
    $.messages.reset();
    $.messages.add(config.messages.models);

    // When the outter collection is updated...
    config.messages.on('fetch destroy change add remove reset', function (e) {
        $.messages.models = _CONFIG.messages.models;
        renderMessages(e); // Force UI update
    });

    if (OS_ANDROID) {
        /* On android, the stored size isn't the good one. Need to be weighted with the density */
        _CONFIG.maxTypingHeight /= Ti.Platform.displayCaps.logicalDensityFactor;
    }

    $.container.setBackgroundColor(_CONFIG.backgroundColor);
    $.chatTextFieldContainer.setBackgroundColor(_CONFIG.backgroundColorBottomBar);
    $.sendBtn.applyProperties(_CONFIG.sendButton);
    $.typingArea.applyProperties(_CONFIG.typingArea);

    setTimeout(scrollToBottom, _CONFIG.delay); // TODO something more beautiful, elegant, clean...
}

/**
 * @private
 * @method _resizeTypingArea
 * Avoid the area to become too 'tall' while typing a message
 * @param {?} clickEvent The corresponding event
 */
function _resizeTypingArea (changeEvent) {
    var typingAreaHeight = $.typingArea.rect.height,
        length           = $.typingArea.value.length;

    if (typingAreaHeight > _CONFIG.maxTypingHeight) {
        /* The area is bigger than the limit, let's resize */
        $.typingArea.height = _CONFIG.maxTypingHeight;
         //Keep an eye on the length that trigger this change
        $._resizeThreshold = $._resizeThreshold || length;
    } else if (length < $._resizeThreshold) {
        /* The area is becoming smaller, let it handle its own size like a grown up */
        $.typingArea.setHeight(Ti.UI.SIZE);
    }
    $.listView.setBottom($.chatTextFieldContainer.rect.height);
}

/**
 * @private
 * @method scrollToBottom
 * Scroll the list view to the bottom, to display the most recent messages
 */
function scrollToBottom() {
    $.listView.scrollToItem(0, $.messages.models.length - 1, {
        animated : true
    });

}

/**
 * @private
 * @method _send
 * Listener of the send button. Trigger a 'newmessage' event.
 * @param {appcelerator: Titanium.UI.Button-event-click Button-event-click} clickEvent The corresponding event
 * @fires newmessage
 */
function _send(clickEvent) {
    if (0 === $.typingArea.value.length) return;
    $.sendBtn.touchEnabled = false;

    /*
     * Triggered when the user send a message
     * @event newMessage
     * @param {Object} message The message entered
     * @param {Date} date The date at which it has been send
     * @param {Function} success Callback to call once the message has been successfully handled
     * @param {Function} error Callback to call if an error occured
     */
    var newmessageEvent = {
        message: $.typingArea.value,
        created_at: new Date(),
        success: function () {
            $.typingArea.value = "";
            _resizeTypingArea();
            $.sendBtn.touchEnabled = true;
            scrollToBottom();
        },
        error: function () {
            $.sendBtn.touchEnabled = true;
        }
    };
    $.trigger('newmessage', newmessageEvent);
}

/**
 * @private
 * @method getDisplayableDate
 * Takes a Date as an argument and returns a String (either a date or a time).
 * Basically, if the Date provided is today, no matter what time it is, it will return the time of the argument (HH:mm). Otherwise, it will return the date of the argument (formatted to the current locale).
 * @param {Date} date A date
 * @returns {String} A date to display (either a date or a time)
 */
function getDisplayableDate(date) {
    var today = new Date();
    if (typeof date === 'string') {
        date = new Date(date);
    }
    if (today.getYear() == date.getYear() && today.getMonth() == date.getMonth() && today.getDate() == date.getDate()) {
        return date.getHours() + ':' + date.getMinutes();
    } else
        return date.toLocaleDateString(Titanium.Locale.currentLocale);
}

/**
 * @private
 * @method setTemplate
 * DO NOT CALL IT YOURSELF. It's a method called by Titanium before displaying each message.
 * Basically, it formats the fields.
 * @param {appcelerator: Alloy.Model} model A message (model 'Message')
 * @returns {Object} A JSON version of the message, ready to be displayed
 */
function setTemplate(model) {
    var transform = model.toJSON() ; // collection of messages
    transform.template = _CONFIG.validateSender(model) ? "messageOnTheRight" : "messageOnTheLeft";
    transform.created_at = getDisplayableDate(model.get('created_at'));
    transform.bg = transform.template === 'messageOnTheLeft' ? _CONFIG.backgroundColorLeft : _CONFIG.backgroundColorRight;
    transform.color = transform.template === 'messageOnTheLeft' ? _CONFIG.colorLeft : _CONFIG.colorRight;
    return transform;
}

/**
 * @private
 * @method _snatchFocus
 * Listener that handle clicks on the tableview. It removes the focus on the typing area.
 * @param {appcelerator: Titanium.UI.Button-event-click} clickEvent The corresponding event
 */
function _snatchFocus(clickEvent) {
    $.typingArea.blur();
}

/* Workaround for iOS: resize the whole window when the keybord appears */
(function fixes () {
    if (OS_IOS) {
        Ti.App.addEventListener('keyboardframechanged', function (e) {
            $.container.bottom = (e.keyboardFrame.y < Ti.Platform.displayCaps.platformHeight) ?
                e.keyboardFrame.height
                :
                0;
        });
    }
})();



/* ----------- LISTENERS ----------- */
/* THIS FUNCTION IS SUPPOSED TO BE CALLED ONLY ONCE */
function listViewSetBottom() {
    $.chatTextFieldContainer.removeEventListener('postlayout',listViewSetBottom);
    $.listView.setBottom($.chatTextFieldContainer.rect.height);
}

/**
 * @private
 * @method scrollEnded
 * Listener of the end of a scroll action on the list view
 * @param {appcelerator: Titanium.UI.ListView event} scrollEvent The corresponding event
 * @fires moremessages
 */
function scrollEnded(scrollEvent) {
    if (scrollEvent.firstVisibleItemIndex !== $._oldFirstVisibleItemIndex && scrollEvent.firstVisibleItemIndex === 0)
        $.trigger('moremessages');
    $._oldFirstVisibleItemIndex = scrollEvent.firstVisibleItemIndex;
}

$.listView.addEventListener('itemclick', _snatchFocus);
$.chatTextFieldContainer.addEventListener('postlayout', listViewSetBottom);
$.listView.addEventListener('scrollend', scrollEnded);

function toggleInputEnabled(bool) {
    $.typingArea.setEditable(bool);
    $.sendBtn.setEnabled(bool);
}

/* Exports the API */
exports.init = init;
exports.destroy = function() {
    // Listeners on data
    $.messages.off('fetch destroy change add remove reset', renderMessages);
    _CONFIG.messages.off('fetch destroy change add remove reset', renderMessages);

    // Listeners on views
    $.listView.removeEventListener('itemclick', _snatchFocus);
    $.listView.removeEventListener('scrollend', scrollEnded);
};
exports.disable = function() {
    toggleInputEnabled(false);
};
exports.enable = function() {
    toggleInputEnabled(true);
};
exports.hideInput = function() {
    $.container.remove($.chatTextFieldContainer);
};
exports.showInput = function() {
    $.container.add($.chatTextFieldContainer);
};