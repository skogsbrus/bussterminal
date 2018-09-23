/* eslint no-console: ["error", { allow: ["log"] }] */
const skanetrafiken = require('node-skanetrafiken');

/*
* Returns the current time if no parameter is provided.
* Else, parses the date parameter and returns the time.
* Returns time as a string: 'hh:mm'.
*/
const getTime = (date) => {
  let now;
  if (date === null) {
    now = new Date();
  } else {
    now = new Date(date);
  }
  let hour = String(now.getHours());
  if (parseInt(hour, 10) < 10) {
    hour = `0${hour}`;
  }
  let min = String(now.getMinutes());
  if (parseInt(min, 10) < 10) {
    min = `0${min}`;
  }
  return `${hour}:${min}`;
};

/*
 * @time: original time string
 * @devTime: deviation of @time in minutes
 * */
const calcNewTime = (time, devTime) => {
  let devTimeMs;
  if (devTime) {
    devTimeMs = parseInt(devTime, 10) * 60 * 1000;
  } else {
    devTimeMs = 0;
  }
  return new Date(new Date(time).getTime() + devTimeMs);
};

/*
 * Flattens entries of the dictionary if they are an array with length 1.
 */
const flattenDict = (dict) => {
  const newDict = dict;
  Object.keys(dict).forEach((key) => {
    if (dict[key].constructor === Array && dict[key].length === 1) {
      [newDict[key]] = dict[key];
    }
  });
  return newDict;
};

/*
 * Returns a promise of the best stop candidate for @stopName.
 */
const getStop = stopName => new Promise(
  (resolve, reject) => {
    skanetrafiken.findStop(
      { name: stopName },
      (results, err) => {
        if (!err) {
          resolve(flattenDict(results[0]));
        } else {
          reject(err);
        }
      },
    );
  },
);

/*
 * Returns a promise of upcoming departures from @stopId.
 */
const getDepartures = stopId => new Promise(
  (resolve, reject) => {
    skanetrafiken.getDepartures({
      stopID: stopId,
      arrivals: false,
    },
    (results, err) => {
      if (!err) {
        resolve(results);
      } else {
        reject(err);
      }
    });
  },
);

// TODO: add time and date params
/*
 * Returns a promise of upcoming journeys from @fromStop to @toStop.
 */
const getJourneys = (fromStop, toStop) => new Promise(
  (resolve, reject) => {
    skanetrafiken.getJourneys({
      from: {
        id: fromStop.Id,
        name: fromStop.Name,
        type: 0,
      },
      to: {
        id: toStop.Id,
        name: toStop.Name,
        type: 0,
      },
      action: 'search',
    },
    (results, err) => {
      if (!err) resolve(results);
      else reject(err);
    });
  },
);

exports.showDepartures = async (stopName, lineNo) => {
  const stop = await getStop(stopName);
  const stopId = stop.Id;
  let departures = await getDepartures(stopId);
  if (lineNo) {
    console.log(`Departures of line ${lineNo} from ${stop.Name}`);
    departures = departures.filter(
      dep => flattenDict(dep).Name.toLowerCase() === lineNo.toLowerCase(),
    );
  } else {
    console.log(`Departures from ${stop.Name}`);
  }

  departures.forEach((x) => {
    const dep = flattenDict(x);
    const directionStr = `${dep.Name} → ${dep.Towards}`;
    let timeStr = getTime(dep.JourneyDateTime);
    let positionStr = `${Number.isNaN(dep.stopPoint) ? 'Läge' : 'Spår'} ${dep.StopPoint}`;

    if (dep.RealTime !== '') {
      const deviations = flattenDict(dep.RealTime.RealTimeInfo[0]);
      const depPoint = String(deviations.NewDepPoint).trim();
      const canceled = deviations.Canceled;

      if (canceled && Boolean(...canceled)) {
        timeStr = 'INSTÄLLD';
      } else {
        const depTime = calcNewTime(dep.JourneyDateTime, deviations.DepTimeDeviation);
        timeStr = getTime(depTime);
      }
      positionStr = `${Number.isNaN(depPoint) ? 'Läge' : 'Spår'} ${depPoint}`;
    }
    console.log(`${timeStr}: ${directionStr} ${positionStr ? `(${positionStr})` : ''}`);
  });
};


// TODO: Add deviations etc
exports.showJourneys = async (fromStopArg, toStopArg) => {
  const fromStop = await getStop(fromStopArg);
  const toStop = await getStop(toStopArg);
  const journeys = await getJourneys(fromStop, toStop);

  console.log(`Journeys from ${fromStop.Name} to ${toStop.Name}`);

  journeys.forEach((journey) => {
    console.log(`${getTime(journey.DepDateTime)} → ${getTime(journey.ArrDateTime)}`);
    const transfers = journey.RouteLinks[0].RouteLink;
    transfers.forEach((t) => {
      const transfer = flattenDict(t);
      let deviations;
      let depTime;
      let arrTime;
      let transferPrint = '';
      if (transfer.RealTime.RealTimeInfo) {
        deviations = flattenDict(transfer.RealTime.RealTimeInfo[0]);
        if (deviations.Canceled && Boolean(...deviations.Canceled)) {
          transferPrint = '\tINSTÄLLD';
        }
        depTime = calcNewTime(transfer.DepDateTime, deviations.DepTimeDeviation);
        arrTime = calcNewTime(transfer.ArrDateTime, deviations.ArrTimeDeviation);
      } else {
        depTime = transfer.DepDateTime;
        arrTime = transfer.ArrDateTime;
      }

      transferPrint
                += `\t${
          getTime(depTime)
        } - ${
          getTime(arrTime)
        }:\t${
          transfer.From.Name
        } → ${
          transfer.To.Name
        } (${transfer.Line.Name})`;
      console.log(transferPrint);
    });
  });
};
