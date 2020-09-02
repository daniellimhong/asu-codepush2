# Survey Feature ToDo

Per the Overview, things are a little uncouth at the moment. This file includes a few things that could be done to shore up the system.

1. Admin Dashboard for survey creation
	- Creating and releasing surveys is too manual and error prone. The whole process should be obfuscated and streamlined so that users who want to engage with students can easily create and release surveys, rather than relying on the maintaining developers to handle it. 
2. Prevent user spam for admin_engagements
	- If a user has 9 surveys stacked up in their users table, then they will have to do 9 surveys before being able to do anything else in the app. There is no opt-out, cancellation, or rate limit per stakeholder request. 
3. Update EngagementSurveys.js to allow for more options outside of 4 radios and a short message
	- The type of survey and space allotted to the survey modal is very limiting. A new solution for display needs to be determined.
4. Survey needs to be made accessible
	- This is partly a problem with the modal system, but there are issues for users whom require a11y systems to navigate the app. The whole process of showing and accessing those survey items needs to be revised to be less intrusive.
5. Surveys should utilize subscriptions.
	- Surveys aren't real-time at the moment and there are several JS intervals in the app. We should combine them to a single interval, and also allow apply subscriptions to the survey system.
