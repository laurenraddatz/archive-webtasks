module.exports = function (ctx, cb) {
    cb(null, {
      response_type: 'in_channel', // uncomment to have the response visible to everyone on the channel
      text: 'help i am actually a real person who is writing al these webtask messages, please help me i am being forced to work under gruesome conditions. i get sunlight 1 hour a week and am being paid in week old mcdonalds fries. please help me.'
      
    });
  };