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

In your controller:

```javascript
// Customize your chat before initialize it
$.chat.customize({
    sendBtn : {
        icon : 'fa-chrome', // FontAwesome Icon
        iconColor: 'green', // FontAwesome Color
        iconSize: 30, // FontAwesome Icon Size
        color: 'red', // BackgroundColor
        fadeIn: 'black' // BackgroundColor when touched
    }
});

// Initialize your chat
$.chat.init({
    messages: Alloy.Collections.discussion,
    validateSender: validateSender
})
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

- Test on iOS
- Add more functions from [ts.chat](https://github.com/TheSmiths-Widgets/ts.chat) (widget.js)
- Add some customization
    - Allow to add more buttons at the bottom (like in the Hangout app from Google)
        - Each button would raise its own event when pressed
    - Allow to change the send button (image or text)
    - Enable i18n
- Generate the documentation into ```gh-pages```
- Create a sample app into ```sample```

### Changelog
- `0.2.0` : Add [FontAwesome](http://fontawesome.io/) and customization to `sendBtn`.


[![wearesmiths](http://wearesmiths.com/media/logoGitHub.png)](http://wearesmiths.com)
