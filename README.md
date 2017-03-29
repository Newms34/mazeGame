# Dave's Maze Game.
![Screenie](/public/img/demo.jpg?raw=true)

## Contents:
 * [About](#About)
 * [Currently Under Development](#currently-under-development)
 * [How You Can Help](#how-you-can-help)
 * [License](#license)
 * [Credits](#credits)

## About:
Dave's Maze Game (I'll probably change that title later) is a dungeon crawler game written in MEAN stack JavaScript. It's an exploration of 1st-person 3D in the browser, as well as (eventually!) some simple AI concepts. The technologies involved are as follows:
 - **AngularJS 1.x** for awesome front-end stuffs
 - **MongoDB** for storing all your epic adventures
 - **Mongoose** for saying "hi!" to mongodb
 - **ExpressJS** for servers
 - **NodeJS** for JavaScript on the back-end
 - **SocketIO** for mobile integration (still in development!). This allows you to to use your phone as a controller.
 - **CSS3** Because CSS can do 3D, and CSS really isn't that bad, so stop whining.
 - **A Heck of a Lot of NPM/Bower Modules** Because if someone else has already done it, why rewrite it?

 *WARNING*: Dave's Maze Game works best in Google Chrome!

## Currently Under Development:
 - I'm always adding more stuff like loot, monsters, skills, etc.
 - More voting system refinements. Right now, skill voting should *not* work. The votes will go through, but after 7 days, 'winning' votes will not be pushed to the database. This has to do with how the skills are numbered internally, and should be fixed in a subsequent patch.
 - A storyline!

## How You Can Help:
Writing this app takes a lot of time and love. 
 - The previous method of including player-submitted content (which was, frankly, pretty ambiguous...) has been replaced/upgraded with a voting system! 

 	1. Log in.
 	2. Go to `/votes`.
 	3. Submit a weapon, armor, or skill to be voted on!
 	4. Vote on other peoples' submissions!
 	5. Votes are totalled 7 days (1 week) after the item's first submitted. If a submission has more than 2 votes, and has a score of 3/5 (60%) or greater, it's automatically included!

 - I'm also pretty bad at the whole art thing. Right now, I'm using other people's glorious art as 'placeholders'. However, if you feel like contributing something, feel free.

   - On the other hand, if some of this art's yours, and you'd rather I *not* use it, lemme know, and I'll take it down.

## License:
 Eh, do whatever you want. Seriously. I give you permsission.

## Credits:
 This app was designed and coded by yours truly, [David Newman](https://github.com/Newms34)