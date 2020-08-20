'use strict';

let copyList = document.querySelector('#copyList');
let exportList = document.querySelector('#exportList');
let clearList = document.querySelector('#clearList');
let listText = document.querySelector('#listText');
let close = document.querySelector('.dl-button');

chrome.storage.sync.get(['list'], function(data) {
	data.list.forEach((card, i) => {
		let qty = card.qty;
		let name = card.name;
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
		let addEl = document.querySelector(`.listCard[data-name="${name}"] .add`);
		let minusEl = document.querySelector(`.listCard[data-name="${name}"] .minus`);
		let removeEl = document.querySelector(`.listCard[data-name="${name}"] .remove`);
		addEl.onclick = minusEl.onclick = removeEl.onclick = function(element) {
			let action = element.target.className;
			let name = element.target.parentElement.parentElement.getAttribute('data-name');
			chrome.storage.sync.get(['list'], function(data) {
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
				chrome.storage.sync.set({list: list});
			})
		}
	});
});

copyList.onclick = function(element) {
	chrome.storage.sync.get(['list'], function(data) {
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

exportList.onclick = function(element) {
	chrome.storage.sync.get(['list'], function(data) {
		let copyStr = createCopyString(data.list);
		if (!!copyStr) {
			let blob = new Blob([copyStr], {type: "text/plain"});
			let url = URL.createObjectURL(blob);
			chrome.downloads.download({
				url: url,
				filename: 'decklist.txt'
			});
		}
	});
}

clearList.onclick = function(element) {
	chrome.storage.sync.set({list: []});
}

close.onclick = function(element) {
	window.close();
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (var key in changes) {
		let newValue = changes[key].newValue
		if (key === 'list') {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {update: "list"});
			});
			if (newValue.length === 0) {
				listText.innerHTML = '';
			} else {
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

function createCopyString(list) {
	return list.reduce((acc, card) => {
		return acc + `${card.qty} ${card.name}\n`;
	}, '');
}