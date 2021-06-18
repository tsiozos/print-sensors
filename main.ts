let timeDelta = 0   //delta of local time in tenths of seconds to network time

input.onButtonPressed(Button.A, function () {
	basic.showString("" + (getIDencoded()))
    input.calibrateCompass()
})
function getIDencoded (): string {
    return "" + Math.abs(control.deviceSerialNumber() % 100)
}

function getIDnum (): number {
    return Math.abs(control.deviceSerialNumber() % 100)
}

function getSensorsString () {
	let idstr = getIDencoded()
    let temp = input.temperature()-3.5
    let pitch = input.rotation(Rotation.Pitch)
    let roll = input.rotation(Rotation.Roll)
    let comp = input.compassHeading()
    let light = input.lightLevel()
    return idstr+";"+temp.toString()+";"+pitch.toString()+";"+
            roll.toString()+";"+light.toString()+";"+comp.toString()+"\n\r"
}

radio.setGroup(1)
radio.setTransmitPower(7)
basic.showString("" + (getIDencoded()))

radio.onReceivedValue(function (name: string, value: number) {
    if (name === "SYNC") {
        // the network time is nettime = input.runningTime()/100 - timeDelta
        timeDelta = input.runningTime()/100 - value
        radio.sendValue("SYNCACK",0)
    }
    else if (name === "WAKE") {
        radio.sendValue("STATION", getIDnum())
    }

})

basic.forever(function () {
    let sensstr = getSensorsString()
    serial.writeString(sensstr)
    let sens = sensstr.split(";")
    for (let i = 0; i<sens.length; i++)
        serial.writeString(sens[i]+"\n\r")
    basic.pause(2000)
})
