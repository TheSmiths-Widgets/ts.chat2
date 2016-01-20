# Chat widget - version 2
*Inspired from [ts.chat](https://github.com/TheSmiths-Widgets/ts.chat).*

This is a small chat view (list of messages and text area to send new ones). The widget is being given a collection. Its only job is to display the collection. The collection order is preserved so you have to sort it manually, on your side, if you intend so. When the user writes and sends a message from the text field, an event is fired ('*newmessage*'). Another kind of event is fired when the user scrolls to the top ('*moremessages*').

![Demo](https://raw.githubusercontent.com/TheSmiths-Widgets/ts.chat2/master/demo.gif)

*You have a full demo example project in the sample branch*

##Manifest
* Version: 0.2.0
* License: Beerware
* Author: rpellerin
* Supported Platforms: Android, iOS

## Adding to Your Alloy Project

*  Create the `widgets` directory in your `app` directory if it doesn't already exist.
*  Copy the ts.chat2 folder into your `app/widgets` directory.
* Add it to your `app/config.json`
```json
"dependencies": {
    "ts.chat2": "0.2.0"
}
```

Opposed to version 1 of ts.chat, we need no more dependencies :)

## Basic model info
It uses Alloy models and collections ([http://docs.appcelerator.com/titanium/3.0/#!/guide/Alloy_Collection_and_Model_Objects](http://docs.appcelerator.com/titanium/3.0/#!/guide/Alloy_Collection_and_Model_Objects)) which are based on [Backbone.js collections](http://backbonejs.org/).

The model must have, at least, those 3 properties:

- **content**: the actual message
- **emitter**: either a string or an object, it's the sender
- **created_at**: the date of the message

Example:

```javascript
var msg = Alloy.createModel('Message', {
    content: "Hello world",
    emitter: Alloy.User.get('id'), // Alloy.User is an object we created in alloy.js, for example
    created_at: new Date(2015, 12, 31, 0, 0, 0)
});
```

## Create the chat in the View
You will want to use the chat in the whole window so you can do this in your view: 

```xml
<Alloy>
	<Window id="chatWin" title="My Chat">
		<Widget id="chat" src="ts.chat2" />
	</Window>
</Alloy>
```

Assign it an ID that you can use in your controller. E.g. `id="chat"` You can now access the Calendar via `$.chat` in your controller.

## Create the Model in the project
Following the example from the *sample* branch, you need to define your Model in the *app/models* folder (create the folder if it doesn't exists). You can have more than the basic fields, but at least the 3 properties described in "Basic model info" must be defined.

## Define the Collection in the project
Go to *app/alloy.js* file and define the Collection you will attach to the chat there (see *sample* brach)

```
Alloy.Collections.discussion = Alloy.createCollection('Message');
```

## Initialize the chat
You are ready to use the data. You can read the current messages and add to the Collection from any source you want or start empty.

Anyway, once your Collection is ready, you must initialize the chat:

```javascript
var validateSender = function(model) {
    return model.get('emitter').get('id') == '<Current user ID>';
}

$.chat.init({
    messages: Alloy.Collections.discussion,
    validateSender: validateSender
});
```

This will show all your messages and the chat is ready for interaction. The two properties are required (`messages` and `validateSender`).

**validateSender** is a function in where you say to the chat who is the user that "emits" the messages (the other will be the receiver). Basically, return `true` if `model` is the emitter, otherwise `false`.

### Other options

You can customize the widget a lot more:

```javascript
$.chat.init({
    messages: Alloy.Collections.messages, // required
    validateSender: validateSender, // required
    delay: 700,
    backgroundColor: Alloy.CFG.COLORS.WHITE_DARK,
    backgroundColorLeft: Alloy.CFG.COLORS.WHITE,
    backgroundColorRight: Alloy.CFG.COLORS.BLUE,
    colorLeft: Alloy.CFG.COLORS.BLUE,
    colorRight: Alloy.CFG.COLORS.WHITE,
    backgroundColorBottomBar: Alloy.CFG.COLORS.BLUE,
    sendButton: {
        title: 'Send',
        color: "white",
        borderRadius: 5,
        backgroundColor:         Alloy.CFG.COLORS.BLUE,
        backgroundFocusedColor:  Alloy.CFG.COLORS.BLUE_DARK,
        backgroundSelectedColor: Alloy.CFG.COLORS.BLUE_DARK
    },
    typingArea: {
        color: Alloy.CFG.COLORS.BLUE,
        backgroundColor: Alloy.CFG.COLORS.WHITE
    }
});
```

Here, the given values are just examples. Please check out the sources for more information about each property.

## Send a new message
As easy as:

```javascript
$.chat.on('newMessage', function (newMessageEvent) {
    var message = Alloy.createModel('Message', {
         content: newMessageEvent.message,
         emitter: '<Current user ID>',
         created_at: newMessageEvent.created_at
     });
    Alloy.Collections.discussion.add(message);
    newMessageEvent.success(); // Mandatory, to acknowledge sending the message successfully
});
```

## Adding messages from "server"
```javascript
$.chat.on('moremessages', function () {
    // Fetch a remote server and add data into Alloy.Collections.discussion
});
```

## Closing the chat
If you will reuse the Collection for other chats, remember to reset it when closing the view. Also free resources:

```javascript
function close() {
	Alloy.Collections.discussion.reset();
	$.chatWin.destroy();
    $.destroy();
}
```

## How to include in your XML:

Feel free to enclose the chat in a view and style it a little bit in your tss file:

```xml
<Alloy>
    <View class="container">
        <View id="chatWrapper">
            <Widget id="chat" src="ts.chat2"></Widget>
        </View>
    </View>
</Alloy>
```

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

## Initialization Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| messages | *Collection* | Initial set of messages. |
| validateSender | *function* | Function that takes one argument, a model. Must returns TRUE if the message is from you and then has to be displayed on the right side, otherwise it returns FALSE. |

For the other available parameters, see above or directly the sources.

## Accessible Methods
| Name | Parameters | Description | Example |
| ---- | ---------- | ----------- | ------- |
| init | Object (see the sources) | Initialize the widget | `$.chat.init(obj)` |
| destroy | - | Remove all internal listeners. Free the resources. | `$.chat.destroy()` |
| disable | - | Disable the inputs (text field and button) | `$.chat.disable()` |
| enable | - | Enable the inputs (text field and button) | `$.chat.enable()` |
| hideInput | - | Hide the bottom bar (text field and button) | `$.chat.hideInput()` |
| showInput | - | Show the bottom bar (text field and button) | `$.chat.showInput()` |

In addition, you can listen to two triggers to do some actions.

| Trigger | Description | Example |
| ------- | ----------- | ------- |
| newMessage | Allows you to send a new message. Triggered when user press "send" button. | `$.chat.on("newMessage", function (newMessageEvent) {...});` |
| moremessages | Allows you to add a bunch of messages to the Collection. Triggered when user scrolls to top of the calendar | `$.chat.on("moremessages", function () {...});` |

## TODO

- Generate the documentation into ```gh-pages```

[![wearesmiths](http://wearesmiths.com/media/logoGitHub.png)](http://wearesmiths.com)
