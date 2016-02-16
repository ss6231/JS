NOTE:

- All the modules needed for the program are located in node_modules folder within the submission

TO RUN, type in:

- node pScore.js
From here, the program will prompt you to type in a business's name and its address. Try to avoid suite, building, and floor numbers in order to get an accurate p score.
- The program will display a message and exit if there are errors in spelling or format

HOW IT WORKS:

- I decided to use the Yelp Search API and Google Places API. I wanted to use LinkedIn instead of the latter, but they recently restricted their public data accessibility, so I went with that instead
- An overview of the program:
	- I use the 2 aforementioned APIs to extract the rating and number of reviews on the input business 
	- I understand that the business may have a greater presence in one API than the other, so I calcuate a weighted score of the input for each API. For example, if company X has 2 stars with 5 reviews on Yelp, but 4 stars and 100 reviews on Google Places, the weighted score will take into consideration the greater rating (because of more reviews) from the latter API, as opposed to perhaps simply taking the average of the two ratings
	- If for any reason the business only exists on one API, the program will continue on with this sole information. Additionally, if there is no online presence at all of the input, the p score is automatically 0 and this finding is printed out to the user, so that he or she may want to look elsewhere for more information
-Flow of control:
	- I initially call on the Google Places API on the input address and business name to retrieve its coordinates, and from this, I make another request to get the business's place ID. Finally, I use this last piece of data to retrieve the ratings and number of reviews and return it to the main function
	- Afterwards, I call on the Yelp API, which only needs the name and address of the business. A list of matching companies are returned and the program searches through it to find the desired one (if there is no match, then the program will continue with the information retrieve from the other API). Again, the ratings and number of reviews is returned
	- Then, the p score is calculated from the two extracted pieces of information by creating a weighted score and then a raw score, which falls within a scale from 1-5. Each number in this range maps to a p score from 0-1, which is finally returned to the user

SAMPLE DATA:
1) name: Shake Shack
2) address: 691 8th Ave, New York, NY 10036
- p = .80

1) name: a business
2) address: 1234 a street, some city, ny 12345
- The entered address is not valid. Please try again"

1) name: citibank
2) address: 200 varick street new york ny 10014
- "The business does not have any online presence on the set up APIs"
- p = 0.00

