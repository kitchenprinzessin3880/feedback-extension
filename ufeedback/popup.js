var getFeedbackUrl = 'http://esi.it.csiro.au:3880/csiro-feedback-service/feedback/list';
var postFeedbackUrl = 'http://esi.it.csiro.au:3880/csiro-feedback-service/feedback/add';
var bkg = chrome.extension.getBackgroundPage();
var targetIdentifier;
// Global reference to the status display SPAN
var statusDisplay = null;

// Fetching HTML Elements in Variables by ID.
var x = document.getElementById("main_div");
var createform = document.createElement('form'); // Create New Element Form
createform.setAttribute("id", "feedback");
// createform.setAttribute("action", ""); // Setting Action Attribute on Form
createform.setAttribute("method", "post"); // Setting Method Attribute on Form
createform.setAttribute("enctype", "multipart/form-data");
x.appendChild(createform);

// var heading = document.createElement('h2'); // Heading of Form
// heading.innerHTML = "User Feedback Form";
// createform.appendChild(heading);

// var line = document.createElement('hr'); // Giving Horizontal Row After
// Heading
// createform.appendChild(line);

// create feedbacktype
var namelabel = document.createElement('label');
namelabel.innerHTML = "Type : ";
createform.appendChild(namelabel);
var request_button = makeRadioButton("feedbacktype", "request", "Request",
		"Feature or Data Request");
var userexp_button = makeRadioButton("feedbacktype", "userexperience",
		"User Experience", "Data Application or Error Report");
// var rating_button = makeRadioButton("feedbacktype", "rating","Ratings",
// "Ratings", true);
var others_button = makeRadioButton("feedbacktype", "general", "Other",
		"General Comment, Clarification, Suggestion");
createform.appendChild(request_button);
createform.appendChild(userexp_button);
// createform.appendChild(rating_button);
createform.appendChild(others_button);

var brbreak = document.createElement('br');
createform.appendChild(brbreak);
createform.appendChild(brbreak);
var pbreak = document.createElement('p');
createform.appendChild(pbreak);

var emailTxt = makeTextBox("text", "eml", "Email\u00A0\u00A0\u00A0",
		"Contact email", 30);
createform.appendChild(emailTxt);

var anoyBox = makeCheckbox("anonymous", "Anonymous",
		"Your email will appear as 'anonymous' on published feedback.")
createform.appendChild(anoyBox);
createform.appendChild(brbreak);
createform.appendChild(brbreak);
createform.appendChild(pbreak);
var doiTxt = makeTextBox("text", "doi", "Target\u00A0", "DOI (auto-detected)",
		30);
createform.appendChild(doiTxt);

var label = document.createElement("label");
label.style.height = "150px";
label.style.padding = "10px";
var txt = document.createElement("textarea");
txt.id = "message";
txt.name = "message";
txt.title = "Feedback details";
txt.setAttribute("required", "");
label.appendChild(document.createTextNode("Your message"));
label.appendChild(txt);
label.appendChild(pbreak);
createform.appendChild(label);
// hidden values
var urlelement = document.createElement('input');
urlelement.setAttribute("type", "hidden");
urlelement.setAttribute("id", "url");
var ownerelement = document.createElement('input');
ownerelement.setAttribute("type", "hidden");
ownerelement.setAttribute("id", "owner");
var titleelement = document.createElement('input');
titleelement.setAttribute("type", "hidden");
titleelement.setAttribute("id", "title");
createform.appendChild(ownerelement);
createform.appendChild(titleelement);
createform.appendChild(urlelement);

// related documents
var uploadlabel = document.createElement('label'); // Append Textarea
uploadlabel.style.padding = "15px";
uploadlabel.innerHTML = "Related Documents : ";
var upLoadMsg = document.createElement("span");
upLoadMsg.setAttribute("id", "file-display");
upLoadMsg.style.fontSize = "xx-small";
var upLoadElement = document.createElement("input");
upLoadElement.setAttribute("type", "file");
upLoadElement.setAttribute("id", "attachFiles");
upLoadElement.setAttribute("name", "files");
upLoadElement.setAttribute("multiple", "multiple");
upLoadElement.style.color = "transparent";

uploadlabel.appendChild(upLoadElement);
uploadlabel.appendChild(upLoadMsg);
createform.appendChild(uploadlabel);
document.getElementById('attachFiles').addEventListener('change',
		prepareUpload, false);
createform.appendChild(brbreak);
createform.appendChild(pbreak);

var divButton = document.createElement("div");

// submit button
var submitelement = document.createElement('input'); // Append Submit Button
submitelement.setAttribute("type", "submit");
submitelement.setAttribute("name", "dsubmit");
submitelement.setAttribute("value", "Submit");
createform.appendChild(submitelement);

addGap();

// clear button
var clearelement = document.createElement('input'); // Append Reset Button
clearelement.setAttribute("type", "button");
clearelement.setAttribute("name", "dclear");
clearelement.setAttribute("id", "dclear");
clearelement.setAttribute("value", "Clear");
createform.appendChild(clearelement);

function makeTextBox(type, name, text, tooltip, size) {
	var label = document.createElement("label");
	var txt = document.createElement("input");
	txt.type = type;
	txt.id = name;
	txt.name = name;
	txt.size = size;
	txt.title = tooltip;
	txt.setAttribute("required", "");
	label.appendChild(document.createTextNode(text));
	label.appendChild(txt);
	return label;
}

function makeRadioButton(name, value, text, tooltip) {
	var label = document.createElement("label");
	var radio1 = document.createElement("input");
	radio1.type = "radio";
	radio1.id = name;
	radio1.name = name;
	radio1.value = value;
	radio1.title = tooltip;
	radio1.setAttribute("required", "");
	label.appendChild(radio1);
	label.appendChild(document.createTextNode(text));
	return label;
}

function makeCheckbox(name, text, tooltip) {
	var label = document.createElement("label");
	var chk = document.createElement("input");
	chk.type = "checkbox";
	chk.id = name;
	chk.name = name;
	chk.title = tooltip;
	label.appendChild(chk);
	label.appendChild(document.createTextNode(text));
	return label;
}

function addGap() {
	var divbreak = document.createElement('div');
	divbreak.setAttribute("class", "divider");
	createform.appendChild(divbreak);
}

/* Update the relevant fields with the new data */
function setDOMInfo(info) {
	var url = chrome.extension.getBackgroundPage().myURL;
	if (info) {
		document.getElementById('doi').value = info.doi;
		document.getElementById('owner').value = info.owner;
		document.getElementById('title').value = info.title;
		document.getElementById('url').value = url;
		targetIdentifier = info.doi;
	}
}

// POST the data to the server using XMLHttpRequest
function addFeedback() {
	// Set up an asynchronous AJAX POST request
	var xhr = new XMLHttpRequest();
	xhr.open('POST', postFeedbackUrl, true);
	// xhr.setRequestHeader('Content-type', 'multipart/form-data');

	var type = document.querySelector('input[name = "feedbacktype"]:checked').value;
	var email = document.getElementById('eml').value;
	var doi = document.getElementById('doi').value;
	var message = document.getElementById('message').value;
	var url = document.getElementById('url').value;
	var owner = document.getElementById('owner').value;
	var title = document.getElementById('title').value;

	// Prepare the data to be POSTed by URLEncoding each field's contents
	var isPublic = "1";
	var anony = $('input[name="anonymous"]:checked').length > 0;

	if (anony) {
		isPublic = 0;
	}

	var formdata = new FormData();
	formdata.append("type", type);
	formdata.append("email", email);
	formdata.append("doi", doi);
	formdata.append("message", message);
	formdata.append("url", url);
	formdata.append("owner", owner);
	formdata.append("title", title);
	formdata.append("ispublic", isPublic);

	var files = document.getElementById('attachFiles').files;
	for (i = 0, j = files.length; i < j; i++) {
		formdata.append('files' + i, files[i]);
	}

	// Handle request state change events
	xhr.onreadystatechange = function() {
		// If the request completed
		if (xhr.readyState == 4) {
			statusDisplay.innerHTML = '';
			if (xhr.status == 200 || xhr.status == 201) {
				// If it was a success, close the popup after a short delay
				statusDisplay.innerHTML = 'Saved!';
				// window.setTimeout(window.close, 1000);
				document.getElementById("file-display").innerHTML = "";
				//document.getElementById("feedback").reset();
				OnReset();
			} else {
				// Show what went wrong
				statusDisplay.innerHTML = 'Error saving ' + xhr.responseText;
			}
			hideDiv("status-display", 1500)
		}
	};

	// Send the request and set status
	xhr.send(formdata);
	statusDisplay.innerHTML = 'Saving...';
}

function hideDiv(elementID, timeout) {
	window.setTimeout(function() {
		document.getElementById(elementID).style.display = "none";
	}, timeout);
}

function OnReset() {
	document.getElementById("eml").value = "";
	document.getElementById("message").value = "";
	document.getElementById("file-display").innerHTML = "";
	var input = $("#attachFiles");
	input.replaceWith(input.val('').clone(true));
	$('input:checkbox').removeAttr('checked');
	$('input[name=feedbacktype]').attr('checked',false);
}

function displayAllFeedback() {
	var doi = document.getElementById('doi').value;
	if (doi != "") {
		var url = getFeedbackUrl + "?doi=" + doi;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onreadystatechange = function() {
			// If the request completed
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					var str = '{"val1": 1, "val2": 2, "val3": 3}';
					var obj = jQuery.parseJSON( str );
				
					var out = "<table style=\"border-collapse:collapse; table-layout:fixed; width:380px;\">";
					out += "<tr style=\"background-color:#2BC1F2;color:white;\"><th>Type</th>";
					out += "<th>Date</th>";
					out += "<th>User</th>";
					out += "<th>Details</th>";
					out += "<th>Files</th></tr>";
					var obj = JSON.parse(xhr.responseText);

					// var str = JSON.stringify(xhr.responseText, null, 2);
					for ( var key in obj.results) { // key - primary key of
						// feedback
						out += "<tr>";
						var values = obj.results[key];
						out += "<td>" + values.date + "</td>";
						out += "<td>" + values.type + "</td>";
						out += "<td>" + values.user + "</td>";
						out += "<td>" + values.details + "</td>";
						if (typeof values === 'object') {
							var links = "";
							for (var i = 0; i < values.files.length; i++) {
								links += "<a  target=\"_blank\" href=\""
										+ values.files[i] + "\">" + "File" + i
										+ "</a><br>"
							}
							out += "<td>" + links + "</td>";
						}
					}
					out += "</table>";
					document.getElementById("feedback-list").innerHTML = out;
				} else {
					// Show what went wrong
					document.getElementById("feedback-list").innerHTML = 'Error GetFeedback: '
							+ xhr.statusText;
				}
			}
		};
		xhr.send();
	} else {
		document.getElementById("feedback-list").innerHTML = 'DOI cannot be detected! ';
	}
}

/* Once the DOM is ready... */
window.addEventListener('DOMContentLoaded', function() {
	
	
	// Cache a reference to the status display SPAN
	statusDisplay = document.getElementById('status-display');
	// Handle the bookmark form submit event with our addBookmark
	// function
	// document.getElementById('feedback').addEventListener('submit',addFeedback);
	$("#feedback").on('submit', function(e) {
		var isvalidate = $("#feedback").valid();
		if (isvalidate) {
			e.preventDefault();
			addFeedback();
		}
	});

	document.getElementById('dclear').addEventListener('click', OnReset);
	document.getElementById('tab-2').addEventListener('click',
			displayAllFeedback);

	/* ...query for the active tab... */
	chrome.tabs.query({
		active : true,
		currentWindow : true
	}, function(tabs) {
		/* ...and send a request for the DOM info... */
		chrome.tabs.sendMessage(tabs[0].id, {
			from : 'popup',
			subject : 'DOMInfo'
		},
		/*
		 * ...also specifying a callback to be called from the receiving end
		 * (content script)
		 */
		setDOMInfo);
	});
});

$(document).ready(function() {
	$("#feedback").validate({
		ignoreTitle : true,
		rules : {
			type : {
				required : true
			},
			doi : {
				required : true
			},
			eml : {
				required : true,
				email : true
			},
			message : {
				required : true,
			}
		},
		errorPlacement : function(error, element) {
			return true;
		}
	});
});

function prepareUpload() {
	var x = document.getElementById("attachFiles");
	var txt = "<p>";
	if ('files' in x) {
		if (x.files.length == 0) {
			txt = "Select one or more files.";
		} else {
			for (var i = 0; i < x.files.length; i++) {
				// txt += "<br><strong>" + "File " +(i+1) + +" :</strong>";
				var file = x.files[i];
				if ('name' in file) {
					txt += file.name + " ";
				}
				if ('size' in file) {
					txt += " [" + file.size + " bytes] <br>";
				}
			}
		}
	}
	/*
	 * else { if (x.value == "") { txt += "Select one or more files."; } else {
	 * txt += "The files property is not supported by your browser!"; txt += "<br>The
	 * path of the selected file: " + x.value; // If the browser does not
	 * support the files property, it will return the path of the selected file
	 * instead. } }
	 */
	document.getElementById("file-display").innerHTML = txt;
}
