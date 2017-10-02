chrome.runtime.onMessage.addListener(function(msg, sender) {
    /* First, validate the message's structure */
    if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
        /* Enable the page-action for the requesting tab */
        chrome.pageAction.show(sender.tab.id);
    }
});

myURL="about:blank"; //A default url just in case below code doesn't work
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){ //onUpdated should fire when the selected tab is changed or a link is clicked 
    chrome.tabs.getSelected(null,function(tab){
        myURL=tab.url;
    });
});