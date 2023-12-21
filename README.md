# ens160-sensor

A Node.js I2C module for the Adafruit ENS160 MOX Gas Sensor, inspired on [ath-sensor](https://github.com/thomome/aht20-sensor).

## Installation
```
npm install ens160-sensor
```

## Example
```js
const { default: ENS160 } = require('./ENS160');

ENS160.open()
  .then(async (sensor) => {
    await sensor.temperature_compensation(25); // 25C is the default
    await sensor.humidity_compensation(50); // 50% is the default

    while (true) {
      try {
        console.log(`AQI (1-5): ${await sensor.AQI()}`);
        console.log(`TVOC (ppb): ${await sensor.TVOC()}`);
        console.log(`eCO2 (ppm): ${await sensor.ECO2()}`);
        console.log(`Device Status: ${(await sensor.status()).status}`);
      } catch (err) {
        console.error("Failed to get sensor data.");
      }
      await sleep(1000);
    }
  })
  .catch((err) => {
    console.error("Failed to open bus.");
  });

const sleep = (duration) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
};
```

## Wiring
Wiring can be found here: https://cdn-learn.adafruit.com/downloads/pdf/adafruit-ens160-mox-gas-sensor.pdf