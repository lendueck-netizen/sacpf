SACPF ONLINE  (two-device play)
===============================
This folder is the game plus a tiny "relay" program. When it is running on the internet, two people
can each open the same link on their own device and play one game against each other.

You need 3 files in your GitHub repository:   index.html    server.js    package.json
(index.html is the game itself. The other two are the relay.)

PART 1 - PUT THE FILES ON GITHUB  (about 5 minutes)
  1. Go to github.com and sign up for a free account (or sign in).
  2. Click the "+" at the top right, then "New repository".
  3. Name it  sacpf  (any name is fine). Leave everything else as it is and click "Create repository".
  4. On the next page click the link "uploading an existing file".
  5. Drag the 3 files (index.html, server.js, package.json) into the box. Do NOT drag the folder itself.
  6. Scroll down and click "Commit changes".

PART 2 - START IT ON RENDER  (about 10 minutes)
  1. Go to render.com and sign up using "GitHub" (this links the two accounts).
  2. Click "New +" and choose "Web Service".
  3. Pick your  sacpf  repository. If it is not listed, click the option to configure GitHub access
     and allow Render to see that repository.
  4. Fill in the settings (names may be slightly different on screen):
        Name:             sacpf   (this becomes part of your web address)
        Language:         Node
        Build Command:    npm install
        Start Command:    npm start
        Instance Type:    Free
  5. Click "Create Web Service" and wait. The first build takes a few minutes. When the log says
     "SACPF online listening", it is running.
  6. Your game address is shown at the top of the page, something like  https://sacpf.onrender.com
     Open it. You should see the game with a new "Play on two devices" box on the first screen.

PLAYING
  - Host: open the address, click "Host a game". A 5-letter code appears at the top. Choose the two
    teams and click Start game. The host plays the FIRST team in the list; the friend plays the second.
  - Friend: open the same address, type the code, click "Join a game".
  - Each player sets their own lineup. Either of you can press "Start game" (or "Back to the game")
    once both lineups are ready. After that, the screen tells you whose turn it is.
  - The defence's setting is hidden from the offence until the play is made.
  - If a device loses its connection it reconnects by itself. If the host refreshes the page the game
    comes back where it was. "Save game" still works as a backup.

GOOD TO KNOW
  - Free Render services go to sleep after 15 minutes with nobody using them. The first visit after
    that takes about a minute to wake up. Open the link a minute or two before you want to play.
  - Render gives a free allowance of running hours each month. A few friends playing is far below it.
  - The relay keeps no game data. The host's browser holds the game, so keep the host's tab open.
  - Anyone who knows a game code can join that game, so share it only with your friend.

UPDATING THE GAME LATER
  Replace index.html in your GitHub repository (open the file, use the pencil/upload option, commit).
  Render notices and redeploys on its own.
