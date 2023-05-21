#CORE

an expressjs app
+ no inital route

#SECTION1

routes needed:

/chat?chat_id=xxx&q=
to answer questions with this api :
save conversations in json file : /chats/[chat_id].json (create file or directory if not exists with [] content )
note: (save ai and user messages)
and when there is new request mix messages with old saved messages
+ each request message should saved in that json file , so when there is new conversation it should continue from old messages ofthat chat_id

response should like:
{
    'message':"..."
}


sample api curl:
curl https://api.cattto.repl.co/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer catto_key_YWYTDkpnOpYK9CqpqOa9jm1g" \
  -d '{
     "model": "gpt-3.5-turbo",
     "messages": [{"role": "user", "content": "Say this is a test!"}],
     "temperature": 0.7
   }'

ai api response interface is like this if 200:

{
    choices:[
        {
            "message":{
                "content":"test",
                "role":"user or assistant"
            }
        }
    ]
}

+ make another api /chat_msgs?chat_id=xxx 
read from /chats/[chat_id].json in this format:
[
    {
      "role": "user",
      "content": "who r u"
    },
]
note:
- dont use old or depracted package