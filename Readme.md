# ASU Achievement App

This is the all-new redesigned from the ground-up Arizona State University mobile app based on the React-Native framework.

## Resources
Jira Project : https://asudev.jira.com/secure/RapidBoard.jspa?rapidView=1460&view=detail
Mockups: https://projects.invisionapp.com/share/3U6LEF14Y#/screens

## Getting Started

To run and develop the app, you need to have the following modules installed (version numbers given are example of what works). If you don't have React-Native installed, you can install it via the command:

```
sudo npm install -g react-native-cli
```

* Node (6.10.3)
* Npm (3.10.10)
* React-Native (2.0.1)
* React-Native-cli (0.50.4)
* Watchman (4.7.0)
* Enzyme

## Running App

To initially setup the app and download the node dependencies, run inside the folder after cloning:
```
npm install
```
To run on Android, first pre-start an emulator from Android Studio, then run the following command:
```
react-native run-android
```

To run on iOS, the emulator will launch automatically by running the command:
```
react-native run-ios
```

## App Architecture

The app consists of three type of pieces of the React-Native app:

* Components : Reusable pieces of functionality that can be imported into other components
* Services : Self-contained module that contains logic and does not render any content and will be used in components.
* Themes : Styling that can be used throughout the entire app and imported into components.

### Components

#### Universal

Universal Components are independent of data and are meant to be reused inside of Functional Components. These components should comprise of everything that can be reused in other components. Currently, the project consists of the following Universal Components:

* Calendar - *Contains different daily, weekly, monthly views of time-sensitive data*
* Detail - *Single view of a news, event, or map item that shows detail of a single item chosen from a list*
* Form - *All the various elements used in a form to be used to create forms*
* Gallery - *Images shown in form of a gallery with images and description text*
* List - *Used in components requiring displaying data in a list form with title, image, and description*
* Map - *Map rendering from full-screen map to selective display of portion of a map *
* Status - *All the various loading elements including spinners, status bars, and status messages*
* Task - *A todo style list of tasks that need to be completed*

#### Functional

Functional Components used Universal Components to do the heavy lifting in terms of creating the template and then use Services to tie in data and complete the view needed.
Currently, the project consists of the following Functional Components:

* Advising - *List of student's advising committee members or department advisors with contact info*
* Authentication - *Login, Registration, Signout, and other views involved in the authentication process*
* Directory - *Display of the ASU Directory in various List, Gallery views and fully searchable*
* Eadvisor - *Connects to the eAdvisor database and pulls down specific On-Track data*
* Events - *Displays events from asuevents in List, Gallery, Search, and location-near views*
* Finance - *Shows financial data from MyASU including tuition and financial aid information*
* Maps - *Displays the full ASU map from CampusBird along with points of interest such as Classes*
* News - *Shows latest news from asunews in List, Gallery, Search and favorited items*
* Notifications - *Displays list of latest push notifications as well as notification streams from MyASU*
* Schedule - *Displays list of Student's classes in List, Map view along with Checkin ability*
* Transportation - *Shows the latest timings of bus routes in List, Map, location-near views*

### Services

#### Authentication

Handles all authentication related functionality from logging user in, authorization, maintaining and terminating session.

#### Api

Handles securely signing requests via sigv4 signing utilizing the AWS Amplify module and making secure requests to the AWS backend and returning properly formatted data as requested by components

#### User

Maintains user-session data that is needed throughout the different components such as username, personal information, and any session-specific data

### Theme

There will be one main theme used throughout the entire app (ASU Theme) and third-party themes can be imported as necessary into the theme folder.

## Testing

The unit-test framework to be used in testing all components will be Jest and Enzyme. Each component will have a test file associated with it in a __ tests __ folder and every aspect of the component should have a corresponding test. Jest can be used to mock data that would be expected to come from Apis. More information how Jest & Enzyme can be used in testing can be found at: https://medium.com/wehkamp-techblog/unit-testing-your-react-application-with-jest-and-enzyme-81c5545cee45

 To run tests, you can simply run:
```
npm test
```
## Deployment

Each developer should create feature branches for each feature they are working on. Only after they have written and tested the feature branch with a corresponding test that successfully passes should it be merged into the Dev branch upstream. Subsequently, once a series of commits in Dev are ready for testing, Dev can be migrated to Test branch which will initiate a Integration test that will run Appium tests on AWS Device Farm. Once those tests successfully pass, the merges will be approved to be merged into Test. The QA team will then manually run user tests on the Test branch, once approved it can be ready for migration into Prod. After the build is deployed into Prod, once the app has been submitted and is Live in the app stores, it can be pushed into the Live branch.

```
Feature-Branch => {Jest & Enzyme Test} => Dev Branch => {Appium Test on Device Farm} => Test Branch => {QA Testing} => Prod Branch => {Push to Stores} => Live Branch
```

## Linking

If additional steps are required to get plugins working beyond "npm install __something__" we can track that here for reference.


Android works fine. iOS requres extra steps, despite documentation.

https://github.com/mapbox/react-native-mapbox-gl/blob/master/ios/install.md
