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
    let tim = input.runningTime()/100 - timeDelta
    let temp = input.temperature()-3.5
    let pitch = input.rotation(Rotation.Pitch)
    let roll = input.rotation(Rotation.Roll)
    let comp = input.compassHeading()
    let light = input.lightLevel()
    return idstr+";"+tim.toString()+";"+temp.toString()+";"+pitch.toString()+";"+
            roll.toString()+";"+light.toString()+";"+comp.toString()+"\n\r"
}

function sendWithRSSI(data: string) {
    let tries = triesFromRSSI(getRSSI(), 0.95, 5)
        for (let i=0; i < tries; i++) {
            radio.sendString(data)
            basic.pause(randint(50,60))
        }
}

radio.setGroup(1)
radio.setTransmitPower(7)
basic.showString("" + (getIDencoded()))

radio.onReceivedValue(function (name: string, value: number) {
    if (name === "SYNC") {
        // the network time is nettime = input.runningTime()/100 - timeDelta
        timeDelta = input.runningTime()/100 - value
        radio.sendValue("SYNCACK",getIDnum()) //ACK with station ID
    }
    else if (name === "WAKE") {
        radio.sendValue("STATION", getIDnum())
        
    }
    else if (name === "DATA") {
        let reply=""
        switch (value) {
            case 0:     // send all sensor data
                reply = getSensorsString()
                break;
        }
        sendWithRSSI(reply)
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


function getRSSI() {
    return radio.receivedPacket(RadioPacketProperty.SignalStrength)
}

function triesN(y: number, p: number) {
    return Math.ceil(Math.log(1-y)/Math.log(p))
}

function lossP(y: number, n: number){
    return Math.pow((1-y),1/n)
}

function triesFromRSSI(rssi: number, y: number, maxtries: number){
    let rssi2: number = rssi + 100
    let p: number = Math.min(1,5936.2673*rssi2**(-3.7231)) // this function may return a p > 1
    // so we limit it to 1
    let t: number = 0
    if (p==1)
        t = maxtries
    else
        t = Math.max(1,triesN(y,p))  //if tries fall below 1, at least 1 try
    return t
}