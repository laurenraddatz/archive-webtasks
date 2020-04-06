const request = require('request-promise@1.0.2');

module.exports = function(context, cb) {
  const city = context.body.text;

	if (!city.length || !city) {
		return cb(null, {
		  attachments: [{
  		  color: 'danger',
  		  text: 'Please provide a city :grimacing:'
		  }]
		});
	}

  const getWeather = () => {
		const loc = city === 'matt1337c' ? 'atlanta' : city === 'laurenisacat' ? 'denver' : city;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${loc}&key=AIzaSyAlQbMhGoBHhNzWW-3hnUCBY_5vq-Kv6LY`;
    return request.get({ url, method: 'GET', json: true })
      .then((response) => {
        if (!response) {
          throw new Error("No response...");
        }
        return {
          location: response.results[0].geometry.location,
          address: response.results[0].formatted_address
        }
      })
      .then((data) => {
        const urlQuery = 'https://api.darksky.net/forecast/34a821cdc9f5d6f950abe4ba7f2cea57/' + data.location.lat + ',' + data.location.lng;
        request(urlQuery, function(error, response, body) {
      		if (error) return cb(error);
      		if (!error && response.statusCode === 200) {
      			const parse = JSON.parse(body);
      		  const fahrenheit = parse.currently.temperature;
      			const celsius = (fahrenheit - 32) / 1.8;
      		  const weather = ':earth_americas: The weather in ' + '*' + data.address + '*' + ' is currently ' + fahrenheit.toFixed(1) + 'F / ' + celsius.toFixed(1) + 'C and ' + parse.currently.summary;
      			return cb(null, {
      			  response_type: 'in_channel',
      			  text: weather
      			});
      		}
      	});
      })
    };
  
  return getWeather();
  
};
