const request = require('request-promise@1.0.2');

module.exports = function(context, cb) {
  const query = context.body.text;
  
	if (!query.length || !query) {
		return cb(null, {
		  attachments: [{
  		  color: 'danger',
  		  text: 'wyd :gavin:'
		  }]
		});
	}

  const getAnswer = () => {
    const url = `https://api.wolframalpha.com/v2/query?input=${query}&appid=8X6J8V-QX4934G2H2&format=plaintext&output=json&includepodid=Result`;
    return request.get({ url, method: 'GET' })
      .then((response) => {
        // console.log(response);
        const data = JSON.parse(response);
        // return response
        return data.queryresult.pods[0].subpods[0].plaintext

      })
      .catch((error) => {
        // console.log(error)
        return cb(null, {
          response_type: 'in_channel',
  			  text: ':thotbrows: Your request could not be understood',
  			  color: 'danger'
        });
      })
      .then((data) => {
        return cb(null, {
  			  response_type: 'in_channel',
          text: `${query} \n\n ${data}`,
  			 // attachments: [{
  			 //   title: query,
  			 //   text: data,
  			 //   color: '#ffb7c7'
  			 //  // image_url: data,
  			 // }]
  			});
    });
  };

  return getAnswer(query);
};