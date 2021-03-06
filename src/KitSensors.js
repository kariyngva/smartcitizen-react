import React, { Component } from 'react';
import MiniPlot from "./MiniPlot.js"
import {
  FaBatteryEmpty, FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaBatteryThreeQuarters,
  FaCloud,
  FaFlask,
  FaLightbulb,
  FaRegQuestionCircle,
  FaSun,
  FaThermometerEmpty, FaThermometerFull, FaThermometerHalf, FaThermometerQuarter, FaThermometerThreeQuarters,
  FaTint,
  FaVolumeDown, FaVolumeUp,
  FaWifi } from 'react-icons/fa';

class KitSensors extends Component{
  constructor(props){
    super(props);
    this.state = {
      x:[],
      y:[]
    };
  }

  getBgColor(id, value){
    //const ratio = value < 100 ? value/100 : 1;
    //return { backgroundColor: `rgb(${ratioToRGB(ratio).join(',')})` };

    // Some sensors should give green when value is high like BAT, but others the opposite, like dB, or even mid range (temp)
    // Lower  is better: noise (db), all PMs
    // Medium is better: temp, pressure, humid, solar, wifi?, co
    // Higher is better: bat?

    //humid
    if (id === 5 || id === 13 || id === 56) { return this.evaluateColor(value, 16, 90, 'red', 'forestgreen', 'cornflowerblue'); }
    // solar panel | light sensor
    if (id === 6 || id === 11 || id === 14 || id === 18) { return this.evaluateColor(value, 150, 270, 'grey', 'orange', 'yellow'); }
    // loudness
    if (id === 7 || id === 53)  { return this.evaluateColor(value, 36, 70, 'cornflowerblue', 'forestgreen', 'red'); }
    //wifi
    if (id === 8 || id === 9 || id === 21) { return this.evaluateColor(value, 0, 100, 'cornflowerblue', 'forestgreen', 'red'); }
    // temp
    if (id === 12 || id === 55) { return this.evaluateColor(value, 18, 27, 'cornflowerblue', 'forestgreen', 'red'); }
    //bat
    if (id === 17 || id === 10) { return this.evaluateColor(value, 15, 85, 'red', 'yellow', 'forestgreen'); }
    //no2
    if (id === 15) { return this.evaluateColor(value, 3300, 3615, 'cornflowerblue', 'forestgreen', 'red'); }
    // pressure
    if (id === 58) { return this.evaluateColor(value, 101, 103, 'cornflowerblue', 'forestgreen', 'red'); }
    // co
    if (id === 16) { return this.evaluateColor(value, 390, 425, 'orange', 'forestgreen', 'red'); }
    // pm 1
    if (id === 89) { return this.evaluateColor(value, 20, 50, 'forestgreen', 'orange', 'red'); }
    // pm 2.5
    if (id === 87) { return this.evaluateColor(value, 20, 50, 'forestgreen', 'orange', 'red'); }
    // pm 10
    if (id === 88) { return this.evaluateColor(value, 35, 100, 'forestgreen', 'orange', 'red'); }

    // if no id matches
    return '';
  }

  // Gets 2 thresholds, low and high. For temperature example: (value,16,27,'blue','green','red')
  // values below 16 are cold (blue), above 27 (red), between: green
  // Returns a valid CSS color code like  'orange','#ccc' or 'rgb(255,255,243,0.5)'
  evaluateColor(value, low, high, colorLow, colorMiddle, colorHigh){
    if (value < low) { return colorLow }
    if (value > high) { return colorHigh }
    return colorMiddle;
  }

  getIcon(id, value){
    // Each id is a sensor https://api.smartcitizen.me/v0/sensors
    // humidity
    if (id === 5 || id === 13 || id === 56) { return <FaTint />; }
    if (id === 6 || id === 11 || id === 18) { return <FaSun />; }
    if (id === 7 || id === 53)  {
      if (value <= 30) { return <FaVolumeDown />; }
      if (value > 30) { return <FaVolumeUp />; }
    }
    if (id === 8 || id === 9 || id === 21) { return <FaWifi />; }
    //Temp
    if (id === 12 || id === 55) {
      if (value <= 0) { return <FaThermometerEmpty />; }
      if (value > 0 && value <= 15) { return <FaThermometerQuarter />; }
      if (value > 15 && value <= 30) { return <FaThermometerHalf />; }
      if (value > 30 && value <= 40) { return <FaThermometerThreeQuarters />; }
      if (value > 40) { return <FaThermometerFull />; }
    }
    if (id === 14) { return <FaLightbulb />; }

    if (id === 15) { return <FaFlask />; }
    //  Air Pollution ug/m3
    if (id === 16 || id === 87 || id === 88 || id === 89) { return <FaCloud />};
    if (id === 17 || id === 10) {
      if (value <= 10) { return <FaBatteryEmpty />; }
      if (value > 10 && value <= 45) { return <FaBatteryQuarter />; }
      if (value > 45 && value <= 65) { return <FaBatteryHalf />; }
      if (value > 65 && value <= 90) { return <FaBatteryThreeQuarters />; }
      if (value > 90) { return <FaBatteryFull />; }
    }
    return <FaRegQuestionCircle />;
  }

  componentDidMount(){
    //console.log('comp mount sensor:', this.props.sensorinfo.id );
    var that = this;

    // TODO: remove this delay
    // Without this delay, when changing between Favorite Devices,
    // it will try to query the API for the newly selected device,
    // but using the previous devices sensors-list (state.theSensors)
    // resulting in many 500 errors.
    // We need to WAIT for theSensors to Populate in the 'getDeviceInfo'
    //
    //
    setTimeout(function(){
      that.getData();
    }, 500);

    // Also get data every 60 seconds
    setInterval(function(){
      that.getData();
    }, 60000);
  }

  getData(){
    console.log('get reading for', this.props.selectedDevice, 'sensor:', this.props.sensorinfo.id);
    //let from_date = "2019-02-03"
    //let to_date = "2019-02-05"
    let from_date = this.props.from_date
    let to_date = this.props.to_date
    let xxx = [];
    let yyy = [];

    let url = "https://api.smartcitizen.me/v0/devices/" + this.props.selectedDevice +
      "/readings?sensor_id=" + this.props.sensorinfo.id + "&rollup=2h&from=" + from_date +
      "&to=" + to_date;
    return fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.readings) {
          responseJson.readings.forEach(([x, y]) => {
            xxx.push(x)
            yyy.push(y)
          })
          this.setState({ x: xxx, y: yyy})
        }
      }).catch(err => {
        console.log( err)
      })
  }


  render(){
    let item = this.props.sensorinfo;
    return(
      <div key={item['id']} className="p-0 m-0 col-6 col-md-4 col-xl-3 sc-sensor-outer" >
        <div style={{color: this.getBgColor(item['id'], item['value']) }}
             className="d-flex justify-content-between flex-column"
             onClick={() => this.props.changeSelectedSensor(item['id'])} >
          <p className="m-2 text-center" style={{color: 'grey'}} >{item['description']}</p>

          <div className="text-center mt-3 d-flex justify-content-center align-items-center">
            <h5 className="">{this.getIcon(item['id'], item['value'])}</h5>
            <h1 className="mx-3">{Math.round(item['value'] * 100)/100}</h1>
            <h3 className=""> {item['unit']}</h3>
          </div>
          {this.props.showDetails ? (
            <p className="m-2 text-left">{item['name']} - id: { item['id'] }</p>
          ):(
            <div className="my-3"></div>
          )
          }
        </div>

        {this.props.showMiniPlot &&
          <MiniPlot x={this.state.x} y={this.state.y} />
        }
      </div>
    )
  }
}


export default KitSensors;
