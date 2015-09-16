$._resizeThreshold = 0;

$._config = {
    maxTypingHeight: Ti.Platform.displayCaps.platformHeight * 0.25 // Not more that 25% of the screen height
};

if (OS_ANDROID) { 
    /* On android, the stored size isn't the good one. Need to be weighted with the density */
    $._config.maxTypingHeight /= Ti.Platform.displayCaps.logicalDensityFactor; 
}

/**
 * @private
 * @method _resizeTypingArea
 * Avoid the area to become too large while typing a message
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
 * @method _send
 * Listener of the send button. Trigger a 'newMessage' event.
 * @param {appcelerator: Titanium.UI.Button-event-click Button-event-click} clickEvent The corresponding event
 * @fires newMessage
 */
function _send (clickEvent) {
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
        date: new Date(),
        success: function () {
            $.typingArea.value = "";
            _resizeTypingArea();
            $.sendBtn.touchEnabled = true;
        },
        error: function () {
            $.sendBtn.touchEnabled = true;
        }
    };
    $.trigger('newMessage', newmessageEvent);
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

var listener = function () {
    $.chatTextFieldContainer.removeEventListener('postlayout',listener);
    $.listView.setBottom($.chatTextFieldContainer.rect.height);
};

$.chatTextFieldContainer.addEventListener('postlayout', listener);