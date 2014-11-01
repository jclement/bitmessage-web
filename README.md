# GarageberryPi

A RaspberryPi based project to control a garage door and notify one or more phones (via [Pushover](http://pushover.net)) if the door is left open for any length of time.

It was written for several reasons:

* Avoid those trips back to the house when we're 5 minutes away and can't remember if the door was closed
* Avoid those times when I come home from work and the door is open and nobody can remember how long its been like that
* We only have one working garage door opener which is always in the other car

It has a very simple UI written in Angular + Bootstrap (yes, my garage is a disaster).

<img src="http://d.pr/i/xBH3+" style="border: 1px solid #000">

## Requirements

* RaspberryPi running Raspbian or Arch or something
* NodeJS (0.10+)
* [Wifi Dongle (RTL8188CUS/RTL8192CU)](http://www.ebay.com/itm/230973235744) 
* [gpio-admin](http://quick2wire.com/safe-controlled-access-to-gpio-on-the-raspberry-pi/) - export IO pins so that non-root users can access them.  Also attaches PIN 4 to internal pull-down resistor.
* webcam (I use Microsoft LifeCam of some variety)

## Wiring

GarageberriPi makes use of one input (PIN 4 PULLDOWN) and one output pin (25).

<img src="http://d.pr/i/d6Jt+">

<img src="http://d.pr/i/6pxp+">

The `start` script automatically uses `gpio-admin` to export the two pins so that the `pi` user can access them (also attaches internal pull-down to PIN 4).

The door switch is a sketchy contact switch made out of coat hanger and pipe strapping like so:

<img src="http://d.pr/i/8m51+">
<img src="http://d.pr/i/90AL+">

## Installation & Startup

After you have a RPi with NodeJS installed...

```sh 
$ git clone git@github.com:jclement/garageberrypi.git
$ cd garageberrypi
$ npm install
$ bower install
```

### Webcam

I use the `webcam` package (Raspbian) and my `.webcamrc` looks like this.  I write to `/run/shm/webcam.jpeg` (memory) so that I'm not clobbering the SD card non-stop with thousands of writes.

```
[grab]
device = /dev/video0
text = "GarageBerryPi %Y-%m-%d %H:%M:%S"
infofile = filename
fg_red = 255
fg_green = 255
fg_blue = 255
width = 640
height = 480
delay = 1
wait = 0
input = Camera 1
#norm = pal
rotate = 0
top = 0
left = 0
bottom = -1
right = -1
quality = 75
trigger = 0
once = 0

[ftp]
host = localhost
user = webcamftp
pass = xxx
dir  = /run/shm
file = webcam.jpeg
tmp  = uploading.jpeg
passive = 0
debug = 0
auto = 0
local = 1
ssh = 0
```

### Configuration

Copy the `config.sample.json` to `config.json`.

```sh 
$ cp config.sample.json config.json
```

Update the settings in `config.json` to match your environment.  Of particular interest:

* `jwtSecret`: This is used to encrypt the authentication tokens (stored client-side local storage).  It must be a secure random string!  If it's left as null, a random string will automatically be generated on startup.
* `users`: Contains a list of users authorized to connect.  I started off with some fancy bcrypt implementation but it turns out that is rather expensive for my poor little RPi.
* `garage:move_time`: I don't have a sensor to actually detect when the door is moving so this is an approximate travel time for the door.
* `notify:pushover`: Contains a list of user/token pairs, and intervals (min), for notifying users via. pushover.
* `notify:twilio`: Allows notification via SMS using [Twilio](http://twilio.com).

```json
{
    "PORT": 3000,
    "url": "https:///garageberrypi/",

    "jwtSecret": null,

    "webcam": {
        "url": "/var/run/shm/webcam.jpeg"
    },

    "users": [
        {"name": "demo", "password": "demo"}
    ],

    "gpio": {
        "toggle_pin": 25,
        "status_pin": 4
    },

    "garage": {
        "move_time": 12
    },

    "notify": {
      "pushover": { 
        "devices": [
          {"user":"...", "token": "..."}
        ],
        "trigger_low": [2,5],
        "trigger_high": [10,20]
      },
      "twilio": {
        "enable": false,
        "sid": "...",
        "token": "...",
        "from": "+1555...",
        "numbers": [],
        "trigger": [30,60,120]
      }
    }
}

```

### Startup

You can start the service manually:

```sh 
$ ./start
```

Or you can do something like the following in /etc/rc.local:

```sh
sudo -u pi tmux new-session -d -s service
sudo -u pi tmux new-window -t service -n webcam webcam
sudo -u pi tmux new-window -t service -n garage "cd /home/pi/garageberrypi && ./start"
```




