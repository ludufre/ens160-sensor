const { default: ENS160 } = require('../ENS160.js');

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
