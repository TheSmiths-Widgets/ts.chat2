$._resizeThreshold = 0;

$._dateOptions = {
    weekday: "short", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit", second: undefined
};
/**
 * @method init
 * Initialize the widget. MUST be called before any further action.
 * @param {Object} config The configuration of the module
 * @param {Number} config.batchSize How many message should be ask for each load [OPTIONAL, default 10]
 * @param {Number} config.maxTypingHeight The max size of the typing area, if decimal less than 1, a
 *      corresponding percentage of the screen size will be used. [OPTIONAL, default 0.25]
 * @param {Object[]} config.messages Initial set of messages [REQUIRED]
 */
function init (config) {
    /* Retrieve the configuration */
    if (config.maxTypingHeight && Math.abs(+config.maxTypingHeight) < 1) {
        config.maxTypingHeight = Ti.Platform.displayCaps.platformHeight * +config.maxTypingHeight;
    }

    /* Syncrhonize external collection with the one in the widget */
    $.messages.reset();
    $.messages.add(config.messages.models);

    config.messages.on('fetch destroy change add remove reset', function (e) {
        $.messages.models = $._config.messages.models;
        renderMessages(e);
    });

    $._config = _.extend({
        batchSize: 10,
        maxTypingHeight: Ti.Platform.displayCaps.platformHeight * 0.25 // Not more that 25% of the screen height
    }, config);

    if (OS_ANDROID) {
        /* On android, the stored size isn't the good one. Need to be weighted with the density */
        $._config.maxTypingHeight /= Ti.Platform.displayCaps.logicalDensityFactor;
    }
    /* Then, just add first messages to the view */

    //$.messages.setData(_buildMessages($._NATURE.OLD, $._config.messages));
    //delete($._config.messages); //Don't need them here anymore as they are stocked elsewhere
    // $.listView.scrollToItem(listView.getSectionCount() - 1, 0, {
    //     animated : false
    //     //position : Titanium.UI.iPhone.TableViewScrollPosition.TOP
    // });
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
    if ($.typingArea.value == "") return;
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
            var numberSections = $.listView.getSectionCount();
            var lastSection =  ($.listView.getSections())[numberSections - 1];
            $.listView.scrollToItem(numberSections - 1, (lastSection.getItems()).length - 1, {
                animated : true
                //position : Titanium.UI.iPhone.TableViewScrollPosition.TOP
            });
        },
        error: function () {
            $.sendBtn.touchEnabled = true;
        }
    };
    $.trigger('newMessage', newmessageEvent);
}

function setTemplate(model) {
    var transform = model.toJSON() ; // collection of messages
    transform.template = transform.emitter == Alloy.User.get('objectId')? "messageOnTheRight" : "messageOnTheLeft";
    transform.created_at = model.get('created_at').toLocaleString(Titanium.Locale.currentLocale, $._dateOptions);
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

var listener = function () {
    $.chatTextFieldContainer.removeEventListener('postlayout',listener);
    $.listView.setBottom($.chatTextFieldContainer.rect.height);
};

$.chatTextFieldContainer.addEventListener('postlayout', listener);

/* Exports the API */
exports.init = init;

exports.destroy = function () {
    $.messages.off('fetch destroy change add remove reset', renderMessages);
    $._config.messages.off('fetch destroy change add remove reset', renderMessages);
};
