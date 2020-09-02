# Survey System Overview

The Survey feature is a little dated, since it was built before the team had knowledge of how to properly configure admin-level queries/mutations/subscriptions.

As such, surveys are currently deployed direct to dynamodb from an admin lambda and picked up by clients with a JS interval from the mobile app.

While a single interval should probably run in-app to account for any broken sockets, the survey solution should still leverage subscriptions properly.

## Client App

There are two types of surveys in the app, although one is basically deprecated at this point.

1. Survey.js
	- Deprecated first-pass at surveys. This approach checks for surveys in the asumobileapp_surveys table. Any user can access and answer them so long as they are authenticated 
	- rate limited
	- opt out enabled
2. Engagements
	- This folder includes an EngagementSurveys.js file that checks against an admin_engagements attribute within the asumobileapp_users table for surveys or other types of "engagements".
	- This is a good spot for new user-specific features
	- Provides granular survey release
	- NO RATE LIMITING
	- NO OPT OUT

### Engagements

Over the course of some interval, the client app checks to see whether the user has any admin_engagements in their record of the ama_users table.

If so: 

1. It will run through that list for any surveys, clearing the engagements in the process
2. Check to see if those surveys have already been completed
3. Run any surveys that haven't been completed
4. Collect user answers

> Please see **Engagements/EngagementSurvey.js**

## Admin Management

A good interface to create and release surveys has not been constructed. This section will cover the creation and deployment of surveys to users.

### Creation of Surveys

Everything is done from the DynamoDB interface

1. Visit the DDB **asumobileapp_survey_stage** table
2. Copy an existing survey, iterating the id to be higher than the highest currently in the table.
	- This is necessary to prevent users from being unable to see the survey if it has been previously answered
3. Update the question, options, and timestamp to reflect what should be on the survey and the current time.
	- Note that the survey space is limited & only allows for radios right now.

That's it. Your survey should now be properly staged.

### Releasing surveys

Since the original "surveys-for-all" approach has been unused and unmaintained, I will cover the granular release process inside of the lambda function **asumobileapp_survey_release**

There are three types of releases

1. granularRelease - given a list of asurites
	- Create a test event for reuse and utilize the following payload
```
 {
  "body-json": {
    "type": "granularRelease",
    "survey_id": <ID of Survey being released>,
    "asurites": [Array of ASURITES],
    "expire": <ms timestamp after which surveys should not show>
  }
}
```

ex to Jared
```
{
  "body-json": {
    "type": "granularRelease",
    "survey_id": 23,
    "asurites": [
      "jrounsav"
    ],
    "expire": 1761468608149
  }
}
```

2. geofenceRelease - given a geofence code
	- Create a test event for reuse and utilize the following payload
```
{
  "body-json": {
    "type": "geofenceRelease",
    "survey_id": <ID of Survey being released>,
    "geofence": <ID of geofence to send survey to>,
    "expire": <ms timestamp after which surveys should not show>
  }
}
```

ex for stadium
```
{
  "body-json": {
    "type": "geofenceRelease",
    "survey_id": 7,
    "geofence": "63013",
    "expire": 1641468608149
  }
}
```

3. latLonRelease - given some latitude/longitude and a radius.
4. 	- Create a test event for reuse and utilize the following payload
```
{
  "body-json": {
    "type": "latlonRelease",
    "survey_id": <ID of Survey being released>,
    "lat": <Latitude(String)>,
    "lon": <Longitude(String)>,
    "rad": <Radius(String)>,
    "expire": <ms timestamp after which surveys should not show>
  }
}
```
ex.

```
{
  "body-json": {
    "type": "latlonRelease",
    "survey_id": 20,
    "lat": "33.426444",
    "lon": "-111.932552",
    "rad": "0.25",
    "expire": 1641468608149
  }
}
```
