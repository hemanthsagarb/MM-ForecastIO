# MM-ForecastIO

![ScreenShot](https://raw.github.com/hemanthsagarb/MM-ForecastIO/master/look.png)

## Dependencies (Add following packages to package.json)

Upgrade to the latest npm and get the latest magicmirror

Add the following dependencies to package.json in the MagicMirror directory (https://github.com/MichMich/MagicMirror)

"d3":"latest"

"jsdom": "latest"

run `npm install`

## Module Installation

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


