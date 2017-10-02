/* Inform the backgrund page that 
 * this tab should have a page-action */
chrome.runtime.sendMessage({
	from : 'content',
	subject : 'showPageAction'
});

/* Listen for message from the popup */
chrome.runtime.onMessage
		.addListener(function(msg, sender, response) {
			/* First, validate the message's structure */
			if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
				/*
				 * Collect the necessary data (For your specific requirements
				 * `document.querySelectorAll(...)` should be equivalent to
				 * jquery's `$(...)`)
				 */

				var title = document
						.querySelector('.formContent label[for="title"]').nextSibling.textContent;
				var doi = document
						.querySelector('.formContent label[for="doi"]').nextSibling.textContent;
				var owner = document
						.querySelector('.formContent label[for="attributionStatement"]').nextSibling.textContent;
				
				var na = "not available";
				if (title == null) {
					title = na;
				}
				if (doi == null) {
					doi = na;
				}
				if (owner == null) {
					owener = na;
				}

				var domInfo = {
					title : title,
					doi : doi,
					owner : owner
				};
				/*
				 * Directly respond to the sender (popup), through the specified
				 * callback
				 */
				response(domInfo);
			}
		});
