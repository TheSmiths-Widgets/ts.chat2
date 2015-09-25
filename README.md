# Chat widget - version 2

*Inspired from [ts.chat](https://github.com/TheSmiths-Widgets/ts.chat).*

A small chat view (list of messages and text area to send new ones). The widget is being given a collection. Its only job is to display the collection. The collection order is preserved so you have to sort it manually, on your side, if you intend so. When the user writes and sends a message from the text field, an event is fired ('*newmessage*'). Another kind of event is fired when the user scrolls to the top ('*moremessages*').

![Demo](https://raw.githubusercontent.com/rpellerin/ts.chat2/develop/demo.gif)

## How to install

Clone this repo into your ```app/widget``` folder.

## Dependencies

None :)

## How to use it

It uses Alloy models and collections ([http://docs.appcelerator.com/titanium/3.0/#!/guide/Alloy_Collection_and_Model_Objects](http://docs.appcelerator.com/titanium/3.0/#!/guide/Alloy_Collection_and_Model_Objects)) which are based on [Backbone.js collections](http://backbonejs.org/).

The model must have, at least, those 3 properties:

- **content**: the actual message
- **emitter**: either a string or an object, it's the sender
- **created_at**: the date of the message

Example:

```javascript
var msg = Alloy.createModel('Message', {
    content: "Hello world",
    emitter: Alloy.User.objectId, // Alloy.User is an object we created in alloy.js, for example
    created_at: new Date(2015, 12, 31, 0, 0, 0)
});
```
## Real world example

In your view:

```xml
<Alloy>
    <View class="container">
        ...
        <View id="chatWrapper">
            <Widget id="chat" src="ts.chat2"></Widget>
        </View>
        ...
    </View>
</Alloy>
```

In your controller (for example):

```javascript
var validateSender = function(model) {
    return model.get('emitter') == Alloy.User.get('objectId');
}

$.chat.on('newMessage', function (newMessageEvent) {
    var message = Alloy.createModel('Message', {
         content: newMessageEvent.message,
         emitter: Alloy.User.get('objectId'),
         created_at: newMessageEvent.created_at
     });
    Alloy.Collections.discussion.add(message);
    newMessageEvent.success(); // Mandatory, to acknowledge sending the message successfully
});

$.chat.on('moremessages', function () {
    // Fetch a remote server and add data into Alloy.Collections.discussion
});

$.chat.init({
    messages: Alloy.Collections.discussion,
    validateSender: validateSender
});
```

Bonus, in your tss file:

```css
".container" : {
    width: Ti.UI.FILL,
    height: Ti.UI.FILL
}

"#chatWrapper" : {
    height: Ti.UI.FILL,
    width: Ti.UI.FILL
}
```

## TODO (from the most important to the least)

- Add some customization
    - Allow to add more buttons at the bottom (like in the Hangout app from Google)
        - Each button would raise its own event when pressed
    - Allow to change the send button (image or text)
    - Enable i18n
- Generate the documentation into ```gh-pages```

[![wearesmiths](http://wearesmiths.com/media/logoGitHub.png)](http://wearesmiths.com)