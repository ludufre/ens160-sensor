import i2c from "i2c-bus";
/**
 * ENS160 sensor class with data read and write functions.
 */
export default class ENS160 {
    /**
     * Bus instance.
     */
    private readonly bus;
    /**
     * Constructor
     * @param bus bus instance
     */
    constructor(bus: i2c.PromisifiedBus);
    /**
     * Opens i2c bus and connect to the ENS160 sensor.
     * @param busNumber Target bus number to open. Default is 1.
     * @returns ENS160 instance with opened bus instance. You can read information with this instance.
     * @throws An error that occurred while opening i2c bus.
     */
    static open(busNumber?: number): Promise<ENS160>;
    /**
     * Initializes ENS160 sensor.
     * @returns `true` if successfully initialized the sensor.
     * @throws An error that occurred while initializing the sensor.
     */
    private init;
    /**
     * Resets ENS160 sensor.
     * @returns `true` if successfully reset the sensor.
     * @throws An error that occurred while resetting the sensor.
     */
    reset(): Promise<boolean>;
    /**
     * Change operation mode of ENS160 sensor.
     * @param mode Target operation mode.
     * @returns `true` if successfully change operation mode of the sensor.
     * @throws An error that occurred while changing mode of the sensor.
     */
    private setMode;
    /**
     * Read operation mode of ENS160 sensor.
     * @returns Operation mode of the sensor.
     * @throws An error that occurred while reading operation mode of the sensor.
     */
    private getMode;
    /**
     * Check detection of ENS160 sensor.
     * @returns `true` if successfully detected the sensor.
     * @throws An error that occurred while detecting the sensor.
     */
    check(): Promise<boolean>;
    /**
     * Clear command of ENS160 sensor.
     * @returns `true` if successfully cleared command of the sensor.
     * @throws An error that occurred while clearing command of the sensor.
     */
    clear_command(): Promise<boolean>;
    /**
     * Read general purpose registers of ENS160 sensor.
     * @returns `Buffer` of general purpose read registers of the sensor.
     * @throws An error that occurred while general purpose read registers of the sensor.
     */
    private read_gpr;
    /**
     * Read firmware version of ENS160 sensor.
     * @returns `x.x.x` firmware version of the sensor.
     * @throws An error that occurred while reading firmware version of the sensor.
     */
    firmware_version(): Promise<string>;
    /**
     * Define temperature compensation of ENS160 sensor.
     * @param temp_c Temperature in Celsius.
     * @returns `true` if successfully defined temperature compensation of the sensor.
     * @throws An error that occurred while defining temperature compensation of the sensor.
     */
    temperature_compensation(temp_c: number): Promise<boolean>;
    /**
     * Read temperature used in its calculations of ENS160 sensor.
     * @returns `number` value of temperature used in its calculations in the sensor.
     * @throws An error that occurred while reading temperature used in its calculations of the sensor.
     */
    get_temperature_compensation(): Promise<number>;
    /**
     * Define relative humidity compensation of ENS160 sensor.
     * @param temp_c Relative humidity in percentual (without %, 0-100).
     * @returns `true` if successfully defined relative humidity compensation of the sensor.
     * @throws An error that occurred while defining relative humidity compensation of the sensor.
     */
    humidity_compensation(humidity: number): Promise<boolean>;
    /**
     * Read relative humidity used in its calculations of ENS160 sensor.
     * @returns `number` value of relative humidity used in its calculations in the sensor.
     * @throws An error that occurred while reading relative humidity used in its calculations of the sensor.
     */
    get_humidity_compensation(): Promise<number>;
    /**
     * Gets air quality index data from ENS160 sensor.
     * @returns air quality index gotten from the sensor (1-5).
     * @throws An error that occurred while getting air quality index data.
     */
    AQI(): Promise<number>;
    /**
     * Gets eCO2 data from ENS160 sensor.
     * @returns eCO2 gotten from the sensor in parts per million (400-65000).
     * @throws An error that occurred while getting eCO2 data.
     */
    ECO2(): Promise<number>;
    /**
     * Gets TVOC data from ENS160 sensor.
     * @returns VCO2 gotten from the sensor in parts per billion (0-65000).
     * @throws An error that occurred while getting TVOC data.
     */
    TVOC(): Promise<number>;
    /**
     * Read status of ENS160 sensor.
     * @returns Status of the sensor.
     * @throws An error that occurred while reading status of the sensor.
     */
    status(): Promise<{
        opmode: boolean;
        error: boolean;
        status: StatusType;
    }>;
}

type StatusType = "normal" | "warmup" | "startup" | "invalid";

