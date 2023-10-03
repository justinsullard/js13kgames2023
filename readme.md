

# 13 Drums

A [js13kgames](https://js13kgames.com) 2023 entry. Explore the Americas in the 13th Century, gathering resources and learning skills, and collect all 13 Drums.

This game is best experienced with sound, so good headphones or speakers are recommended.

## Controls

### Keyboard

* `w`, `a`, `s`, `d`: Movement
* `shift`: Hold down to run
* `esc`: Pause/Resume
* `i`: Toggle Debug (not in the final build)

### Mouse

* `move`/`hover`: Move the cursor to select elements
* `click`: Interact where available

## Entities

1. **Person**: Interacting with a **Person** will give them any items from your **Inventory**: that they need - Once all needs are met will immediately join the **Drum** circle at the **Fire**, and henceforth nightly after each **Moon** rise.
2. **Shell**: Worn by **Player** - Holds the **Drums** that the **Player** has collected. Each **Drum** will subsequently be added to the music as the **Player** explores the **World**.
3. **Fire**: Once each **Person** in the **Village** is ready the **Drum** will become available for the **Player** to claim - ~~Once the Drum is claimed can be used to clear **Inventory**~~
4. **Teepee**: *No interaction* -Each **Village** contains 3 **Teepees**, 1 for each **Person**
5. **Grass**: Can be collected - Needed for some **Drums**
6. **Rock**: Can be collected - Needed for some **Drums**
7. **Bush**: Can be collected for **Sticks** - Needed for some **Drums**
8. **Tree**: Can be collected for **Wood** - Requires **Hatchet Drum** - Needed for some **Drums**
9. **Flower**: Can be collected - There is 1 **Flower** for every phase of the **Moon**, blooming on it's associated evening in it's associated **Area**.
10. **Deer**: Can be hunted - Requires **Bow Drum** *(See **BUG #1** below)*
11. **Bison**: Can be hunted - Requires **Spear Drum**
12. **Area**:

## Drums

There are **13 Drums** spread throughout the **World**, one in each of the **Villages** you will encounter. Each **Drum** unlocks a new ability, assisting the **Player** in their journey, and adding to the music. These **Drums** are acquired by satisfying the needs of each **Person** in the **Village**.

1. **Village Drum** - Enables 1 **Inventory** - Interact with each **Person**, no resource requirements.
2. **Basket Drum** - Enables 3 **Inventory** - 3 **Grass**
3. **Corn Drum** - ~~Enables **Planting**~~ - 3 **Ears** of **Corn**
4. **Hatchet Drum** - Enables **Wood** collection - 1 **Stick**, 1 **Grass**, 1 **Rock**
5. **Bow Drum** - Enables **Deer** hunting - 2 **Stick**, 1 **Stone** - *(See **BUG #1** below)*
6. **Spear Drum** - Enables **Bison** hunting - 2 **Wood**, 1 **Stone**
7. **Deer Drum** - *No skills enabled* - 3 **Deer** *(See **BUG #1** and **BUG #2** below)*
8. **Bison Drum** - ~~Enables **Teepee**~~ - 3 **Bison**
9. **Teepee Drum** - ~~Enables **Building**~~ - 1 **Deer**, 1 **Bison**, 1 **Wood**
10. **Sun Drum** - *No skills enabled* -1 **Stick**, 1 **Grass**, 1 **Flower** - *(See **BUG #4** and **BUG #6** below)*
11. **Dream Catcher Drum** - Enables basic **Save** functionality - *(See **BUG #6** below)*
12. **Moon Drum** - *No skills enabled* - 3 **Flowers** - *(See **BUG #6** below)*
13. **Shell Drum** - Enables **World** creation - Acquire 12 other **Drums** and interact with each **Person** in the village

## Known Bugs

* [ ] **Bug #0**: Movement and collision detection are not the fluid movement they were intended to be as the force/physics system desired would have been too much code as initially implemented, and tangential forces are not applied to improve collisions and constrain users to the bounds of the **Areas**.
* [ ] **BUG #1**: **Deer** hunting requires a **Spear** instead of a **Bow** as intended
* [ ] **BUG #2**: **Animals** do not despawn upon death or respawn upon the **Sun** rising as intended, causing "traffic jams" and also allowing the **Player** to repeatedly click to acquire another of that **Animal** in their **Inventory**
* [ ] **BUG #3**: **Fire** does not empty **Inventory** after its **Drum** has been acquired as intended. This could lead to a state where the **Player** cannot acquire further **Drums**
* [ ] **BUG #4**: The **Sun Drum** needs also are appended with the **Moon Drum** needs, which in practice means **World(13)** needs 3 **Flowers** and a statistical distribution of ~2 **Flowers** across all possible **Worlds**
* [ ] **BUG #5**: The **Shell** does not render each **Drum**, instead using the development placeholder
* [ ] **BUG #6**: The **Flowers** needed for **Drums** should be bloomed.
* [ ] **BUG #7**: The final "*Congratulations!*" message overlaps with the pause screen instructions.

## Features that had to be cut due to time (and maybe size)

* **Mountain**, **Desert**, **Steppe**, **River**, **Lake**, **Coast**, **Tundra**, **Forest**, and **Plains** regions were originally intended, with simple 3D landscape elements present in the inaccessible regions of **World** (rendered as simple polygons with their points projected from 3D space to the screen but not truly 3D). They got dropped mostly due to time constraints, but also because of performance reasons in sorting entities across larger landscape elements. This also included some **Cloud** landscape that would be cleared away to access the final **Village**.
* **Camera Hints**: The introduction to various mechanics had originally been intend to be introduced through little cut-scene like camera hints, or simply having the camera focus momentarily on a point of interest, such as briefly focus on the first **Person** the **Player** approaches or the first **Drum** that is unlocked.
* **Animations**: There are a  number of **Animations** which were intended for every interaction, including the growth of plants, the collection of items, the use of the **Bow** and **Spear**, variations to the **Person** idle animation during the evening **Drum Circle**, galloping and/or leaping animation for the animals, **Planting** of crops, rowing the **Boat** (and the boat itself), and clearing the **Clouds** surrounding the final **Village**.
* **Squash**, **Beans**, **Sage**, **Moss**, **Fungi**, **Aspen**, **Oak**, and **Redwood** were all a variety of plants originally intended to be included.
* **Planting**: The **Corn Drum** had been intended to be gained by gathering **Corn**, **Squash**, and **Beans**, and one of the unused **Fields** was to be a garden for the **Player** to plant in.
* **Boat Drum**: The initial intention was to have the 3 **Villages** in the center of the **World** inaccessible until the **Boat Drum** was acquired, allowing travel in the **Water** This was removed because of time constraints, as the intention was for the **Player** to be in a **Boat** which rendered directionally, as well as an adjustment to the **Player** animation when in the **Boat** to have them "rowing".
* **Medicine Drum**: A combination of **Sage**, **Moss**, and **Fungi** growing throughout the **World** would unlock this **Drum**. Consideration had also been made to have **Aspen** trees instead of, or in addition to, **Moss** or **Fungi**.
* **Building**: A variety of different housing and structural styles found across the Americas were originally part of the plan (5 in total), including most especially the St. Louise area mound settlements, which at the time were amongst the largest metropolitan areas in all of the world. It had been intended for the mounds to be the 13th **Village**, where the **Shell Drum** would be acquired, which would then unlock the final **Player** ability...
* **Saving**: Originally it was intended that **Saving** and **Loading** of the default **World(13)** as the player progressed would be active and automatic during significant events, with the user able to **Pause** and **Save** manually at any time. Once the **Player** had acquired the **Shell Drum** a new initial **World** would be created which contained only a single area, surrounded by the **Shells** (**Worlds**) that the **Player** had created, as well as a new "perpetually blank" **Shell** that would **Create** and **Load** a new **World** (based on current time-stamp, or integer value provided by **Player**).
* **Music**: There is a lot of variation in the music at present, with a static heartbeat drum, the **World** and each **Village** containing a separate soundtrack of 13 **Drums**, and the **World** and each **Area** containing their own melody, but there were further variations intended originally. Each area was intended to have 2 variations, 1 while the Sun was up and 1 while the Moon was up, with a shift from C Major to A Minor present between the two (same scale, different root). There was also the hope of working through an improvisational accompaniment that used the player movement and the various melodies encountered to weave together additional melodic and harmonic additions to the music, but there simply wasn't time (or probably space).

---

## Dev Log

* Ideation
* Utilities
* Initial rendering engine
* Initial game loop
* Day night cycle
* Sound
* Player and quadruped animation
* Player controls
* Build system
* Code cleanup
* Git integration

### 2023-08-13

Driving home 13 hours from Michigan and pondering on the idea it seemed likely that most entries would be Eurocentric (*I was pleasantly surprised at the number of Mongolian themed games that were submitted*). Opting for a different approach I pretty quickly decided to set my game in the Americas. The real challenge would be to come up the core mechanics. I knew I wanted something casual that a younger audience could potentially enjoy, and that I wanted to incorporate music, and it didn't take long to land on the idea of drums or flutes and a journey to collect them.

The idea of using a turtle shell came fairly quickly as well, as the lunar calendar found on the turtle shell (13 months of 28 days) is a common theme amongst indigenous American cultures, and it fits with the whole js13kgames theme. At that point I had a name, and the core mechanic to progress through the game, 13 Drums to be collected.

### 2023-08-14

I dug deep into the couple of books I had on early American culture and history, and found another to add to the collection, as well as researched online, just fishing for ideas on what to include. I also spend some time perusing YouTube hunting for inspiration amongst the "cozy game" genre, looking for the various mechanics and concepts available to help guide players through mechanics without words as much as possible. Ideally I didn't want to have to have a tutorial or much explanation of the controls and mechanics of the game.

### 2023-08-15

Initial utilities and decisions on possible game mechanics.

At this point I finally sat down to start playing around with code. I knew I wanted to take a very loose approach to the development of this and allow my inner child the freedom to just play around with the code without anything too serious in mind (I've been a professional developer for 25 years now, primarily contracting in a number of verticals working on enterprise software, and all of the constraints, controls, and necessities needed). That meant going old-school in my approach (with some new-school tools, of course, as I'm not going back to writing code in Notepad).

I have used an approach for rapid prototyping through my web-development projects that involved writing a single, self-contained html file, and that was where I was going to start for this as well.

The first bits of code I wrote were a few simple utilities. The initial intention was to have some sort of side-scrolling platformer, with parallax backgrounds and perhaps a couple of levels of *zoom* to add depth, so a few 2D vector methods and easing functions would suffice for most of the math (this would later be found to be incorrect). A random number generator, and a basic emitter would be handy as well to simplify a few things, and then we're set to start putting together a main game loop and seeing about getting something to render to the screen.

> I intended to lean into the emitter pattern more heavily but just ended up... not, for no particular reason. I hope to build out a little game engine for future use that is entirely event-driven and decoupled via the emitter.

### 2023-08-16

`MAKE` and some of the initial minimization techniques were explored to try and squash the size of the code down. While the final result could use some improvements it seemed to get the job done fairly well and left me with enough to explore. Unfortunately some of the other code had already been written and I never did circle back around to resolve those, so not everything ended up using the `MAKE` method that could have.

### 2023-08-21

Getting the basic walking animation for bipeds and quadrupeds was an important early step once the basic engine and utilities were in place. I spent a couple of hours working on this, using my dry erase board to map out the animation curves, then implementing the appropriate easing functions. Playing around with the animal types 

<img src="./devlog.walking.2023-08-21 21-53.gif">

The backdrop Day/Night cycle, with a little animation, should make for a simple bit of early "polish" and allows for experimenting with various animations.

> Sadly this was before I found the FPS settings in my GIF capture application, so these are only at 10fps.

<img src="./devlog.sunrise.2023-08-21 22-11.gif">

### 2023-08-27

Initial ideas for having a "round" world using non-Euclidean perspective, featuring some random walks from the Bison and some initial movement controls.

<img src="./devlog.walking.2023-08-27 21-36.gif">

### 2023-08-31

Trying out a different approach to project a 2D world map into the 2.5D perspective seems to produce a rather decent effect, and projecting on top of this appears to be effective

<img src="./devlog.world.movement.2023-08-31 17-49.gif">

### 
Adding in some trees and villagers to start populating the world.

<img src="./devlog.landscape.2023-09-02 23-57.gif">

### 2023-09-06

Added collection of Flowers and Wood from Trees, plus a basic inventory rendering. While not restricted to Drums, and without any limits on collection, the basic mechanics should provide most everything else needed for interactions (minus animations). One thing I have considered is what to do with items you might collect that are unnecessary. Some could be burned to the fire, but perhaps the villages or villagers should always accept items as a way to clear inventory and promote interaction.

<img src="devlog.collection.2023-09-06 20-45.gif">

### 2023-09-07

Put together a basic fire. This will be where drums are collected from, and may be adjusted slightly. The rendering efficiency of the generate sprites is proving quite effective.  It might be worth looking at a different strategy for the PERSON/DEER/BISON to still get variation but just reuse the same images instead of the same paths.

<img src="devlog.fire.2023-09-08 00-44.gif">

### 2023-09-09

Got the drum-circle scheduled for the villagers after working out a couple of bugs in the target-based tasks.

<img src="devlog.drumcircle.2023-09-09 20-34.gif">

### 2023-09-10

Got basic drum collection working, and while you can't see it the music switches between villages and the moon path, and collected drums add to the music (which really give a lot more dynamics to the sounds overall). Unfortunately the overall performance is starting to decline so a depth of field/fog effect is necessary. The initial pass is to simply cut off anything too far away and to use a small opacity shift to bring them into view. Adding a few layers of a low-res fog that gets upscaled on top of the back few layers should really sell it well, but hopefully not cover up the sky too much. It's those pesky tall trees that are the real concern.

<img src="devlog.collectdrums.2023-09-10 07-42.gif">

### 2023-09-11

Got Deer and Bison fields generating, with a basic routine for now, but still no interaction. Added rocks and their collection, and working on the remainder of the necessary sprites to get drums rendering.

Here we've got Deer and Rocks.

<img src="devlog.deerrocks.2023-09-11 22-46.gif">

And some Bison.

<img src="devlog.bisonfield.2023-09-11 22-48.gif">

### 2023-09-12

The last day of development. With 12 hours to go until the deadline it's time to get down to the last few entities and plugging in functionality.

First, let's get the **Teepee** going.

<img src="devlog.teepee.2023-09-12 19-27.gif">

Then we can add some corn (after fixing some build issues).

<img src="devlog.corn.2023-09-12 23-50.gif">

Getting drums rendering was a bit of a breeze at this point, but there were some normalizations that had to happen, the result of an incomplete shift in paradigms that can be address in the future.

At this point, with the deadline looming, the clock rolling over to a new date, and age taking hold, decisions were made to utilize the existing content rather than generating the remaining unrealized content mentioned above.

### 2023-09-13

Getting the basic drum functionality

## Final Submission

Screenshots, a submission form, and an homage to the originally intended save/randomly generated functionality.

@end3r gracious allowed a last minute bug fix that had missed the previous commit,  perhaps poetically 13 minutes (and a few seconds) after the official deadline.

> Sadly, this would not be the ONLY bug that existed in the final submission, as enumerated above.

```
86877 bytes raw
40438 bytes minified
36475 bytes tokenized
15469 bytes via roadroller
15747 bytes built
Built zip 12184/13312 bytes (91.5%)
```

## Post-Mortem

This was my first attempt at completing a video game. I've written a variety of simulations before for personal research, software development tooling, and just to play around and learn the latest on things I might need for work, and I've started a couple of games working with my kids (one of which I really do need to try to finish). When I learned about the js13kgames Jam I simply couldn't resist as it had been too long since I'd worked on a fun side project and I've had a fair amount of experience squeezing a lot out of very little javascript.

In retrospect I should have planned the project out more, but I am glad that I did take the time to explore like I did as the initial vision in my head was not as cool as what I ended up with. Next time (and I do plan on there being a next time) I will not be quite as explorative with the code and will break things up a bit more, as this "free time" stuff is hard to come by for me (another reason a month-long game jam was a perfect fit for me). One thing I will need to watch out for next time is to not spent too much time playing the game. I burned a lot of my time on this one just running around making music and experimenting with various portions of the look and feel of things.

As seems to be the case for a lot of game jam entries (based on blogs and vlogs and the like) I ran out of time, and poorly planning some of the more crucial features resulted in a submitted game that did not include everything I had intended that would have made traversal easier (the boat), camera hints to avoid people getting confused, and then a couple of bugs (**Bug #2** and **Bug #3**) that could potentially make things impossible to complete. My hope is that I can take the lessons I've learned from this jam and apply them next time.

All of the problems aside, this was a great experience and I really enjoyed it, and while it's not quite what I had in mind the final result was pretty decent all said and told. Better still, there were like 160+ other games (which I finally managed to get all played and voted on) that were awesome. I hope that everybody that submitted a game knows that they did a great job. 13kb is a small target to cram an entire video game into, and Javascript doesn't make it any easier (it's still my favorite language though).