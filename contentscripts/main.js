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
	}
};

let host = window.location.host;
let cardSelector = hostMap[host].card;
let targetSelector = hostMap[host].selector;
let nameAttribute = hostMap[host].attribute;

chrome.storage.sync.get(['list'], function(result) {
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
			copyEl.classList.add('dl-check');
			copyEl.addEventListener('click', removeFromList);
		} else {
			copyEl.classList.add('dl-default');
			copyEl.addEventListener('click', addToList);
		}

		cardEl.style.position = 'relative';
		cardEl.style.display = 'inline-block';
		cardEl.appendChild(copyEl);
	});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.update === "list") {
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
});

function addToList(event) {
	let target = event.target;
	event.preventDefault();
	toggleChecked(target);
	chrome.storage.sync.get(['list'], function(result) {
		let list = result.list;
		list.push({name: target.getAttribute('data-name'), qty: 1});
		chrome.storage.sync.set({list: list});
	});
}

function removeFromList(event) {
	let target = event.target;
	event.preventDefault();
	toggleUnchecked(target);
	chrome.storage.sync.get(['list'], function(result) {
		let list = result.list;
		let index = list.findIndex(card => card.name === target.getAttribute('data-name'));
		if (index > -1) {
			list.splice(index, 1);
		}
		chrome.storage.sync.set({list: list});
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