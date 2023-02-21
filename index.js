const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const { Payload } = require("dialogflow-fulfillment");
app.use(bodyParser.json())


app.post('/dialogflow-fulfillment', (request,response) => {

    dialogflowFulfillment(request,response)
})



app.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});

const dialogflowFulfillment = (request, response) => {
    const agent = new WebhookClient({ request, response });

    function welcome(agent){
        
        const startDate = new Date();
        // const timezoneOffset = now.getTimezoneOffset() * 60 * 1000; // Convert to milliseconds
        // const localTime = now.getTime() - timezoneOffset;
        // const time = new Date(localTime);
        // console.log(time)
        // const hours = time.getHours();
        // const minutes = time.getMinutes();
        // const seconds = time.getSeconds();


        // agent.sessionParams.currentTime = `${hours}:${minutes}`;
        // console.log(`${hours}:${minutes}`)
        agent.context.set('level1', 5, {'currentTime' : `${startDate}`});
        const payload = {
         
                "google": {
                  "expectUserResponse": true,
                  "richResponse": {
                    "suggestions": [
                      {
                        "title": "Book Train Ticket"
                      },
                      {
                        "title": "Rent Car"
                      }
                    ],
                    "items": [
                      {
                        "simpleResponse": {
                          "textToSpeech": "Hi, I am your travel planner. You can ask me to book your train ticket(s) and car rental."
                        }
                      }
                    ]
                  }
            
              }
           
          };
          agent.add(new Payload(agent.UNSPECIFIED, payload, {rawPayload: true, sendAsMessage: true}));
        
    }

	function payment(agent){
    const payload = {
    
        "google": {
    "richResponse": {
      "items": [
        {
          "simpleResponse": {
            "textToSpeech": `Thank you for your payment!! Your tickets have been booked and your random id is ${Math.floor(Math.random() *100) + 1}`
          }
        },{
            "simpleResponse": {
              "textToSpeech": "Do you want to rent a car also?"
            }
          }
      ],
      "suggestions": [
        {
          "title": "Yes"
        },
        {
          "title": "No"
        }
      ]
    },
    "expectUserResponse": true
  }
       
      };
      agent.add(new Payload(agent.UNSPECIFIED, payload, {rawPayload: true, sendAsMessage: true}));
    

	}

    function checkOrigDest(agent){
        const origin = agent.parameters.origin;
        const destination = agent.parameters.destination;

        if(!origin){
            agent.add('Please define origin of the train')
        }
        else if(!destination){
            agent.context.set('origin', 5, {'origin' : `${origin}`});
            agent.add('Please define destination of the train')
        }
        else{
            agent.context.set('destination', 5, {'destination' : `${destination}`});
            console.log('reached')
            agent.setFollowupEvent('destination')
            agent.end("");
        }

    }

    function Destination(agent){
        agent.setFollowupEvent('both')
        agent.end("");
    }
    function changeDate(agent){
        agent.setFollowupEvent('both')
        agent.end("");
    }
    function changeDestination(agent){
        console.log("In Change destination")
        agent.setFollowupEvent('destination')
        agent.end("");
    }
    function startOver(agent){
        agent.setFollowupEvent('welcome')
        agent.end("");
    }

    function rentCar(agent){
        console.log("under rent")
        const endDate = new Date();
        const startDate = agent.parameters.oldTime;
        const currDate = new Date(startDate)
        console.log(endDate)
        console.log(currDate)
        const timeDiffMs = endDate - currDate;
        const timeDiffSec = timeDiffMs / 1000;


        if (timeDiffSec < 20) {
            const payload = {
    
                "google": {
            "richResponse": {
              "items": [
              { "simpleResponse": {
                      "textToSpeech": "Do you want to rent car at Destination?"
                    }
                  }
                ],
              "suggestions": [
                {
                  "title": "Yes"
                },
                {
                  "title": "No"
                }
              ]
            },
            "expectUserResponse": true
          }
               
              };
              agent.add(new Payload(agent.UNSPECIFIED, payload, {rawPayload: true, sendAsMessage: true}));
            
          } else {

             const payload = {
    
                "google": {
            "richResponse": {
              "items": [
              { "simpleResponse": {
                      "textToSpeech": "Please provide location for your car rental"
                    }
                  }
                ],
              "suggestions": [
                {
                  "title": "Mumbai"
                },
                {
                  "title": "Delhi"
                },
                {
                  "title": "Banglore"
                }
              ]
            },
            "expectUserResponse": true
          }
               
              };
              agent.add(new Payload(agent.UNSPECIFIED, payload, {rawPayload: true, sendAsMessage: true}));
            
          }
    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('payment', payment);
    intentMap.set('rent-car-availability', rentCar);
    intentMap.set('train-ticket', checkOrigDest);
    intentMap.set('train-ticket-destination', Destination);
    intentMap.set('tomorrow-changeDate', changeDate);
    intentMap.set('tomorrow-changeDestination', changeDestination);
    intentMap.set('tomorrow-startOver', startOver);
    // intentMap.set('Default Fallback Intent', fallback);
    agent.handleRequest(intentMap);


}