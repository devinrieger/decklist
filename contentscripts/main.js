// This file is the contentscript that runs on every page load of integrated sites.

const hostMap = {
	'scryfall.com': {
		card: '.card-grid-item:not(.flexbox-spacer), .card-image-front',
		selector: 'img.card',
		attribute: 'title',
		enableWatchInterval: false
	},
	'gatherer.wizards.com': {
		card: '.cardItem .leftCol, .visualspoiler a, .cardImage',
		selector: 'img',
		attribute: 'alt',
		enableWatchInterval: false
	},
	'edhrec.com': {
		card: '[class*="Card_imageContainer"]',
		selector: 'img[class*="Card_image"]',
		attribute: 'alt',
		enableWatchInterval: true
	},
	'www.magicspoiler.com': {
		card: '.spoiler-set-card, .scard, .home-card',
		selector: 'img',
		attribute: 'alt',
		enableWatchInterval: false
	},
	'www.tcgplayer.com': {
		card: '.search-result .progressive-image',
		selector: 'img',
		attribute: 'alt',
		enableWatchInterval: true
	},
	'cubecobra.com': {
		card: '.card .pl-2, .card-body .col-4',
		selector: 'img',
		attribute: 'alt',
		enableWatchInterval: false
	},
	'www.strictlybetter.eu': {
		card: '.mtgcard-wrapper:not(.newcard)',
		selector: 'img.mtgcard',
		attribute: 'alt',
		enableWatchInterval: true
	}
};

let host = window.location.host;
let cardSelector = hostMap[host].card;
let targetSelector = hostMap[host].selector;
let nameAttribute = hostMap[host].attribute;
let enableWatchInterval = hostMap[host].enableWatchInterval;

init();

// Functions

function init() {
	initListListener();
	initIcons();
	watchDOM();
}

function initListListener() {
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.update === "list") {
			updateIcons();
		}
	});
}

function initIcons() {
	chrome.storage.local.get(['list'], function(result) {
		let cardNodes = document.querySelectorAll(`${cardSelector}:not(.dl-added)`);
		cardNodes.forEach(cardEl => {
			let rawName = cardEl.querySelector(targetSelector) && cardEl.querySelector(targetSelector).getAttribute(nameAttribute);
			if (rawName) {
				cardEl.classList.add('dl-added');

				let name = rawName.replace(/( \(.*)\)/, '');
				let edhRecBtn = cardEl.querySelector('[class*="Card_toggleCardInDecklistButton"]');
				if (edhRecBtn) {edhRecBtn.remove();}
	
				let copyEl = document.createElement('div');
				copyEl.classList.add('dl-button');
				copyEl.innerHTML = '<div class="dl-plus-vert"></div><div class="dl-plus-hori"></div>';
				copyEl.setAttribute('data-name', name);
	
				let list = result.list;
				if (list.find(card => card.name === name)) {
					toggleChecked(copyEl);
				} else {
					toggleUnchecked(copyEl);
				}
	
				cardEl.style.position = 'relative';
				cardEl.style.display = 'inline-block';
				cardEl.appendChild(copyEl);
			}
		});
	});
}

function watchDOM() {
	if (enableWatchInterval) {
		let watchInterval = setInterval(() => {
			let numNodes = document.querySelectorAll(`${cardSelector} ${targetSelector}`).length;
			let numPrevNodes = document.querySelectorAll(`${cardSelector}.dl-added`).length;
			if (numNodes !== numPrevNodes) {
				initIcons();
			}
		}, 200);
	}
}

async function addToList(event) {
	event.preventDefault();
	let target = event.target;
	toggleChecked(target);
	let name = target.getAttribute('data-name');
	let imageurl = await fetchImageURL(name);
	syncAdd(name, imageurl);
}

function removeFromList(event) {
	let target = event.target;
	event.preventDefault();
	chrome.storage.local.get(['list'], function(result) {
		let list = result.list;
		let index = list.findIndex(card => card.name === target.getAttribute('data-name'));
		if (index > -1) {
			list.splice(index, 1);
		}
		chrome.storage.local.set({list: list}, updateIcons);
	});
}

function toggleChecked(target) {
	target.classList.add('dl-check');
	target.classList.remove('dl-default');
	target.removeEventListener('click', addToList);
	target.addEventListener('click', removeFromList);
}

function toggleUnchecked(target) {
	target.classList.add('dl-default');
	target.classList.remove('dl-check');
	target.addEventListener('click', addToList);
	target.removeEventListener('click', removeFromList);
}

function updateIcons() {
	chrome.storage.local.get(['list'], function(result) {
		let list = result.list;
		document.querySelectorAll('.dl-button').forEach(target => {
			let name = target.getAttribute('data-name');
			let checked = target.className.includes('dl-check');
			if (list.find(card => card.name === name) && !checked) {
				toggleChecked(target)
			} else if (!list.find(card => card.name === name) && checked) {
				toggleUnchecked(target)
			}
		});
	});
}

async function fetchImageURL(name) {
	let queryURL = `https://api.scryfall.com/cards/named?fuzzy=${name.replace(/ /g, '+')}`;
	let response = await fetch(queryURL);
	let card_data = await response.json();
	let uri = card_data?.card_faces?.length ? card_data.card_faces[0]?.image_uris?.normal : card_data?.image_uris?.normal;
	return uri;
}

function syncAdd(name, imageurl) {
	chrome.storage.local.get(['list'], function(result) {
		let list = result.list;
		list.push({name, qty: 1, imageurl});
		chrome.storage.local.set({list: list}, updateIcons);
	});
}
