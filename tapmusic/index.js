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
        text: 'http://www.tapmusic.net/collage.php?user='+username+'&type=7day&size=3x3&caption=true'
        //actually, soz, it was really passive-aggressive
        //i'm not good at Thinking™
    });
  };
  