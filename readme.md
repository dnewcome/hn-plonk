# About

Hacker News Plonk is a browser user script that filters and removes stories on Hacker News. It 
gives you convenient keyboard shortcuts for navigating and processing stories. 

![](http://github.com/dnewcome/hn-plonk/raw/master/hnplonk.png)

I wanted to have a way to ignore certain stories or just kill ones that I'm 
not interested in. Hacker News Plonk allows you to read down through the front page kind of like
an inbox, touching the list just once, deleting, reading or voting on the story.

The term plonk comes from the Usenet news reader 
days where most user agents were able to filter out postings from certain users via a killfile
maintained by the reader.

# Installation

Installation varies depending on the browser. Google chrome allows you to just open the .user.js file and it
will prompt you to install it as an extension. In Mozilla you will have to install GreaseMonkey first, and then
use GreaseMonkey to install the hn.user.js extension. Opera allows you to specify a directory to read
user.js scripts from. Specify the directory and just drop hn.user.js there and Opera will find it.

# Usage

HN Plonk uses VIM-style keyboard commands in addition to adding three new links at the top of the page. 

## Menu links

### kill 
Prompts you to enter a space-separated list of kill filters that operate on the story title. 
These are treated as regular expressions and may not contain space characters.

### plonk 
Same as kill, but filters on HN user id. These must be full ids, no partial matches, and these are not
treated as regular expressions. 

### reset 
Clears local storage for news.ycombinator.com, effectively clearing all filters.


## Key commands

### x 
Kill an individual story. This stores the story ID in HTML5 local storage. When Hacker News loads, the 
HN Plonk compares the stories with the kill list and removes any matches from the page.

### j/k 
Move up and down in the list. The current story will be highlighted with a white background.

### enter 
Read the story. Browses away from Hacker News.

### c 
Read comments for the selected story.

### v 
Vote the story up. This only works in Opera currently due to security restrictions in Chrome/FF.

