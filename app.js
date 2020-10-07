var request = require('request');

//Add Log entry of the messages into KHH
const post_to_khh = (kiosk_sender, kiosk_receiver, kiosk_message, kiosk_attachments) =>{
  console.log("MEssage received "+kiosk_message); 
    request.post(
        'http://kioskhomehub.com/slack/events',
        { json: { receiver:kiosk_sender, channel:kiosk_sender,text:kiosk_message,link:kiosk_attachments } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log(body);
            }
        }
    );
}
post_to_khh('SLACK_BOT', "Instantiated", null, null);

//Post to the KIOSK
const postToKiosk = (kiosk_sender, kiosk_receiver, kiosk_message, kiosk_attachments) => {
//   request.post(
//     'http://am1.org:92/slack/msg',
//     { json: { receiver : kiosk_receiver,channel : kiosk_sender, text: kiosk_message, link:kiosk_attachments  } },
//     function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             //console.log(body);
//         }
//     }
    
// );

  console.log(`POST2KIOS: SENDER ${kiosk_sender} receiver ${kiosk_receiver} message ${kiosk_message}`);
}

//Convert Channel ID to Channel Name
const getChannelInfo = (channel_id) => {
  channel_name = "testing";
  var request = require('request');
  request.post({
    url:     'https://slack.com/api/conversations.info',
    form:    { token: "xoxp-1332390320279-1332620811703-1397681235269-244aa698b38b144baf9e787946437377", channel: channel_id }
  }, function(error, response, body){
    
    let event_data = JSON.parse(body);
    console.log("returning"  +event_data.channel.name);
    return event_data.channel.name;
  });
  return channel_id;
}

const { createEventAdapter } = require('@slack/events-api');
const slackSigningSecret = 'f40c74e90ef401272e0685de0d769df8';
const port = process.env.PORT || 3000;

// Initialize the adapter to trigger listeners with envelope data and headers
const slackEvents = createEventAdapter(slackSigningSecret, {
  includeBody: true,
  includeHeaders: true,
});

// Listeners now receive 3 arguments
slackEvents.on('message', (event, body, headers ) => {

  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
  let event_data = [];
  if(event.text){
    event_data['text'] = event.text;
  }
  if(event.files){
    var event_files = [];
    for (let index = 0; index < event.files.length; index++) {
      event_files[index] = event.files[index].url_private;
    }
    event_data['files'] = event_files;
  }

  post_to_khh(event.channel, JSON.stringify(event_data), event.text, event_files );
  //postToKiosk(event.user, event.channel, event.text, event_files);
  console.log(`The event ID is ${body.event_id} and time is ${body.event_time}`);
  if (headers['X-Slack-Retry-Num'] !== undefined) {
    console.log(`The delivery of this event was retried ${headers['X-Slack-Retry-Num']} times because ${headers['X-Slack-Retry-Reason']}`);
  }
});


(async () => {
    const server = await slackEvents.start(port);
    console.log(`Listening for events on ${server.address().port}`);
})();


