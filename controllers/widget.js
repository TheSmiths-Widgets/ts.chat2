$._resizeThreshold = 0;

/**
 * @method init
 * Initialize the widget. MUST be called before any further action.
 * @param {Object} config The configuration of the module
 * @param {Number} config.batchSize How many message should be ask for each load [OPTIONAL, default 10]
 * @param {Number} config.maxTypingHeight The max size of the typing area, if decimal less than 1, a
 *      corresponding percentage of the screen size will be used. [OPTIONAL, default 0.25]
 * @param {Object[]} config.messages Initial set of messages [REQUIRED]
 */
function init(config) {
    /* Retrieve the configuration */
    if (config.maxTypingHeight && Math.abs(+config.maxTypingHeight) < 1) {
        config.maxTypingHeight = Ti.Platform.displayCaps.platformHeight * +config.maxTypingHeight;
    }

    /* Syncrhonize external collection with the one in the widget */
    $.messages.reset();
    $.messages.add(config.messages.models);

    // When the outter collection is updated...
    config.messages.on('fetch destroy change add remove reset', function (e) {
        $.messages.models = $._config.messages.models;
        renderMessages(e); // Force UI update
    });

    $._config = _.extend({
        batchSize: 10, // Default number of messages to display
        maxTypingHeight: Ti.Platform.displayCaps.platformHeight * 0.25 // Not more that 25% of the screen height
    }, config);

    if (OS_ANDROID) {
        /* On android, the stored size isn't the good one. Need to be weighted with the density */
        $._config.maxTypingHeight /= Ti.Platform.displayCaps.logicalDensityFactor;
    }

    if (OS_IOS) {
        var control = Ti.UI.createRefreshControl({
            tintColor:'blue'
        });

        $.listView.refreshControl = control;
        control.addEventListener('refreshstart', function(e){
            setTimeout(function(){
                control.endRefreshing();
            }, 2000);
        });
    }

    setTimeout(scrollToBottom, 500); // TODO something more beautiful, elegant, clean...
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

    if (typingAreaHeight > $._config.maxTypingHeight) {
        /* The area is bigger than the limit, let's resize */
        $.typingArea.height = $._config.maxTypingHeight;
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
 * Listener of the send button. Trigger a 'newMessage' event.
 * @param {appcelerator: Titanium.UI.Button-event-click Button-event-click} clickEvent The corresponding event
 * @fires newMessage
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
    $.trigger('newMessage', newmessageEvent);
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
    transform.template = transform.emitter == Alloy.User.get('objectId')? "messageOnTheRight" : "messageOnTheLeft";
    transform.created_at = getDisplayableDate(model.get('created_at'));
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
$.listView.addEventListener('itemclick', _snatchFocus);


var listViewSetBottom = function () {
    $.chatTextFieldContainer.removeEventListener('postlayout',listViewSetBottom);
    $.listView.setBottom($.chatTextFieldContainer.rect.height);
};

$.chatTextFieldContainer.addEventListener('postlayout', listViewSetBottom);

/* Exports the API */
exports.init = init;
exports.destroy = function () {
    $.messages.off('fetch destroy change add remove reset', renderMessages);
    $._config.messages.off('fetch destroy change add remove reset', renderMessages);
};

