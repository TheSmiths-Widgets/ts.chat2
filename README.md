# Chat widget - version 2

*Inspired from [ts.chat](https://github.com/TheSmiths-Widgets/ts.chat).*

A small chat view (list of messages and text area to send new ones).

![Demo](https://raw.githubusercontent.com/rpellerin/ts.chat2/develop/demo.gif)

## How to install

Clone this repo into your ```app/widget``` folder.

## Dependencies

None :)

## How to use it

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
$.chat.on('newMessage', function (newMessageEvent) {
    var message = Alloy.createModel('Message', {
         content: newMessageEvent.message,
         emitter: Alloy.User.get('objectId'),
         created_at: newMessageEvent.created_at
     });
    Alloy.Collections.discussion.add(message);
    newMessageEvent.success(); // Mandatory, to acknowledge sending the message successfully
});

$.chat.init({
    messages: Alloy.Collections.discussion
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
- Create a sample app into ```sample```

[![wearesmiths](http://wearesmiths.com/media/logoGitHub.png)](http://wearesmiths.com)