// TODO: Don't show lateness as its own thing; add it to current time instead
/* esversion: 6 */
const skanetrafiken = require('node-skanetrafiken');

/* 
* Returns the current time if no parameter is provided.
* Else, parses the date parameter and returns the time.
* Returns time as a string: 'hh:mm'.
*/
const getTime = (date) => {
  let now;
  if (date == null) {
    now = new Date();
  } else {
    now = new Date(date);
  }
  let hour = String(now.getHours());
  if (parseInt(hour) < 10) {
    hour = "0" + hour;
  }
  let min = String(now.getMinutes());
  if (parseInt(min) < 10) {
    min = "0" + min;
  }
  return `${hour}:${min}`
}

/* 
 * Flattens entries of the dictionary if they are an array with length 1.
 */
const flattenDict = (dict) => {
        for (let key in dict) {
            if (dict.hasOwnProperty(key)) {
                if (dict[key].constructor === Array && dict[key].length === 1) {
                    dict[key] = dict[key][0]
                }
            }
        }
    return dict
}

/*
 * Returns a promise of the best stop candidate for @stopName.
 */
const getStop = (stopName) => {
    return new Promise(
        (resolve, reject) => {
            skanetrafiken.findStop({
              name: stopName
            }, (results, err) => {
                if (!err)
                    resolve(flattenDict(results[0]))
                else
                    reject(err)
              })}
    )
}

/*
 * Returns a promise of upcoming departures from @stopId.
 */
const getDepartures = (stopId) => {
   return new Promise(
       (resolve,reject) => {
          skanetrafiken.getDepartures({
            stopID: stopId,
            arrivals: false
          },
            (results, err) => {
              if (!err)
                  resolve(results)
              else
                  reject(err)
            }
          )
      }
   );
}

// TODO: add time and date params
/*
 * Returns a promise of upcoming journeys from @fromStop to @toStop.
 */
const getJourneys = (fromStop, toStop) => {
   return new Promise(
       (resolve,reject) => {
          skanetrafiken.getJourneys({
            from: {
				'id': fromStop.Id,
				'name': fromStop.Name,
				'type': 0
			},
            to: {
				'id': toStop.Id,
				'name': toStop.Name,
				'type': 0
			},
			action: "search",
          },
            (results, err) => {
              if (!err)
                  resolve(results.map(result => flattenDict(results))[0])
              else
                  reject(err)
            }
          )
      }
   );
}

exports.showDepartures = async (stopName, lineNo) =>  {
    const stop = await getStop(stopName)
    const stopId = stop.Id
    let departures = await getDepartures(stopId)
    if (lineNo) {
        console.log(`Departures of line ${lineNo} from ${stop.Name}`)
        departures = departures.filter(dep => flattenDict(dep).Name.toLowerCase() == lineNo.toLowerCase())
    } else {
        console.log(`Departures from ${stop.Name}`)
    }

    departures.forEach((dep) => {
        dep = flattenDict(dep)
        const directionStr = `${dep.Name} → ${dep.Towards}`
        let timeStr = getTime(dep.JourneyDateTime)
        let positionStr;
        let timeDevStr;

        if (dep.RealTime !== "") {
            const depPoint = String(dep.RealTime.RealTimeInfo[0].NewDepPoint).trim()
            const timeDev = parseInt(dep.RealTime.RealTimeInfo[0].DepTimeDeviation)
            const canceled = dep.RealTime.RealTimeInfo[0].Canceled

            if (canceled && Boolean(...canceled)) {
                timeDevStr = "INSTÄLLD"
            } else {
                if (parseInt(timeDev) !== 0) {
                    const newTime = new Date(
                        new Date(dep.JourneyDateTime)
                            .getTime() + timeDev*60*1000
                    )
                    timeStr = getTime(newTime)
                }
                positionStr = `${isNaN(depPoint) ? 'Läge' : 'Spår'} ${depPoint}`
            }


        } else {
        positionStr = `${isNaN(dep.stopPoint) ? 'Läge' : 'Spår'} ${dep.StopPoint}`
        }
        console.log(`${timeStr}: ${directionStr} ${positionStr ? '(' + positionStr + ')': ''}`)
    })
}

// TODO: Add deviations etc
exports.showJourneys = async (fromStopArg, toStopArg) =>  {
    const fromStop = await getStop(fromStopArg)
    const fromStopId = fromStop.Id
    const toStop = await getStop(toStopArg)
    const toStopId = toStop.Id
    let journeys = await getJourneys(fromStop, toStop)

	console.log(`Journeys from ${fromStop.Name} to ${toStop.Name}`)

	journeys.forEach((journey) => {
		console.log(getTime(journey.DepDateTime) + '→ ' + getTime(journey.ArrDateTime))
        let transfers = journey.RouteLinks[0].RouteLink
        transfers.forEach( (transfer) => {
            transfer = flattenDict(transfer)
            transferPrint = 
                '\t' +
                getTime(transfer.DepDateTime) +
                ' - ' +
                getTime(transfer.ArrDateTime) +
                ':\t' +
                transfer.From.Name +
                ' → ' +
                transfer.To.Name +
                ' (' + transfer.Line.Name + ')'
			console.log(transferPrint)
        })
	})
}

