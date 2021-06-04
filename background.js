'use strict';

chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.local.set({list: []});
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {update: 'list'});
	});
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (var key in changes) {
		let newValue = changes[key].newValue;
		if (key === 'list') {
			let total = newValue.reduce((acc, cardItem) => {
				return acc + cardItem.qty;
			}, 0);
			let totalString = total > 0 ? `${total}` : '';
			chrome.browserAction.setBadgeText({text: `${totalString}`});
		}
	}
});

chrome.browserAction.setBadgeBackgroundColor({color: '#333'});