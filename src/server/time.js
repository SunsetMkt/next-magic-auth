import { Duration } from 'luxon';

export function expiresMinutesDuration(expireMinutes) {
  const expireDuration = Duration.fromObject({ minutes: expireMinutes });
  const minutes = parseInt(expireDuration.toFormat('m'), 10);
  const hours = parseInt(expireDuration.toFormat('h'), 10);
  const days = parseInt(expireDuration.toFormat('d'), 10);

  let expiresIn;

  if (days >= 1) {
    expiresIn = `${days} ${days > 1 ? 'days' : 'day'}`;
  } else if (hours >= 1) {
    expiresIn = `${hours} ${hours > 1 ? 'hours' : 'hour'}`;
  } else {
    expiresIn = `${minutes} ${minutes > 1 ? 'minutes' : 'minute'}`;
  }

  return expiresIn;
}