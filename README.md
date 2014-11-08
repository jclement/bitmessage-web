# bitmessage-web

I love the idea of Bitmessage.  Unfortunately, it requires a fairly heavy-weight client and isn't accessible from my phone.  There exist a couple of web based Bitmessage tools but they require trusting a 3rd party which defeats the purpose...

''bitmessage-web'' is a responsive web client that sits on top of the APIs for the normal bitmessage client and gives access to much of the normal bitmessage functionality.

It runs entirely on hardware you control and can be access with any number of devices (phones, tablets, etc).

Currently, no support for subscriptions.

## Requirements
* NodeJS
* Bower
* NPM
* Bitmessage Client with APIs enabled

## Screenshots

Here is the index page.  Nothing too fancy but...

![Index Page](http://d.pr/i/1jSx9+)

Viewing a message

![Viewing a message](http://d.pr/i/1831q+)

Composing messages is nice.  There is a nice search box for both recipient / from address.

![Composing](http://d.pr/i/Jb5J+)

And a video of usage:

[Video of Usage](http://d.pr/v/1ihSO)


## Installation

Pull package source from Github:

```
$ git clone https://github.com/jclement/bitmessage-web.git
```

Install dependencies:

```
$ cd bitmessage-web
# npm install
# bower install
```

Copy sample configuration (and then edit it to provide API user/password + login credentials for bitmessage-web itself):
```
$ cp config.sample.json config.json
```

Start the server:
```
$ node server/app.js
```

## Quick Notes:

* bitmessage-web should be run on the same machine as bitmessage or through an SSH tunnel!
* If accessing bitmessage-web remotely (from phone for example) you really should run through SSL or you defeat the whole point.  Install NGINX / Apache on the same machine and proxy requests through to bitmessage-web.

## Future updates:

```
$ cd bitmessage-web
$ git pull
$ bower update
$ npm update
```