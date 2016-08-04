# mobile webapp prototype

Tech
* React
* Redux
* react-router
* AWS DynamoDB

## caveats

To the best of my knowledge, the mobile webapp fulfills all the requirements of the prototype, as per the instruction guide.

That said, it's still a prototype, and does have some quirks; namely that if you refresh the page while on a device detail page (any screen with controls on it), the app will freeze, because I'm not using a server or any kind of redirects for the prototype, and when you reload, the page is looking for data that was loaded on the home page.  Similarly, there isn't really any error handling, outside of just logging 'ERROR!' in the console when something blows up.  