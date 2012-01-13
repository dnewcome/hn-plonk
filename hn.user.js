// ==UserScript==
// @match news.ycombinator.com 
// ==/UserScript==

/***
 * User script for navigating Hacker News. Moving up and down
 * between stories uses vim key bindings j,k. Kill a story
 * and never see it again using x.
 *
 * TODO: enter to open story link
 * TODO: c to read comments
 * TODO: precache selected stories?
 *
 * other scripts that do this:
 * http://news.ycombinator.com/item?id=277099
 * http://www.hnsearch.com/search#request/submissions&q=hacker+bookmarklet&start=0
 * 
 */

/**
 * Main code
 *
 * Set up key handler and run the kill process for stories that 
 * have been killed previously. Take care of highlighting the 
 * and setting the current row to the first visible story
 */
document.addEventListener( 'keypress', onKeydown, false ); 

var tables = document.getElementsByTagName( 'table' );
var currentrow = tables[2].firstChild.firstChild;
killstories();
var currentrow = tables[2].firstChild.firstChild;
highlight( currentrow );


/**
 * remove items from the page when first loaded. We assume 30 items
 * per page. Look up the story id and see if it exists in the local
 * storage data.
 */
function killstories() {
	for( var i=0; i<30; i++ ) {
		var killrow = currentrow;
		moveDown();
		var id = killrow.getElementsByTagName( 'a' )[0].id;
		var item = localStorage.getItem( id );
		if( item ) {
			console.log( 'removing ' + id );
			removeRow( killrow );			
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
}

/**
 * Handler for key commands, currently j,k,x
 */
function onKeydown( evt ) {
	// TODO: in opera the keycodes are funny
	// alert( evt.keyCode );
	
	// j - move down
	if( evt.keyCode == 106 ) {
		// TODO: logic for detecting end of page doesn't work 
		if( currentrow.nextSibling.nextSibling.nextSibling != null ) {
			moveDown();
		}
	}
	
	// k - move up
	else if( evt.keyCode == 107 ) {
		// check if we are at the top
		if( currentrow.previousSibling != null ) {
			moveUp();
		}
	}

	// x - kill story
	else if( evt.keyCode == 120) {
		kill();
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
	// TODO: use removeRow() to keep things DRY
	currentrow.parentNode.removeChild( currentrow.previousSibling );
	currentrow.parentNode.removeChild( currentrow.previousSibling );
	currentrow.parentNode.removeChild( currentrow.previousSibling );
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

