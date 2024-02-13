//This function will called on adding the list on the board
function addListTrello(board) {
	return function () {
		var titleInput = document.getElementById('trello-list-title-input')

		document.getElementById('trello-list-title-submit').onclick = titleButtonClick
		board.titleFormNode.style.display = 'block'
		titleInput.focus()

		function titleButtonClick(evt) {
			evt.preventDefault()
			var title = titleInput.value.trim()
				, index = board.lists.length - 1
				, list

			board.titleFormNode.style.display = 'none'
			titleInput.value = ''
			if (!title) {
				return
			}

			list = new List(board, title, index)
			board.lists.splice(index, 0, list)
			board.listsNode.insertBefore(list.node,
				board.lists[index + 1].node)
			board.lists[index + 1].titleNode.setAttribute('list-index', index + 1)
		}
	}
}

/*
 This function will add the Card in the list
 */

 function addCardTrello(list) {
	return function () {
		var titleTextarea = list.titleFormNode
			.getElementsByClassName('trello-new-card-title-input')[0]
		list.titleFormNode.getElementsByClassName('trello-new-card-title-submit')[0]
			.onclick = titleSubmit
		list.titleFormNode.style.display = 'block';
		titleTextarea.focus();

		function titleSubmit(evt) {
			evt.preventDefault()
			var title = titleTextarea.value.trim()
				, card;

			list.titleFormNode.style.display = 'none';
			titleTextarea.value = '';
			if (!title) {
				return
			}

				card = new Card(list, title);
			list.board.registerCard(card, list.cards.length);
			list.cardsNode.insertBefore(card.node, list.cards[list.cards.length - 1].node);
			list.cards.push(card);
		}
	}
}



/*
 This function is called to build the card form
 */
 function buildCardTitleForm() {
	var node = document.createElement('form')
	node.innerHTML =
		'<div class="newitem-title-wrapper">' +
		'<textarea class="trello-new-card-title-input" type="text"></textarea>' +
		'<input class="trello-new-card-title-submit" type="submit" value="Add">' +
		'</div>'
	node.style.display = 'none'
	return node
}

var cardEdit =
{ node: document.getElementById('card-edit')
	, windowOverlay: document.getElementById('container-main')
	, titleNode: document.getElementById('card-edit-title')
	, card: undefined
}

cardEdit.clearInputs = function () {
	cardEdit.titleNode.value = '';
}

//This will called on the close button
cardEdit.close = function() {
	cardEdit.card = undefined
	cardEdit.clearInputs()
	cardEdit.node.style.display = 'none'
	cardEdit.windowOverlay.style.display = 'none'
}

//This function will show the edited text on the card on submit
cardEdit.show = function () {
	cardEdit.windowOverlay.style.display = 'block'
	cardEdit.node.style.display = 'block'
}

//This function will submit the edited text
cardEdit.submit = function (evt) {
	evt.preventDefault()
	var title = cardEdit.titleNode.value.trim();

	if (title) {
		cardEdit.card.title = title
		cardEdit.card.titleNode.replaceChild(document.createTextNode(title),
			cardEdit.card.titleNode.childNodes[0])
	}
	cardEdit.close()
}


/*
 This function deletes the card
 */
 var cardDeleteTrello = {};
 var currentBoard;
 
 cardDeleteTrello.delete = function () {
     var index = currentBoard.cards[cardEdit.card.id].index
 
     currentBoard.unregisterCard(cardEdit.card)
     currentBoard.reregisterSubsequent(cardEdit.card.list, index + 1, -1)
 
     cardEdit.card.list.cardsNode.removeChild(cardEdit.card.node)
     cardEdit.card.list.cards.splice(index, 1)
 
     cardEdit.close()
     cardEdit.card = undefined
 }
 
 



var dragTracker =
{
	id: undefined
	, list: undefined
}

//this function will build the card node
function buildCardNode() {
	var node = document.createElement('div')
	node.draggable = true
	node.innerHTML =
		'<div class="card-title"></div>';
	return node
}

/*
 This function is constructor function for card
 */
function Card(list, title) {
	this.id = list.board.getNextId()
	this.list = list
	this.title = title
	this.node = buildCardNode()
	this.titleNode = this.node.getElementsByClassName('card-title')[0]

	this.node.classList.add('card')
	this.node.setAttribute('card-id', this.id)
	this.titleNode.appendChild(document.createTextNode(this.title))

	/*
	 These four function will work on drag and drop of the card on another list
	 */
	this.node.ondragstart = (function (id) {
		return function (evt) {
			dragTracker.id = id
			evt.dataTransfer.effectAllowed = 'move'
		}
	}(this.id))

	this.node.ondragover = function (evt) {
		if (dragTracker.id) {
			evt.preventDefault()
		}
	}

	this.node.ondrop = (function (board) {
		return function (evt) {
			var id = dragTracker.id
				, targetId = this.getAttribute('card-id') // 'this' is target of drop
				, source = board.cards[id]
				, target = board.cards[targetId]

			if (id === targetId) {
				return
			}

			source.list.cardsNode.removeChild(source.card.node)
			target.list.cardsNode.insertBefore(source.card.node, target.card.node)

			board.reregisterSubsequent(source.list, source.index + 1, -1)
			source.list.cards.splice(source.index, 1)

			board.reregisterSubsequent(target.list, target.index + 1, 1)
			target.list.cards.splice(target.index + 1, 0, source.card)

			source.card.list = target.list
			board.registerCard(source.card, target.index + 1)
			evt.preventDefault()
		}
	}(list.board))

	this.node.ondragend = function () {
		dragTracker.id = undefined
	}


	// this function will be called once you click on the text to edit
	this.node.onclick = (function (card) {
		return function () {
			cardEdit.card = card
			cardEdit.titleNode.value = card.title;
			cardEdit.show()
		}
	}(this))
}