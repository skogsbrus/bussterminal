# bussterminal

An terminal application that lets you access live info from Skånetrafiken, avoiding the hassle of visiting [their web page](https://www.skanetrafiken.se/).

#### buss|terminal
- substantiv: ~en ~er
    - buss: ett större passagerarfordon
    - terminal: avgångs- och ankomsthall; utrustning för in- och ut­matning av data

## Setup

```
git clone git@github.com:johan-andersson01/bussterminal.git
cd bussterminal
npm install -g
```

## Usage

```
Usage: bussterminal [options]

Terminal app to check departing buses/trains in Skåne

Options:

  -V, --version      output the version number
  -f, --from <FROM>  required: shows departures from FROM unless -t flag is supplied
  -t, --to   <TO>    used with -f: Shows journeys from FROM to TO
  -l, --line <LINE>  used with -f: Filters output to only include departures matching LINE
  -h, --help         output usage information

  Examples:
    $ bussterminal --help                   # show help
    $ bussterminal --version                # show version
    $ bussterminal -f "lund c" -t triangeln # show journeys from Lund C to Malmö Triangeln
    $ bussterminal -f lth                   # show departures from Lund LTH
    $ bussterminal -f lth -l 20             # show line 20's departures from Lund LTH

```

<img src='usage.gif' alt='Usage demonstration'>

