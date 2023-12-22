/*
  ENS160.js
  A Node.js I2C module for the Adafruit ENS160 MOX Gas Sensor.
*/

"user strict";

import i2c from "i2c-bus";

const ENS160_I2CADDR: number = 0x53;
const ENS160_PARTID: number = 0x0160;
const ENS160_CMD_PARTID: number = 0x00;
const ENS160_CMD_OPMODE: number = 0x10;
const ENS160_CMD_COMMAND: number = 0x12;
const ENS160_CMD_TEMPIN: number = 0x13;
const ENS160_CMD_RHIN: number = 0x15;
const ENS160_CMD_STATUS: number = 0x20;
const ENS160_CMD_AQI: number = 0x21;
const ENS160_CMD_TVOC: number = 0x22;
const ENS160_CMD_ECO2: number = 0x24;
const ENS160_CMD_T: number = 0x30;
const ENS160_CMD_RH: number = 0x32;
const ENS160_CMD_READGPR: number = 0x48;

const MODE_SLEEP: number = 0x00;
const MODE_IDLE: number = 0x01;
const MODE_STANDARD: number = 0x02;
const MODE_RESET: number = 0xf0;
const VALID_MODES: number[] = [
  MODE_SLEEP,
  MODE_IDLE,
  MODE_STANDARD,
  MODE_RESET,
];

const COMMAND_NOP: number = 0x00;
const COMMAND_CLRGPR: number = 0xcc;
const COMMAND_GETAPPVER: number = 0x0e;

/**
 * ENS160 sensor class with data read and write functions.
 */
export default class ENS160 {
  /**
   * Bus instance.
   */
  private readonly bus: i2c.PromisifiedBus;

  /**
   * Constructor
   * @param bus bus instance
   */
  constructor(bus: i2c.PromisifiedBus) {
    this.bus = bus;
  }

  /**
   * Opens i2c bus and connect to the ENS160 sensor.
   * @param busNumber Target bus number to open. Default is 1.
   * @returns ENS160 instance with opened bus instance. You can read information with this instance.
   * @throws An error that occurred while opening i2c bus.
   */
  public static async open(busNumber: number = 1): Promise<ENS160> {
    try {
      const bus: i2c.PromisifiedBus = await i2c.openPromisified(busNumber);
      const sensor: ENS160 = new ENS160(bus);
      await sensor.init();
      return sensor;
    } catch (err: any) {
      throw err;
    }
  }

  /**
   * Initializes ENS160 sensor.
   * @returns `true` if successfully initialized the sensor.
   * @throws An error that occurred while initializing the sensor.
   */
  private async init(): Promise<boolean> {
    try {
      await sleep(20);
      await this.reset();

      if (!(await this.check())) {
        throw "Could not detect!";
      }

      await this.setMode(MODE_IDLE);

      await this.clear_command();

      await this.setMode(MODE_STANDARD);

      await this.temperature_compensation(25);
      await this.humidity_compensation(50);

      return true;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Resets ENS160 sensor.
   * @returns `true` if successfully reset the sensor.
   * @throws An error that occurred while resetting the sensor.
   */
  public async reset(): Promise<boolean> {
    try {
      await this.setMode(MODE_RESET);
      return true;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Change operation mode of ENS160 sensor.
   * @param mode Target operation mode.
   * @returns `true` if successfully change operation mode of the sensor.
   * @throws An error that occurred while changing mode of the sensor.
   */
  private async setMode(mode: number): Promise<boolean> {
    try {
      if (!VALID_MODES.includes(mode)) {
        throw new Error(`Invalid mode: ${mode}`);
      }

      const buf = Buffer.from([mode]);
      await this.bus.writeI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_OPMODE,
        buf.length,
        buf
      );
      await sleep(10);
      return true;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Read operation mode of ENS160 sensor.
   * @returns Operation mode of the sensor.
   * @throws An error that occurred while reading operation mode of the sensor.
   */
  private async getMode(): Promise<number> {
    try {
      const curr = await this.bus.readI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_OPMODE,
        1,
        Buffer.alloc(1)
      );

      return curr.buffer.readInt8();
    } catch (err) {
      throw err;
    }
  }

  /**
   * Check detection of ENS160 sensor.
   * @returns `true` if successfully detected the sensor.
   * @throws An error that occurred while detecting the sensor.
   */
  public async check(): Promise<boolean> {
    try {
      const bug = await this.bus.readI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_PARTID,
        2,
        Buffer.alloc(2)
      );
      if (bug.buffer.readIntLE(0, 2) !== ENS160_PARTID) {
        throw "Could not locate ENS160!";
      }

      return true;
    } catch (err: any) {
      throw err;
    }
  }

  /**
   * Clear command of ENS160 sensor.
   * @returns `true` if successfully cleared command of the sensor.
   * @throws An error that occurred while clearing command of the sensor.
   */
  async clear_command(): Promise<boolean> {
    try {
      await this.bus.writeI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_COMMAND,
        1,
        Buffer.from([COMMAND_NOP])
      );
      await this.bus.writeI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_COMMAND,
        1,
        Buffer.from([COMMAND_CLRGPR])
      );
      await sleep(10);
      return true;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Read general purpose registers of ENS160 sensor.
   * @returns `Buffer` of general purpose read registers of the sensor.
   * @throws An error that occurred while general purpose read registers of the sensor.
   */
  private async read_gpr(): Promise<Buffer> {
    try {
      const data = await this.bus.readI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_READGPR,
        8,
        Buffer.alloc(8)
      );
      return data.buffer;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Read firmware version of ENS160 sensor.
   * @returns `x.x.x` firmware version of the sensor.
   * @throws An error that occurred while reading firmware version of the sensor.
   */
  async firmware_version(): Promise<string> {
    try {
      const curr = await this.getMode();

      await this.setMode(MODE_IDLE);

      await this.clear_command();
      await sleep(10);

      await this.bus.writeI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_COMMAND,
        1,
        Buffer.from([COMMAND_GETAPPVER])
      );

      const ret = await this.read_gpr();

      await this.setMode(curr);

      return `${parseInt(ret[4].toString(10))}.${parseInt(
        ret[5].toString(10)
      )}.${parseInt(ret[6].toString(10))}`;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Define temperature compensation of ENS160 sensor.
   * @param temp_c Temperature in Celsius.
   * @returns `true` if successfully defined temperature compensation of the sensor.
   * @throws An error that occurred while defining temperature compensation of the sensor.
   */
  async temperature_compensation(temp_c: number): Promise<boolean> {
    try {
      const k64 = Math.ceil((temp_c + 273.15) * 64.0);
      const buf = Buffer.from(k64.toString(16), "hex");

      await this.bus.writeI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_TEMPIN,
        buf.length,
        buf
      );

      return true;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Read temperature used in its calculations of ENS160 sensor.
   * @returns `number` value of temperature used in its calculations in the sensor.
   * @throws An error that occurred while reading temperature used in its calculations of the sensor.
   */
  async get_temperature_compensation(): Promise<number> {
    try {
      const measurement = await this.bus.readI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_T,
        2,
        Buffer.alloc(2)
      );

      const be = Buffer.from(measurement.buffer, 16).readUInt16BE(0);

      return Number(((be / 64.0) - 273.15).toFixed(1));
    } catch (err) {
      throw err;
    }
  }

  /**
   * Define relative humidity compensation of ENS160 sensor.
   * @param temp_c Relative humidity in percentual (without %, 0-100).
   * @returns `true` if successfully defined relative humidity compensation of the sensor.
   * @throws An error that occurred while defining relative humidity compensation of the sensor.
   */
  async humidity_compensation(humidity: number): Promise<boolean> {
    try {
      const k64 = Math.ceil(humidity * 512);
      const buf = Buffer.from(k64.toString(16), "hex");

      await this.bus.writeI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_RHIN,
        buf.length,
        buf
      );

      return true;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Read relative humidity used in its calculations of ENS160 sensor.
   * @returns `number` value of relative humidity used in its calculations in the sensor.
   * @throws An error that occurred while reading relative humidity used in its calculations of the sensor.
   */
  async get_humidity_compensation(): Promise<number> {
    try {
      const measurement = await this.bus.readI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_RH,
        2,
        Buffer.alloc(2)
      );

      const be = Buffer.from(measurement.buffer, 16).readUInt16BE(0);

      return Number((be / 512).toFixed(1));
    } catch (err) {
      throw err;
    }
  }

  /**
   * Gets air quality index data from ENS160 sensor.
   * @returns air quality index gotten from the sensor (1-5).
   * @throws An error that occurred while getting air quality index data.
   */
  async AQI(): Promise<number> {
    try {
      const measurement = await this.bus.readI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_AQI,
        1,
        Buffer.alloc(1)
      );

      return measurement.buffer.readIntLE(0, measurement.bytesRead);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Gets eCO2 data from ENS160 sensor.
   * @returns eCO2 gotten from the sensor in parts per million (400-65000).
   * @throws An error that occurred while getting eCO2 data.
   */
  async ECO2(): Promise<number> {
    try {
      const measurement = await this.bus.readI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_ECO2,
        2,
        Buffer.alloc(2)
      );

      return measurement.buffer.readIntLE(0, measurement.bytesRead);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Gets TVOC data from ENS160 sensor.
   * @returns VCO2 gotten from the sensor in parts per billion (0-65000).
   * @throws An error that occurred while getting TVOC data.
   */
  async TVOC(): Promise<number> {
    try {
      const measurement = await this.bus.readI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_TVOC,
        2,
        Buffer.alloc(2)
      );

      return measurement.buffer.readIntLE(0, measurement.bytesRead);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Read status of ENS160 sensor.
   * @returns Status of the sensor.
   * @throws An error that occurred while reading status of the sensor.
   */
  async status(): Promise<{
    opmode: boolean;
    error: boolean;
    status: StatusType;
  }> {
    try {
      const measurement = await this.bus.readI2cBlock(
        ENS160_I2CADDR,
        ENS160_CMD_STATUS,
        1,
        Buffer.alloc(1)
      );

      const bin = measurement.buffer[0].toString(2).padStart(8, "0");

      const opmode = bin.substring(0, 1) === "1";
      const error = bin.substring(1, 2) === "1";
      let status: StatusType = "invalid";
      switch (parseInt(bin.substring(4, 5))) {
        case 0:
          status = "normal";
          break;
        case 1:
          status = "warmup";
          break;
        case 2:
          status = "startup";
          break;
        case 3:
          status = "invalid";
          break;
      }

      return {
        opmode,
        error,
        status,
      };
    } catch (err) {
      throw err;
    }
  }
}

type StatusType = "normal" | "warmup" | "startup" | "invalid";

const sleep = (duration: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
};
