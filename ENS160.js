"use strict";
/*
  ENS160.js
  A Node.js I2C module for the Adafruit ENS160 MOX Gas Sensor.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i2c_bus_1 = __importDefault(require("i2c-bus"));
const ENS160_I2CADDR = 0x53;
const ENS160_PARTID = 0x0160;
const ENS160_CMD_PARTID = 0x00;
const ENS160_CMD_OPMODE = 0x10;
const ENS160_CMD_COMMAND = 0x12;
const ENS160_CMD_TEMPIN = 0x13;
const ENS160_CMD_RHIN = 0x15;
const ENS160_CMD_STATUS = 0x20;
const ENS160_CMD_AQI = 0x21;
const ENS160_CMD_TVOC = 0x22;
const ENS160_CMD_ECO2 = 0x24;
const ENS160_CMD_T = 0x30;
const ENS160_CMD_RH = 0x32;
const ENS160_CMD_READGPR = 0x48;
const MODE_SLEEP = 0x00;
const MODE_IDLE = 0x01;
const MODE_STANDARD = 0x02;
const MODE_RESET = 0xf0;
const VALID_MODES = [
    MODE_SLEEP,
    MODE_IDLE,
    MODE_STANDARD,
    MODE_RESET,
];
const COMMAND_NOP = 0x00;
const COMMAND_CLRGPR = 0xcc;
const COMMAND_GETAPPVER = 0x0e;
/**
 * ENS160 sensor class with data read and write functions.
 */
class ENS160 {
    /**
     * Constructor
     * @param bus bus instance
     */
    constructor(bus) {
        this.bus = bus;
    }
    /**
     * Opens i2c bus and connect to the ENS160 sensor.
     * @param busNumber Target bus number to open. Default is 1.
     * @returns ENS160 instance with opened bus instance. You can read information with this instance.
     * @throws An error that occurred while opening i2c bus.
     */
    static open(busNumber = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bus = yield i2c_bus_1.default.openPromisified(busNumber);
                const sensor = new ENS160(bus);
                yield sensor.init();
                return sensor;
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Initializes ENS160 sensor.
     * @returns `true` if successfully initialized the sensor.
     * @throws An error that occurred while initializing the sensor.
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield sleep(20);
                yield this.reset();
                if (!(yield this.check())) {
                    throw "Could not detect!";
                }
                yield this.setMode(MODE_IDLE);
                yield this.clear_command();
                yield this.setMode(MODE_STANDARD);
                yield this.temperature_compensation(25.5);
                yield this.humidity_compensation(51);
                return true;
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Resets ENS160 sensor.
     * @returns `true` if successfully reset the sensor.
     * @throws An error that occurred while resetting the sensor.
     */
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.setMode(MODE_RESET);
                return true;
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Change operation mode of ENS160 sensor.
     * @param mode Target operation mode.
     * @returns `true` if successfully change operation mode of the sensor.
     * @throws An error that occurred while changing mode of the sensor.
     */
    setMode(mode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!VALID_MODES.includes(mode)) {
                    throw new Error(`Invalid mode: ${mode}`);
                }
                const buf = Buffer.from([mode]);
                yield this.bus.writeI2cBlock(ENS160_I2CADDR, ENS160_CMD_OPMODE, buf.length, buf);
                yield sleep(10);
                return true;
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Read operation mode of ENS160 sensor.
     * @returns Operation mode of the sensor.
     * @throws An error that occurred while reading operation mode of the sensor.
     */
    getMode() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const curr = yield this.bus.readI2cBlock(ENS160_I2CADDR, ENS160_CMD_OPMODE, 1, Buffer.alloc(1));
                return curr.buffer.readInt8();
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Check detection of ENS160 sensor.
     * @returns `true` if successfully detected the sensor.
     * @throws An error that occurred while detecting the sensor.
     */
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bug = yield this.bus.readI2cBlock(ENS160_I2CADDR, ENS160_CMD_PARTID, 2, Buffer.alloc(2));
                if (bug.buffer.readIntLE(0, 2) !== ENS160_PARTID) {
                    throw "Could not locate ENS160!";
                }
                return true;
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Clear command of ENS160 sensor.
     * @returns `true` if successfully cleared command of the sensor.
     * @throws An error that occurred while clearing command of the sensor.
     */
    clear_command() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.bus.writeI2cBlock(ENS160_I2CADDR, ENS160_CMD_COMMAND, 1, Buffer.from([COMMAND_NOP]));
                yield this.bus.writeI2cBlock(ENS160_I2CADDR, ENS160_CMD_COMMAND, 1, Buffer.from([COMMAND_CLRGPR]));
                yield sleep(10);
                return true;
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Read general purpose registers of ENS160 sensor.
     * @returns `Buffer` of general purpose read registers of the sensor.
     * @throws An error that occurred while general purpose read registers of the sensor.
     */
    read_gpr() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.bus.readI2cBlock(ENS160_I2CADDR, ENS160_CMD_READGPR, 8, Buffer.alloc(8));
                return data.buffer;
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Read firmware version of ENS160 sensor.
     * @returns `x.x.x` firmware version of the sensor.
     * @throws An error that occurred while reading firmware version of the sensor.
     */
    firmware_version() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const curr = yield this.getMode();
                yield this.setMode(MODE_IDLE);
                yield this.clear_command();
                yield sleep(10);
                yield this.bus.writeI2cBlock(ENS160_I2CADDR, ENS160_CMD_COMMAND, 1, Buffer.from([COMMAND_GETAPPVER]));
                const ret = yield this.read_gpr();
                yield this.setMode(curr);
                return `${parseInt(ret[4].toString(10))}.${parseInt(ret[5].toString(10))}.${parseInt(ret[6].toString(10))}`;
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Define temperature compensation of ENS160 sensor.
     * @param temp_c Temperature in Celsius.
     * @returns `true` if successfully defined temperature compensation of the sensor.
     * @throws An error that occurred while defining temperature compensation of the sensor.
     */
    temperature_compensation(temp_c) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const k64 = Math.ceil((temp_c + 273.15) * 64.0);
                const buf = Buffer.from(k64.toString(16), "hex");
                yield this.bus.writeI2cBlock(ENS160_I2CADDR, ENS160_CMD_TEMPIN, 2, buf);
                return true;
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Read temperature used in its calculations of ENS160 sensor.
     * @returns `number` value of temperature used in its calculations in the sensor.
     * @throws An error that occurred while reading temperature used in its calculations of the sensor.
     */
    get_temperature_compensation() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const measurement = yield this.bus.readI2cBlock(ENS160_I2CADDR, ENS160_CMD_T, 2, Buffer.alloc(2));
                const be = measurement.buffer.readIntBE(0, measurement.bytesRead);
                return parseInt((be / 64.0 - 273.15).toFixed(1));
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Define relative humidity compensation of ENS160 sensor.
     * @param temp_c Relative humidity in percentual (without %, 0-100).
     * @returns `true` if successfully defined relative humidity compensation of the sensor.
     * @throws An error that occurred while defining relative humidity compensation of the sensor.
     */
    humidity_compensation(humidity) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const k64 = Math.ceil(humidity * 512);
                const buf = Buffer.from(k64.toString(16), "hex");
                yield this.bus.writeI2cBlock(ENS160_I2CADDR, ENS160_CMD_RHIN, buf.length, buf);
                return true;
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Read relative humidity used in its calculations of ENS160 sensor.
     * @returns `number` value of relative humidity used in its calculations in the sensor.
     * @throws An error that occurred while reading relative humidity used in its calculations of the sensor.
     */
    get_humidity_compensation() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const measurement = yield this.bus.readI2cBlock(ENS160_I2CADDR, ENS160_CMD_RH, 2, Buffer.alloc(2));
                const be = measurement.buffer.readIntBE(0, measurement.bytesRead);
                return parseInt((be / 512).toFixed(1));
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Gets air quality index data from ENS160 sensor.
     * @returns air quality index gotten from the sensor (1-5).
     * @throws An error that occurred while getting air quality index data.
     */
    AQI() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const measurement = yield this.bus.readI2cBlock(ENS160_I2CADDR, ENS160_CMD_AQI, 1, Buffer.alloc(1));
                return measurement.buffer.readIntLE(0, measurement.bytesRead);
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Gets eCO2 data from ENS160 sensor.
     * @returns eCO2 gotten from the sensor in parts per million (400-65000).
     * @throws An error that occurred while getting eCO2 data.
     */
    ECO2() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const measurement = yield this.bus.readI2cBlock(ENS160_I2CADDR, ENS160_CMD_ECO2, 2, Buffer.alloc(2));
                return measurement.buffer.readIntLE(0, measurement.bytesRead);
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Gets TVOC data from ENS160 sensor.
     * @returns VCO2 gotten from the sensor in parts per billion (0-65000).
     * @throws An error that occurred while getting TVOC data.
     */
    TVOC() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const measurement = yield this.bus.readI2cBlock(ENS160_I2CADDR, ENS160_CMD_TVOC, 2, Buffer.alloc(2));
                return measurement.buffer.readIntLE(0, measurement.bytesRead);
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Read status of ENS160 sensor.
     * @returns Status of the sensor.
     * @throws An error that occurred while reading status of the sensor.
     */
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const measurement = yield this.bus.readI2cBlock(ENS160_I2CADDR, ENS160_CMD_STATUS, 1, Buffer.alloc(1));
                const bin = measurement.buffer[0].toString(2).padStart(8, "0");
                const opmode = bin.substring(0, 1) === "1";
                const error = bin.substring(1, 2) === "1";
                let status = "invalid";
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
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = ENS160;
const sleep = (duration) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, duration);
    });
};
