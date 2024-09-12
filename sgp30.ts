/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon="" block="SGP30"
namespace IML_SGP30 {

    let CO2 = 0
    let eCO2 = 0
    let I2C_ADDR = 0x58
    let INIT_AIR_QUALITY = 0x2003
    let MEASURE_AIR_QUALITY = 0x2008

    //% block
    //% block="二酸化炭素"
    //% weight=100    
    export function getCO2(): number {
        return measureAirQuality()
    }

    // SGP30を初期化する関数
    function initializeSGP30() 
    {
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
 
    initializeSGP30()
}
