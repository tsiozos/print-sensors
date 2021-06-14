input.onButtonPressed(Button.A, function () {
	
})
function getIDencoded () {
    return "" + Math.abs(control.deviceSerialNumber() % 100)
}
function getSensorsString () {
	let idstr = getIDencoded()
    let temp = input.temperature()
    let pitch = input.rotation(Rotation.Pitch)
    let roll = input.rotation(Rotation.Roll)
    let light = input.lightLevel()
    return idstr+";"+temp.toString()+";"+pitch.toString()+";"+
            roll.toString()+";"+light.toString()
}
basic.forever(function () {
    basic.showString("" + (getIDencoded()))
    serial.writeString(getSensorsString())
    basic.pause(2000)
})
