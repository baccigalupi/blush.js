# Blush.js

Blush.js is a front-end JavaScript framework that is

* simple rendering
* object-oriented
* mobile friendly
* and backed by the latest immutable data concepts

#### Simple rendering

Most of the current frameworks require you to learn a new templating
language. HTML takes some other clever form, and each has their own
opinions about what will make HTML a better rendering abstraction. In
the end you need to be an expert in HTML and the templating language,
doubling your abstraction overhead.

Blush.js uses [Mustache.js](https://github.com/janl/mustache.js/), a
tried and true standard for keeping HTML as just HTML. It aims to be
logicless, but actually has just just enough logic to make your HTML
programmable.

Blush yanks presentation logic into [view models](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel), one per template and view.

#### Object-oriented

All of Blush.js is built on classes. Functional programming is great,
and there are more performance-minded ways to pack logic into bytes for
transport over the wire. But objects allow easy overriding of behavior.

Want to swap out the typical Blush.js method for locating a template with your
own custom rolled way? It is as simple as overwriting that method in
your view class. Want it to work different for every one of your views?
Subclass your own baseclass and inherit from there.

Inheritance is great for user interface development. But where possible
delegation is used. Especially it is used over module inclusion for shared
behaviors. For example, there is a separate small and simple class for
configuration and for finding the right dom element to render views
into.

#### Mobile friendly

Blush.js depends on the sister Mustache library
[Mario.js](https://github.com/baccigalupi/mario.js), but otherwise
favors pure javascript and a sippingly small download size.

#### Immutability yours

Blush.js influenced by Redux and similar libraries, but pull together
the event systems from the dom, server and data into a unified bus. And
if that is too abstract for you, it works to make the flow of events and
data intuitive.

### Work in progress/next steps

Blush.js is in its infancy, guided by a desire to be very productive.
Here is the fuzzy plan:

Mario.js
* better performance again
* client and server versions?

Next:
* url/router/history thing
* view event propogation
* fetch polyfill

