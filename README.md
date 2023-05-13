# [YouTube Blocker Chrome Extension](https://chrome.google.com/webstore/detail/youtube-study/oohcfepaadomnocmmkejhnfhcddpdpab?authuser=0&hl=en)
<img src="https://github.com/erics98/ChromeExtension/blob/master/resources/icon.png" width="130" height="100">

# What & Why
YouTube Blocker blocks YouTube videos not in the Education, Science & Technology, or Howto & Style categories so you can focus on educational videos.

# How
![image](https://user-images.githubusercontent.com/30248575/161360734-bc649ddf-7fa7-4dde-ace3-36dc7c446a58.png)

Diagram [here](https://drive.google.com/file/d/1bfJn5ixQs3qVgTasrkL3UKKwkbV8ljPZ/view?usp=sharing)

### Notes
- Each page has a different local storage
- Understand Background action vs Browser action
- Background Script has the context of the extension while
- Content Script has the context of the web page. It has restrictions on CORS
so only the Background Script can run the CORS API requests.
- Content Script sends a Chrome message to the Background Script on whether to block the YouTube video or not
- Logo was made in Adobe Photoshop

### Resources Used
* Chrome Extension API
* Youtube Data API

# Setup 
1. clone repo
2. go to chrome://extensions
3. Press `Load unpacked` in top left corner 
4. Select youtube-blocker folder
5. Enable extension and develop in your IDE. Changes should reflect automatically. If not, then press the refresh button on the extension card in the chrome://extensions page


# Screenshots
![image](https://github.com/eric60/YouTube-Blocker/assets/30248575/a9fe43a2-99c8-430f-b1e8-65bfe230a1de)
