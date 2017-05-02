# MM-ForecastIO

![ScreenShot](https://raw.github.com/hemanthsagarb/MM-ForecastIO/master/look.png)

## Dependencies (Add following packages to package.json)

"d3":"latest"

"jsdom": "latest"

## Installation
- Upgrade to the latest npm and get the latest magicmirror
- Clone this repo
- Rename the folder from "MM-ForecastIO" to forecastio
- put the folder in MagicMirror modules directory

## config

- You need to provide the APPKEY from forecast.io
- You can configure latitude and longitude of any location

````javascript
{

  module: "forecastio",
  
  position: "top",
  
  config:{
  
     appkey:"APPKEY",
     
     latitude: 43.6529,
     
     longitude: -79.3849
     
  }
  
}
````


