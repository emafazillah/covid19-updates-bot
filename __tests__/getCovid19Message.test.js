import { expect, test } from '@jest/globals';
import getCovid19Message from '../getCovid19Message';

test('test message', () => {
  const message = getCovid19Message('Malaysia',
  '.csv',
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/');
  expect(message).not.toBeNull();
});