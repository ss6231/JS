</b>Description of project:</b>

As a picky foodie, I often face the difficulty of finding restaurants that are close by, within my budget, and that actually serve good food without opening up a million tabs on Yelp and Google maps. Sometimes, it’s just easier to either pick from a curated list of restaurants or if I’m feeling spontaneous, just be given one randomly - both of these aforementioned situations would of course provide dining options that are catered to my specifications, such as location, cuisine, price, rating, etc. That’s why I thought of “What the Hell Should I Eat” as my final project. It takes the hassle out of picking a restaurant by providing options that are based on the user's specifications and displaying information all in one place. 

<b>Requirements:</b>

For now, the most important schema will be the Restaurant schema, which will store name, location, cuisine, rating, and price as potential traits for each entry in the database. This will house information for each restaurant that will be read and scraped from the web. 
Additionally, I’m implementing the option of having users create accounts on the app so that restaurants can be saved for later reference. Perhaps this collection will store User schemas whose documents will include information such as Restaurant schema(s) (note: this user to restaurant relationship will be one to many) and object ID, which is already supplied by mongoDB.

<b>Wireframe</b>
![Wireframe](https://github.com/nyu-csci-ua-0480-002-fall-2015/ss6231-final-project/blob/master/wireframe.jpg)

<b>User stories:</b>
- As a user, I want to choose a place to eat without the hassle of using several different web applications
- As a user, I want to choose a place to eat nearby that is tailored to my specifications
- As a user, I want to be given a place to eat (based on my specifications)

<b>Site Template</b>
![Site Template](https://github.com/nyu-csci-ua-0480-002-fall-2015/ss6231-final-project/blob/master/template.png)

<b>Modules/concepts:</b>

Request
- Provides methods to download data and web pages from the Internet with HTTP directly into memory. Also gives single unified interface for making requests
- This will be used to actually download the restaurant info stored on the Seamless, Yelp, or MenuPages site so that I can easily store in my database

Cheerio
- Allows users to work with downloaded web data using same syntax as jQuery. Because its designed specifically for the server, it’s a fast and lean implementation of jQuery
- Using Cheerio will allow the user to focus on the data that was directly downloaded as opposed to parsing it
- Will be used to traverse DOM & extract restaurant info I will need to save into the database

Gmaps & Google Maps API
- I wanted to display a map with a drop pin of the restaurant that results from the user query – this will be powered by the Google Maps API
- Gmaps is a JS library that simplifies the API by removing extensive documentation and large amounts of code
- Gmaps includes support for markers and geolocation, which is exactly what I’ll be using
- The only set up is to add a reference to the API and to add gmaps.js into the HTML

<b>Research Topics:</b>
- User authentication - 3 points
- Factual API - 2 points
- Google Maps API - 2 points
- Bootstrap - 1 point

</b>**Note:**</b>
- I do not implement any validation as stated in the requirements for this project because my app does not require it.
