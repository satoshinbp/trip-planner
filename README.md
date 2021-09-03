<h1 align="center">Trip Planner</h1>

<p align="center">
  <a href="https://trip-planner-hazel.vercel.app/" target="_blank">Trip Planner</a> is a web application to help travelers plan their trip
</p>

<br>

<p align="center">
  <img width="49%" alt="sign in" src="https://user-images.githubusercontent.com/50537610/132024868-ed73c070-d08e-4e8a-b5a8-53716419e101.png"> <img width="49%" alt="dashboard" src="https://user-images.githubusercontent.com/50537610/132024431-655d0037-70f8-4978-8b9a-016171466d08.png">
  <img width="49%" alt="itenerary" src="https://user-images.githubusercontent.com/50537610/132031143-4b604806-bd8c-469d-a14a-cd54ed285eef.png">
<img width="49%" alt="add event" src="https://user-images.githubusercontent.com/50537610/132024400-fc78e60c-4db2-42d3-8491-3972fdaf9e66.png">
</p>

## Why I created this app

Trip Planner is created to improve my React developing skill.
Although this is my first React app, codes are clean and well structured, which makes the app sustainable.
To focus on development, design is kept simple using Material-UI.

## Problem to Tackle

Map is an important tool for traveling, and Google Map is the most popular map application in 2021. Although there are several existing trip planning apps, only few are implementing Google Map, and those have unfriendly UI/UX design.

## Our Solution: Trip Planner

Trip Planner has common features of trip planning apps with:

1. Simple and intuitive UI/UX design, using Material-UI
2. Google Map, using Google Map APIs 

## System Architecture

### Front-End

Front-end is developed by using React and Next.js.
Next.js has a file-system based router built on the concept of pages, which improves development experience.

### Authenitication

To use Trip Planner, authentication is required so that each user can manage thier own trip iteneraries.
Email-Password and Google authintication are provided by Firebase.
Users can also login as a guest user to test basic features of Trip Planner, but they can not save their own iteneraries.

### Database

Cloud Firestore is used to store user iteneraries, which is a NoSQL, document-oriented database provided by Firebase.

```
users/
    {user1}/
        trips/
            {trip1}/
                title: "Business Trip"
                location: "Nanaimo"
                startDate: May 21, 2021 at 0:00:00 AM UTC-8
                endDate: May 25, 2021 at 0:00:00 AM UTC-8
                events/
                    {event1}/
                        category: "transportation",
                        startTime: May 21, 2021 at 8:00:00 AM UTC-8
                        endTime: May 21, 2021 at 10:00:00 AM UTC-8
                        note: ""
                        ...
                    {event2}/
                        ...
                    ...
            {trip2}/
                ...
            ...
    {user2}/
        ...
    ...
```

### Styling

All stylings are accomplished by using Material-UI and all icons are from Material Icons provided by Material-UI, which makes the overall design of Trip Planner so simple and sustainable.

### Hosting

Trip Planner is hosted in Vercel, who is the owner of Next.js.
Choosing their hosting service is the best practice to host Next.js apps.

## API Reference

1. [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview)
2. [Places API](https://developers.google.com/maps/documentation/places/web-service/overview)
3. [Geocoding API](https://developers.google.com/maps/documentation/geocoding/overview)

## License

The source code is licensed MIT. The website content is licensed CC BY 4.0,see LICENSE.
