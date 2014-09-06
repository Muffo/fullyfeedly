FullyFeedly
===========

Chrome extension to display the full content of articles in Feedly


## Usage

The RSS feed of some website contains only a preview of the articles.
FullFeedly is a chrome extensions that allows you to read the full article without leaving Feedly.com

When reading an imcomplete post, simply press the icon of FullFeedly in the URL bar to download the full text.


## Developer

Clone the repository and follow [this guide](http://minimul.com/developing-a-chrome-extension-with-yeoman.html) to build and debug the extension.

The text of the article is extracted using the web API provided by:

* [Boilerpipe](http://boilerpipe-web.appspot.com/): free to use, limited quota
* [Readability](http://www.readability.com): free for non-commmercial uses, API key required
