// ==UserScript==
// @match http://news.ycombinator.com/*
// ==/UserScript==

/***
 * User script for navigating Hacker News. Moving up and down
 *  between stories uses vim key bindings j,k. Kill a story
 *  and never see it again using x. Killed stories are tracked in 
 *  HTML5 LocalStorage, so clearing it will bring back all stories.
 *  Open c,enter browses to comments/link respectively.
 *
 * TODO: precache selected stories?
 * TODO: open stuff async in iframes?
 * TODO: remember highlighted position?
 *  this makes it easier when browsing to read an article and then
 *  hit the browser back button to return to HN
 * TODO: abstract DOM traversals a bit more, move to functions
 * TODO: scroll down when moving selection below the fold
 * TODO: Temporarily disable killed stories, to ressurect?
 *
 * other scripts that do this:
 * http://news.ycombinator.com/item?id=277099
 * http://www.hnsearch.com/search#request/submissions&q=hacker+bookmarklet&start=0
 * 
 * BUG: browsing to articles that have been upvoted results in 
 *  viewing the submitter's profile rather than the intended action
 * BUG: Voting a story up and then trying to browse to another story
 *  results in trying to vote for the same story again.
 * BUG: Key commands should be disabled when commenting
 *
 * Browser support -
 *  Tested now on Opera, Firefox and Chrome. Voting function only works 
 *  correctly in Opera due to tighter security restrictions elsewhere.
 */

/**
 * Main 
 *
 * Set up key handler and run the kill process for stories that 
 * have been killed previously. Take care of highlighting the 
 * and setting the current row to the first visible story
 */

// the row that is in focus for operations
// global. bad.
var currentrow;

/*
 * Only activate script for /, newest, news, and x. Pagination
 * uses the /x path with a timestamp id.
 */
if( window.location.pathname.match( /newest|x|news|^\/$/ ) ) {
	main();
}

function main() {
	console.log( 'running user script for hacker news' );
	document.addEventListener( 'keypress', onKeydown, false ); 

	addPlonkLink( 'kill', modifyKillList );
	addPlonkLink( 'plonk', modifyPlonkList );
	addPlonkLink( 'reset', resetList );
	killstories();
	currentrow = findFirstRow();
	highlight( currentrow );
}

/**
 * remove items from the page when first loaded. We assume 30 items
 * per page. Look up the story id and see if it exists in the local
 * storage data.
 */
function killstories() {
	// start at the top
	currentrow = findFirstRow();

	for( var i=0; i<30; i++ ) {
		var killrow = currentrow;
		var id = null;
		moveDown();
		
		if( killrow.getElementsByTagName( 'a' )[0] ) {
			var id = killrow.getElementsByTagName( 'a' )[0].id;
		}
		console.log( 'story id ' + id );
		var item = localStorage.getItem( id );

		// if an item doesn't have a vote flag, kill it. It is already 
		// voted or is a system message
		if( !id ) {
			console.log( 'removing item without voting link' );
			removeRow( killrow );			
		}
		// check if story was killed by id
		else if( item ) {
			console.log( 'removing ' + id );
			removeRow( killrow );			
		}
		
		else {
			// check if story matches killfile 
			var title = killrow.getElementsByTagName( 'a' )[1].innerHTML;
			var kill = ( localStorage.getItem( 'kill' ) || '' ).split( ' ' );

			// check if story matches plonkfile 
			var user = killrow.nextSibling.getElementsByTagName( 'a' )[0].innerHTML;
			console.log( 'looking at user ' + user );
			var plonk = ( localStorage.getItem( 'plonk' ) || '' ).split( ' ' );

			// TODO: clean up ugly nested logic for kill/plonk
			outer:
			for( var j=0; j<kill.length; j++ ) {
				console.log( kill[j] );
				if( kill[j] != '' && title.match( new RegExp( kill[j], 'i' ) ) ) {
					console.log( 'removing due to kill match ' + id );
					removeRow( killrow );			
					// once we match, we're done
					break outer;
				}
				else {
					for( var k=0; k<plonk.length; k++ ) {
						if( plonk[k] != '' && user == plonk[k] ) {
							console.log( 'removing due to plonk match ' + id );
							removeRow( killrow );			
							break outer;
						}
					}
				}
			}

		}
	}
}

/**
 * Dumb item traversal functions that just jump up or down
 * 3 <tr>s at a time, highlighting the proper element
 */
function moveDown() {
	unhighlight( currentrow );
	currentrow = currentrow.nextSibling.nextSibling.nextSibling;
	highlight( currentrow );
}
function moveUp() {
	unhighlight( currentrow );
	currentrow = currentrow.previousSibling.previousSibling.previousSibling;
	highlight( currentrow );
}

/**
 * Abstract the act of highlighting and unhighlighting
 * a DOM element somewhat
 */
function highlight( el ) {
	el.style.backgroundColor = 'white';
}
function unhighlight( el ) {
	el.style.backgroundColor = null;
}

/**
 * Clear list of killed pages so that all stories show again
 * This is not used anywhere yet. TODO: put a button on the page
 */
function resetList() {
	localStorage.clear();
	window.location.reload();
}

/**
 * return the <tr> element that represents the top of
 *  the stories list
 */
function findFirstRow() {
	var tables = document.getElementsByTagName( 'table' );
	return tables[2].firstChild.firstChild;
}

/**
 * Handler for key commands, currently j,k,x
 */
function onKeydown( evt ) {
	console.log( evt.keyCode + ' ' + evt.charCode );
	// firefox uses charCodes for printable chars
	// keyCode will be 0. TODO: should try to do this the right way
	var keyCode = evt.keyCode == 0 ? evt.charCode : evt.keyCode;	

	// j - move down
	if( keyCode == 106 ) {
		// TODO: logic for detecting end of page doesn't work 
		// TODO: should move this check to moveDown()
		if( currentrow.nextSibling.nextSibling.nextSibling != null ) {
			moveDown();
		}
	}
	
	// k - move up
	else if( keyCode == 107 ) {
		// check if we are at the top
		// TODO: should move this check to moveUp()
		if( currentrow.previousSibling != null ) {
			moveUp();
		}
	}

	// x - kill story
	else if( keyCode == 120) {
		kill();
	}

	// enter - browse to story 
	else if( keyCode == 13 ) {
		browse();
	}

	// 'c' - read comments 
	else if( keyCode == 99 ) {
		comments();
	}
	// 'v' - vote 
	else if( keyCode == 118 ) {
		uservote();
	}
}

/**
 * Used by 'x' command to kill a story
 */
function kill() {
	var id = currentrow.getElementsByTagName( 'a' )[0].id;
	// using 'true' here - this is arbitrary, all
	// we check is existence of the key in the store
	localStorage.setItem( id, 'true' );

	// move current row position down before deleting anything 
	if( currentrow.nextSibling != null ) {
		moveDown();
	}
	removePreviousRow( currentrow );
}

/**
 * Used by 'enter' command to browse to a story 
 */
function browse() {
	// big hairy dom traversal - we have to go specifically to third 
	// child rather than just pulling all anchor elements since if a 
	// story is voted up, the link count will be off.
	var link = currentrow.children[2].getElementsByTagName( 'a' )[0].href;
	window.location = link;
}

/**
 * Used by 'c' command to browse to comments 
 */
function comments() {
	// the comments are in the 'subtext' line, which immediately follows
	// the main subject line and consists
	// of 3 links always (I think, if you flag a story, the link is replaced
	// by an 'unflag' option, so the number of links is consistent.)
	// the third link goes to the comments for the story.
	var link = currentrow.nextSibling.getElementsByTagName( 'a' )[2].href;
	window.location = link;
}

/**
 * Used by 'v' command to vote story up 
 * we call it uservote because there is js on the page already with 'vote()'
 */
function uservote() {
	var node = currentrow.getElementsByTagName( 'a' )[0];
	console.log( 'node id: ' + node.id );

	// vote is not defined when we use browsers other than opera
	// so check first
	if( vote ) {
		vote( node );

		// move current row position down before deleting anything 
		if( currentrow.nextSibling != null ) {
			moveDown();
		}
		removePreviousRow( currentrow );
	}
}

/**
 * row removal method used by killstories(). 
 * TODO: merge the method used by 'x' command to keep it DRY
 */
function removeRow( el ) {
	el.parentNode.removeChild( el.nextSibling.nextSibling );
	el.parentNode.removeChild( el.nextSibling );
	el.parentNode.removeChild( el );
}

/**
 * Used by vote and kill commands to remove the row from the dom
 * after the next row has been selected.
 */
function removePreviousRow( el ) {
	el.parentNode.removeChild( el.previousSibling );
	el.parentNode.removeChild( el.previousSibling );
	el.parentNode.removeChild( el.previousSibling );
}

/**
 * Insert link in page header for killfile list
 */
function addPlonkLink( text, func ) {
	var header = document.getElementsByClassName( 'pagetop' )[0];
	var separator = document.createTextNode( ' | ' );
	var link = document.createElement( 'a' );
	link.innerHTML = text;
	link.href = '#';
	link.addEventListener( 'click', func, false );
	header.appendChild( separator )
	header.appendChild( link )
}

/**
 * Show dialog for adding to kill list, save list to local
 * storage
 *
 * Behavior is that clearing the text in the dialog clears the kill
 *  filter. Hitting cancel should leave the filter unaffected. Careful
 *  about distinguishing null from empty string.
 */
function modifyKillList() {
	console.log( 'kill list' );
	var kill = localStorage.getItem( 'kill' );
	var userEntry = prompt( "Enter space separated list of kill terms", kill );
	if( userEntry !== null ) {
		kill = userEntry;
	}
	localStorage.setItem( 'kill', kill );
}

/**
 * Show dialog for adding to plonk list, save list to local
 * storage
 *
 * Behavior is that clearing the text in the dialog clears the kill
 *  filter. Hitting cancel should leave the filter unaffected. Careful
 *  about distinguishing null from empty string.
 *
 *  TODO: consolidate with modifyKillList()
 */
function modifyPlonkList() {
	console.log( 'plonk list' );
	var kill = localStorage.getItem( 'plonk' );
	var userEntry = prompt( "Enter space separated list of user ids", kill );
	if( userEntry !== null ) {
		kill = userEntry;
	}
	localStorage.setItem( 'plonk', kill );
}
