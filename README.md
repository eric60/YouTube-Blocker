# [YouTube Blocker Chrome Extension](https://chrome.google.com/webstore/detail/youtube-study/oohcfepaadomnocmmkejhnfhcddpdpab?authuser=0&hl=en)
<img src="https://github.com/erics98/ChromeExtension/blob/master/resources/icon.png" width="130" height="100">

# About
YouTube Blocker blocks YouTube videos not in the Education, Science & Technology, or Howto & Style categories so you can focus on educational videos.

# [Docs](https://drive.google.com/file/d/1bfJn5ixQs3qVgTasrkL3UKKwkbV8ljPZ/view?usp=sharing)
![image](https://user-images.githubusercontent.com/30248575/161360624-7e51241b-78c5-4538-9cab-d3b9f4dbeb4b.png)


### Notes
- Each page has a different local storage
- Understand Background action vs Browser action
- Background Script has the context of the extension while
- Content Script has the context of the web page. It has restrictions on CORS
so only the Background Script can run the CORS API requests.
- Content Script sends a Chrome message to the Background Script on whether to block the YouTube video or not

**Resources Used**
* Chrome Extension API
* Youtube Data API

# Setup 
1. clone repo
2. go to chrome://extensions
3. Press `Load unpacked` in top left corner 
4. Select youtube-blocker folder
5. Enable extension and develop in your IDE. Changes should reflect automatically. If not, then press the refresh button on the extension card in the chrome://extensions page


# Notes
- Logo was made in Adobe Photoshop
