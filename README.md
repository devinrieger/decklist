# DeckList

A build on-the-fly decklist extension for Magic: The Gathering. The extension works by adding an "add" icon to individual cards on popular Magic: The Gathering sites.

Clicking the add icon will add the card to your list. Clicking on the icon again (which changes to a green checkmark for cards on your list) will remove the card from your list.

Clicking on the extension icon opens up a visual representation of your list, as well as options to edit it. You may edit the quantity and remove cards that you have added to the list. The extension UI also allows for downloading a .txt file and copying to the clipboard, as well as clearing the list.

Hovering over a card's name in the list will show a preview image of the card.

The list can also be automatically exported to TCGPlayer and Archidekt.

Supported Sites:
- Scryfall
- Gatherer
- Magic Spoiler
- EDHRec
- Cube Cobra
- TCGPlayer
- StrictlyBetter

Known Issues:
- Partners on EDHRec are funky and will require some time to figure out how to support
- TCGPlayer does not differentiate their products in any meaningful way on search result pages. This means that the "add" button will appear on any product, not just Magic cards.

Desired Features:
- Multiple lists (this may be a breaking change, in that the underlying storage structure would have to change and thus users would lose any current list)
- Text import
- Prices

Notes:

a) The extension can only add cards from sites that include the card name in proximity to the card tile. The four sites it currently works on have the actual card names typically as alt text of the card image. Unfortunately some sites don't follow this format (such as Mythic Spoiler which uses a name-like slug instead) so the extension will not work on those sites. If you would like to add another site please contact me and I will investigate!

b) EDHRec released a similar feature during development of this project for their site. The extension code will move the EDHRec feature in favor of the extension's functionality.

c) This project is open source. If you would like to contribute please check out the github page at https://github.com/devinrieger/decklist
