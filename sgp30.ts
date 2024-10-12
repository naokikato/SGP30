/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon="" block="二酸化炭素センサ(SGP30)"
namespace IML_SGP30 {

    //% block
    //% block="二酸化炭素(ppm)"
    //% weight=99    
    export function getCO2(): number {
        return measureAirQuality()
    }


    let eCO2 = 0
    let I2C_ADDR = 0x58
    let INIT_AIR_QUALITY = 0x2003
    let MEASURE_AIR_QUALITY = 0x2008

    // センサの初期化
    function initializeSGP30() {
        pins.i2cWriteNumber(I2C_ADDR, INIT_AIR_QUALITY, NumberFormat.UInt16BE)
        basic.pause(10) // 初期化待ち時間
    }

    // CO2とTVOCデータを取得する関数
    function measureAirQuality() : number
    {
        pins.i2cWriteNumber(I2C_ADDR, MEASURE_AIR_QUALITY, NumberFormat.UInt16BE)

        basic.pause(20) // 測定のための待ち時間

        let result = pins.createBuffer(6)
        result = pins.i2cReadBuffer(I2C_ADDR, 6)

        // eCO2データ（結果の上位バイトと下位バイトの結合）
        eCO2 = (result[0] << 8) | result[1]
        return eCO2
    }


    //% block
    //% block="二酸化炭素センサの上閾値を $value に設定する"
    //% weight=90
    export function setCO2Sensor1(value: number) {
        threshold1 = value;
        startListening();
    }

    //% block
    //% block="二酸化炭素センサの下閾値を $value に設定する"
    //% weight=89
    export function setCO2Sensor2(value: number) {
        threshold2 = value;
        startListening();
    }

    //% block
    //% block="二酸化炭素センサの出力が上閾値以上になったとき"
    //% weight=88
    export function onLightDetected1(handler: () => void) {
        control.onEvent(CO2_EVENT_ID1, EventBusValue.MICROBIT_EVT_ANY, handler);
    }

    //% block
    //% block="二酸化炭素センサの出力が下閾値以下になったとき"
    //% weight=87
    export function onLightDetected2(handler: () => void) {
        control.onEvent(CO2_EVENT_ID2, EventBusValue.MICROBIT_EVT_ANY, handler);
    }

    const CO2_EVENT_ID1 = 1001;
    const CO2_EVENT_ID2 = 1002;
    let threshold1 = 1000;
    let threshold2 = 400;
    let interval = 100;
    let isListening = false

    // イベントリスナーの開始
    function startListening() {
        if (isListening) return;
        isListening = true;

        control.inBackground(() => {
            while (true) {
                let co2Level = getCO2();
                if (co2Level >= threshold1) {
                    // イベントを発生させる
                    control.raiseEvent(CO2_EVENT_ID1, co2Level);
                }
                if (co2Level <= threshold2) {
                    // イベントを発生させる
                    control.raiseEvent(CO2_EVENT_ID2, co2Level);
                }
                basic.pause(interval);
            }
        });
    }

    //main
    initializeSGP30()
}
