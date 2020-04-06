module.exports = function (ctx, cb) {
    var username = ctx.body.text.split(" ")[0];
    if (!username.length) {
      var slackResponse = {
        attachments: [
          {
            "text": "Please provide a username",
            "color": "danger"
          }
        ]
      };
      
      return cb(null, slackResponse);
    }
    
    cb(null, {
      response_type: 'in_channel', // uncomment to have the response visible to everyone on the channel
        text: 'http://collage.cx/' + username + '/1month.png'
    });
  };
  