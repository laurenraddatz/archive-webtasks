module.exports = function (ctx, cb) {
    var splits = ctx.body.text.split(" ");
    var username = splits[0];
    var size;
    var splitx;
    var force_update=false;
    if(splits.length>1){
      splitx=splits[1].toLowerCase();
      if(splitx==="force_update"||splitx==="forceupdate"||splitx==="update"||splitx==="force"){
        force_update=true;
      }
      else{
        size = splits[1];
      }
    }
    else{
      size="";
    }
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
    var htext;
    var randomn = Math.floor(Math.random() * 10000) + 1;
    var extrat = "";
    if(randomn<=100){
      extrat = "";
      if(randomn<=10){
        extrat = "";
        if(randomn===1){
          extrat = "";
        }
      }
    }
    if(size===""){
       //htext='https://lovely.lc/lastfm/' + username + '.plays.1week.png?'+(+new Date())+extrat;
       htext='http://collage.cx/' + username + '.png?'+(+new Date())+extrat;
    }
    else{
      //htext='https://lovely.lc/lastfm/' + size+"!" + username + '.plays.1week.png?'+(+new Date())+extrat;
      htext='http://collage.cx/' + username + '/1week/'+size+'.png?'+(+new Date())+extrat;
    }
    cb(null, {
      response_type: 'in_channel', // uncomment to have the response visible to everyone on the channel
          text: htext
    });
  };
  