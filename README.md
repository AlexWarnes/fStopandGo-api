# f/StopandGo API
_The photographer's notepad._

Try the app [here](https://fstopandgo.herokuapp.com)!

## What is f/StopandGo?
_To view the frontend code and documentation, please visit the [f/StopandGo client repo](https://github.com/AlexWarnes/fStopandGo)._

---



# API Documentation
The **_f/StopandGo_** API uses JSON Web Token (JWT) protected endpoints for CRUD functions on users and photoshoots. The API calls will return requested data in JSON format.



## Endpoints

`https://fstopandgo-api.herokuapp.com/` + any of the following URL paths and associated HTTP requests:

**Create User**
`/api/users` 
* POST

**Read, Update, Delete Specified User**
`/api/users/:userID` 
* GET (JWT protected)
* PUT (JWT protected)
* DEL (JWT protected)

**Create Photoshoot**
`/api/shoots` 
* POST (JWT protected)

**Read All Photoshoots by Specified Owner**
`/api/shoots?owner=[userID]` 
* GET (JWT protected)
* _Requires `Owner` Query Param_

**Read, Update, Delete Specified Photoshoots**
`/api/shoots/:shootID` 
* GET (JWT protected)
* PUT (JWT protected)
* DEL (JWT protected)

**Create JWT**
`/auth/login`
* POST

**Refresh JWT**
`/auth/refresh`
* POST (JWT protected)

**Utility Endpoint to Check Server Status**
`/api/status` 
* The Heroku server will lag if asleep. The client can fetch from this endpoint on as needed to check the server status or start waking up the server before the user tries to login/signup.



## Models

**Example User Data**
**_Note:_** _User data is serialized and (encrypted) passwords are removed from API responses._

```javascript
{
  "_id" : ObjectId("5bba78760ca7106446d5b43c"),
  "username" : "testUser1",
  "password" : "$2a$10$fLM3/.d6wTXXqfeEsK2Rneih1.ry8w7jSfz.BdumThM/sjlVdumPTy",
  "email" : "testUser1@fstopandgo.com",
  "createdAt" : ISODate("2018-10-07T21:19:50.628Z"),
  "updatedAt" : ISODate("2018-10-07T21:19:50.628Z"),
}
```

**Example User Data**
**_Note:_** _User data is serialized and (encrypted) passwords are removed from API responses._

```javascript
{
  "_id" : ObjectId("5b9ec0df2d31d11e08152e64"),
  "gearList" : [ 
      "Tripod", 
      "50mm lens", 
      "reflector"
  ],
  "title" : "Portraits in the City",
  "owner" : "5b9ec07e2d31d11e08152e63",
  "location" : "The City",
  "description" : "Quis ducimus non commodi. Voluptatem laudantium suscipit ratione vel quibusdam. Quam occaecati velit modi quis voluptate eum consectetur dolores. Nobis quasi incidunt laborum quae animi molestiae.",
  "createdAt" : ISODate("2018-09-16T20:45:19.287Z"),
  "updatedAt" : ISODate("2018-09-17T02:45:44.978Z"),
}
```

## Feedback?
I would love to hear what you think! Shoot me a message through GitHub or email through my personal site with feedback, new ideas, or anything else you'd like to share. 

- A