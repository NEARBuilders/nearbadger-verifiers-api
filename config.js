import { addSeconds, isAfter } from 'date-fns';

export const ALLOW_LIST = [
    "https://near.org", 
    "https://near.social", 
    "https://nearbadger.vercel.app", 
    "https://potlock.org",
    "https://jutsu.ai",
    "http://localhost:3000"
];
export const MAX_REQUESTS = 50;
export const MAX_TIMESPAN = 3600;

let requests = {};

export const rateLimit = (req, res, next) => {
    let ip = req.ip;

    if (ip in requests) {
        if (requests[ip].count === MAX_REQUESTS && !isAfter(new Date(), requests[ip].expire)) {
            return res.status(429).send();
        } else if (requests[ip].count === MAX_REQUESTS) {
            requests[ip].count = 1;
            requests[ip].expire = addSeconds(new Date(), MAX_TIMESPAN);
        } else {
            ++requests[ip].count;            
        }
    } else {
        requests[ip] = {
            count: 1,
            expire: addSeconds(new Date(), MAX_TIMESPAN)
        };
    }

    return next();
}

export const cors = (req, next) => {
  let corsOptions = {
      origin: false
  };
  const origin = req.header('Origin');

  if (origin && ALLOW_LIST.includes(origin)) {
    corsOptions.origin = true;
  }
  
  next(null, corsOptions);
}