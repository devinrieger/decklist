const hostMap = {
	'scryfall.com': {
		card: '.card-grid-item:not(.flexbox-spacer), .card-image-front',
		selector: 'img.card',
		attribute: 'title'
	},
	'gatherer.wizards.com': {
		card: '.cardItem .leftCol, .visualspoiler a, .cardImage',
		selector: 'img',
		attribute: 'alt'
	},
	'edhrec.com': {
		card: '.card__container',
		selector: 'img.card__image-img',
		attribute: 'alt'
	},
	'www.magicspoiler.com': {
		card: '.spoiler-set-card, .scard, .home-card',
		selector: 'img',
		attribute: 'alt'
	},
	'www.strictlybetter.eu': {
		card: '.mtgcard-wrapper:not(.newcard)',
		selector: 'img.mtgcard',
		attribute: 'alt',
		observer: '#cards, #upgrade_view_container'
	}
};

let host = window.location.host;
let cardSelector = hostMap[host].card;
let targetSelector = hostMap[host].selector;
let nameAttribute = hostMap[host].attribute;
let observerSelector = hostMap[host].observer

let observer = new MutationObserver(function(mutationsList, observer) {
	chrome.storage.sync.get(['list'], addButtons);
});

if (observerSelector !== undefined) {
	document.querySelectorAll(observerSelector).forEach(observerEl => {
		observer.observe(observerEl, { attributes: false, childList: true, subtree: true });
	});
}

chrome.storage.sync.get(['list'], addButtons);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.update === "list") {
		updateIcons();
	}
});

function addButtons(result) {
	document.querySelectorAll(cardSelector).forEach(cardEl => {
		let name = cardEl.querySelector(targetSelector).getAttribute(nameAttribute).replace(/( \(.*)\)/, '');
		let edhRecBtn = cardEl.querySelector('.toggle-card-in-decklist-button');
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

		// Observer might be trying to create buttons when one already exists,
		// instead replace the old one
		let oldEl = cardEl.querySelector('div.dl-button');
		if (oldEl)
			cardEl.replaceChild(oldEl, copyEl);
		else
			cardEl.appendChild(copyEl);
	});

	// Prevent above DOM edits from re-triggering observer
	observer.takeRecords();	
}


function addToList(event) {
	let target = event.target;
	event.preventDefault();
	chrome.storage.sync.get(['list'], function(result) {
		let list = result.list;
		list.push({name: target.getAttribute('data-name'), qty: 1});
		chrome.storage.sync.set({list: list}, updateIcons);
	});
}

function removeFromList(event) {
	let target = event.target;
	event.preventDefault();
	chrome.storage.sync.get(['list'], function(result) {
		let list = result.list;
		let index = list.findIndex(card => card.name === target.getAttribute('data-name'));
		if (index > -1) {
			list.splice(index, 1);
		}
		chrome.storage.sync.set({list: list}, updateIcons);
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
	chrome.storage.sync.get(['list'], function(result) {
		let list = result.list;
		document.querySelectorAll('.dl-button').forEach(target => {
			let name = target.getAttribute('data-name');
			if (list.find(card => card.name === name) && !target.className.includes('dl-check')) {
				toggleChecked(target)
			} else if (!list.find(card => card.name === name)) {
				toggleUnchecked(target)
			}
		});
	});
}
