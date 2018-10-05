# bussterminal

An application that lets you access live info from Skånetrafiken, without leaving the terminal.

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

## Annotated example

```
Journeys from Lund C to Lund LTH
19:24 → 19:31                                   # original schedule
	19:32 - 19:37:	Lund C → Lund LTH (6)   # bus is 8 minutes late
19:44 → 19:51                                   # original schedule
	19:49 - 19:56:	Lund C → Lund LTH (6)   # bus is 5 minutes late
20:04 → 20:11                                   # original schedule
	20:04 - 20:11:	Lund C → Lund LTH (6)   # bus is on time
20:24 → 20:31                                   # original schedule
	20:24 - 20:31:	Lund C → Lund LTH (6)   # bus is on time
20:44 → 20:51                                   # original schedule
	20:44 - 20:51:	Lund C → Lund LTH (6)   # bus is on time
```
