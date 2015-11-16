// Add some random messages to our Alloy collection
function addRandomEntry(i) {
    var msg = Alloy.createModel('Message', {
        content: Math.round(Math.random()) == 1 ? "auto generated n°"+i : "yo\nalso auto generated n°"+i,
        created_at: new Date(2014, Math.round(Math.random() * 11), Math.round(Math.random() * 20) + 1, Math.round(Math.random() * 10), 0, 0),
        emitter: (Math.round(Math.random()) == 1) ? "Ned Stark's id" : Alloy.User.objectId
    });
    Alloy.Collections.discussion.add(msg);
}

for (var i = 0; i < 20; i++) {
    addRandomEntry(i);
}

// Function used to determine wether the message should be on the right side of the screen, or not
var validateSender = function(model) {
    return model.get('emitter') == Alloy.User.objectId; // Alloy.User has been defined in alloy.js
}

$.chat.on('newmessage', function (newMessageEvent) {
    var message = Alloy.createModel('Message', {
         content: newMessageEvent.message,
         emitter: Alloy.User.objectId,
         created_at: newMessageEvent.created_at
     });
    Alloy.Collections.discussion.add(message);
    newMessageEvent.success();
});

$.chat.on('moremessages', function () {
    alert("We want more messages");
});

$.chat.init({
    messages: Alloy.Collections.discussion,
    validateSender: validateSender
});

$.index.open();
