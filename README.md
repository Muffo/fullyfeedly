# FullyFeedly

### Chrome extensions to read the full articles in Feedly.com

[![Chrome Web Store](https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png)](https://chrome.google.com/webstore/detail/fullyfeedly/ikdncbjpcpkheefmnbicggciklkeebmp?hl=en)

With FullyFeedly you can load the full content of the articles inside Feedly, also when the feed RSS contains only a short preview.

## Features

* Seamless integration with Readability
* Super fast keyboard shortcut
* Works perfectly with HTTPS connection

## Usage

When reading an incomplete post, simply press the icon of FullFeedly in the URL bar to download the full text.

You can also enable the keyboard shortcut from the options page and display the full article with **f f**


## Developers

Pull requests are very welcome!!

Thanks a lot to the following developers for their help and contributions:

* [@patou](https://github.com/patou)
* [@churchs19](https://github.com/churchs19)
* [@pamarcos](https://github.com/pamarcos)


### Getting started

Clone the repository and follow [this guide](http://minimul.com/developing-a-chrome-extension-with-yeoman.html) to build and debug the extension.


### External API

The text of the article is extracted using the web API provided by:

* [Boilerpipe](http://boilerpipe-web.appspot.com/): free to use, limited quota
* [Readability](http://www.readability.com): free for non-commercial use, API key required
