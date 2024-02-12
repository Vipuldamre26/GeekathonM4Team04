(() => {

    let youtubeLeftControls, youtubePlayer;   
    let currentVideo = '';
    currentVideoBookmarks = [];




    // fetching bookmark data from storage 
    const fetchBookmarks = () => {
        return new Promise((resolve) => {
          chrome.storage.sync.get([currentVideo], (obj) => {
            resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
          });
        });
      };






      const addNewBookmarkEventHandler = async () => {

        // currentTime is a property to access video currentTime;
        const currentTime = youtubePlayer.currentTime;
        console.log(currentTime);

        const newBookmark = {
            time: currentTime,
            desc: 'Bookmark at ' + getTime(currentTime),
        }
        console.log(newBookmark);


        currentVideoBookmarks = await fetchBookmarks();

        

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        })
        
    }





    const newVideoLoaded = async () => {
        const bookmarkBtnExists = document.getElementsByClassName('bookmark-btn')[0];
        // console.log(bookmarkBtnExists);

        currentVideoBookmarks = await fetchBookmarks();

        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement('img');

            bookmarkBtn.src = chrome.runtime.getURL('assets/bookmark.png');
            bookmarkBtn.classList.add('bookmark-btn');
            // bookmarkBtn.title = 'Click to bookmark current timestamp';


            youtubeLeftControls = document.getElementsByClassName('ytp-left-controls')[0];
            youtubePlayer = document.getElementsByClassName('video-stream')[0];
            // console.log(youtubeLeftControls);
            // console.log(youtubePlayer);

            youtubeLeftControls.append(bookmarkBtn);
            bookmarkBtn.addEventListener('click', addNewBookmarkEventHandler);
            
        }
    }



      // below line take a message comes from background.js of line 14
      chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;
    
        if (type === "NEW") {
          currentVideo = videoId;
          newVideoLoaded();
        } else if (type === "PLAY") {
          youtubePlayer.currentTime = value;
        } else if ( type === "DELETE") {
          currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
          chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
    
          response(currentVideoBookmarks);
        }
      });

    newVideoLoaded();

})();



const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);
  
    return date.toISOString().substr(11, 8);
  };