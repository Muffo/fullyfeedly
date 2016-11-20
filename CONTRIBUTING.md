# Thanks a lot for contributing to FullyFeedly :+1:

## Getting started

Follow [this guide](http://minimul.com/developing-a-chrome-extension-with-yeoman.html) to build and debug the extension.

In summary, install the required command line tools:

    npm install -g grunt
    npm install -g bower

Clone the repository:

    git clone https://github.com/Muffo/fullyfeedly.git

Install the dependencies:

    bower install

Build the extension:

    grunt build


You can now [load the unpacked extension in Chrome](https://developer.chrome.com/extensions/getstarted#unpacked)  from the local folder. 

## Branching strategy

The Github repository uses a **linear** commit history.
 
To simplify the contribution from external developers, the project moved away from the [GitFlow](http://nvie.com/posts/a-successful-git-branching-model/) branching strategy.

All the contributions should be submitted as pull requests to the master branch and must not contain any merge commit.


## Version numbers

Version numbers follow the [Semantic Versioning](http://semver.org) and are managed by the owner of the project.
Please, do not increase the version numbers in your pull requests.


## Submit a bug

When you open an issue, please include the following information:

* Operating System
* Whether you are using Feedly Premium or the beta version
* A few screenshots of the issue

