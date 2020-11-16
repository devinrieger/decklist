# DeckList

A build on-the-fly decklist extension for Magic: The Gathering. The extension works by adding an "add" icon to individual cards on Gatherer, Scryfall, EDHRec, and MagicSpoiler.

Clicking the add icon will add the card to your list. Clicking on the icon again (which changes to a green checkmark for cards on your list) will remove the card from your list.

Clicking on the extension icon opens up a visual representation of your list, as well as options to edit it. You may edit the quantity and remove cards that you have added to the list. The extension UI also allows for downloading a .txt file and copying to the clipboard, as well as clearing the list.

Notes: 
a) the extension can only add cards from sites that include the card name in proximity to the card tile. The four sites it currently works on have the actual card names typically as alt text of the card image. Unfortunately some sites don't follow this format (such as Mythic Spoiler which uses a name-like slug instead) so the extension will not work on those sites. If you would like to add another site please contact me and I will investigate!

b) EDHRec released a similar feature during development of this project for their site. The extension code will disable the EDHRec feature in favor of the extension's functionality. A known bug/conflict is that on a fresh page view, the extension's code sometimes doesn't work. Refreshing the page should resolve for the time being, a fix is in the works!

c) This project is open source. If you would like to contribute please feel free!