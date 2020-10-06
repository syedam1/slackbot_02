var request = require('request');

const post_to_khh = (kiosk_sender, kiosk_message) =>{
    request.post(
        'http://kioskhomehub.com/slack/events',
        { json: { message: kiosk_message, sender : kiosk_sender } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log(body);
            }
        }
    );
}

post_to_khh('SLACK_BOT', "Instantiated");

const { createEventAdapter } = require('@slack/events-api');
const slackSigningSecret = 'f40c74e90ef401272e0685de0d769df8';
const port = process.env.PORT || 3000;

// Initialize the adapter to trigger listeners with envelope data and headers
const slackEvents = createEventAdapter(slackSigningSecret, {
  includeBody: true,
  includeHeaders: true,
});

// Listeners now receive 3 arguments
slackEvents.on('message', (event, body, headers) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
  post_to_khh(event.channel, event.text);
  console.log(`The event ID is ${body.event_id} and time is ${body.event_time}`);
  if (headers['X-Slack-Retry-Num'] !== undefined) {
    console.log(`The delivery of this event was retried ${headers['X-Slack-Retry-Num']} times because ${headers['X-Slack-Retry-Reason']}`);
  }
});


(async () => {
    const server = await slackEvents.start(port);
    console.log(`Listening for events on ${server.address().port}`);
})();


