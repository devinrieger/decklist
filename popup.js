'use strict';

// Define them buttons
let copyList = document.querySelector('#copyList');
let exportList = document.querySelector('#exportList');
let clearList = document.querySelector('#clearList');
let buyList = document.querySelector('#buyList');
let listText = document.querySelector('#listText');
let closePopup = document.querySelector('.dl-button');

// Image stuff
let imageContainer = document.querySelector('#imageContainer');

// Initialize listener for list updates; send update to active tab and update quantities in popup HTML
chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (var key in changes) {
		let newValue = changes[key].newValue
		if (key === 'list') {
			// Send updated list to active tab to update checkmarks
			chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {update: "list"});
			});
			if (newValue.length === 0) {
				// If updated list length is 0 (i.e. cleared) set HTML to empty string
				listText.innerHTML = '';
			} else {
				// Update Quantity in HTML or remove
				let listCards = document.querySelectorAll('.listCard');
				listCards.forEach(cardListEl => {
					let name = cardListEl.getAttribute('data-name');
					let listItem = newValue.find(card => card.name === name);
					if (listItem) {
						cardListEl.querySelector('.qty').innerText = `${listItem.qty}`;
					} else {
						cardListEl.remove();
					}
				});
			}
		}
	}
});

// Initialize card elements; for each card in the list:
// create the HTML, set up quantity controls, and create image
chrome.storage.local.get(['list'], function(data) {
	data.list.forEach((card, i) => {
		let qty = card.qty;
		let name = card.name;
		let imageurl = card.imageurl;

		// Create listCard HTML
		let cardHtml = `<div class="listCard" data-name="${name}">
			<div class="qty">${qty}</div><div class="spacer"> </div><div class="name">${name}</div>
			<div class="qtyControls">
				<div class="add">
					<div class="qty-plus-vert"></div>
					<div class="qty-plus-hori"></div>
				</div><div class="minus">
					<div class="qty-plus-hori"></div>
				</div><div class="remove">
					<div class="qty-plus-vert"></div>
					<div class="qty-plus-hori"></div>
				</div>
			</div>
		</div>`
		listText.insertAdjacentHTML('beforeend', cardHtml);

		// Set hover listener to show image on name
		let nameEl = document.querySelector(`.listCard[data-name="${name}"] .name`);
		nameEl.addEventListener('mouseenter', showImage);
		nameEl.addEventListener('mouseleave', hideImage);

		// Set click listeners for quantity controls
		let addEl = document.querySelector(`.listCard[data-name="${name}"] .add`);
		let minusEl = document.querySelector(`.listCard[data-name="${name}"] .minus`);
		let removeEl = document.querySelector(`.listCard[data-name="${name}"] .remove`);
		addEl.onclick = minusEl.onclick = removeEl.onclick = updateList;

		// Create image in imageContainer
		let imageHtml = `<img src="${imageurl}" alt="image" height="350" data-name="${name}"/>`;
		imageContainer.insertAdjacentHTML('beforeend', imageHtml);
	});
});

//
// Helper functions
//

function showImage(event) {
	let name = event.target.textContent;
	let imageElement = document.querySelector(`#imageContainer img[data-name="${name}"]`);
	imageElement.classList.add('visible');
}

function hideImage(event) {
	let name = event.target.textContent;
	let imageElement = document.querySelector(`#imageContainer img[data-name="${name}"]`);
	imageElement.classList.remove('visible');
}

// Quantity and remove control click listener to update list on click
function updateList(event) {
	let action = event.target.className;
	let name = event.target.parentElement.parentElement.getAttribute('data-name');
	chrome.storage.local.get(['list'], function(data) {
		let list = data.list;
		let index = list.findIndex(card => card.name === name);
		switch (action) {
			case 'add':
				list[index].qty++;
				break;
			case 'minus':
				list[index].qty--;
				if (list[index].qty < 1) {
					list.splice(index, 1);
				}
				break;
			case 'remove':
				list.splice(index, 1);
				break;
		}
		chrome.storage.local.set({ list });
	});
}

// Helper used in copy and export functions; generate the string to be used
function createCopyString(list) {
	return list.reduce((acc, card) => {
		return acc + `${card.qty} ${card.name}\n`;
	}, '');
}

//
// Add click listeners for popup controls
//

// Copy list to clipboard
copyList.onclick = function(event) {
	chrome.storage.local.get(['list'], function(data) {
		let copyTextArea = document.querySelector('textarea.copy');
		let copyStr = createCopyString(data.list);
		copyTextArea.innerHTML = copyStr;
		copyTextArea.select();
		document.execCommand('copy');
		let oldText = copyList.innerHTML;
		copyList.innerHTML = 'Copied';
		setTimeout(function() {
			copyList.innerHTML = oldText;
		}, 1000);
		copyTextArea.innerHTML = '';
	});
}

// Export list to .txt file
exportList.onclick = function(event) {
	chrome.storage.local.get(['list'], function(data) {
		let copyStr = createCopyString(data.list);
		if (!!copyStr) {
			let blob = new Blob([copyStr], { type: "text/plain" });
			let url = URL.createObjectURL(blob);
			chrome.downloads.download({
				url: url,
				filename: 'decklist.txt'
			});
		}
	});
}

// Clear list
clearList.onclick = function(event) {
	chrome.storage.local.set({list: []});
}

// Close popup window
closePopup.onclick = function(event) {
	window.close();
}

// Open TCGPlayer Mass Entry
buyList.onclick = function(event) {
	chrome.storage.local.get(['list'], function(data) {
		let baseUrl = 'https://www.tcgplayer.com/massentry?productline=Magic&utm_campaign=affiliate&utm_medium=decklistext&utm_source=decklistext&c=';
		let listParams = data.list.reduce((acc, card) => {
			return acc + `${card.qty} ${card.name.split(' //')[0]}||`;
		}, '').replace(/ /g, '%20');
		let fullUrl = baseUrl + listParams;
		chrome.tabs.create({ url: fullUrl })
	});
}

// Open Archidekt Mass Entry
buildList.onclick = function(event) {
	chrome.storage.local.get(['list'], function(data) {
		let baseUrl = 'https://archidekt.com/cardImport?c=';
		let listParams = data.list.reduce((acc, card) => {
			return acc + `${card.qty} ${card.name.split(' //')[0]}\n`;
		}, '');
		let encodedParams = encodeURIComponent(listParams);
		let fullUrl = baseUrl + encodedParams;
		chrome.tabs.create({ url: fullUrl })
	});
}