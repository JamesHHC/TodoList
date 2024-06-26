// GLOBAL VARIABLES /////////////////////////////////////////////////////////////////////////////////////////

var tracking_num = parseInt(Date.now());
var currentSort = "default";
var dragEnabled = true;
var dragging = null;
var darkmode = false;

// FUNCTIONS ////////////////////////////////////////////////////////////////////////////////////////////////

// Creates a new item in the todo list
function createListItem(desc, due, priority, idnum) {
	var priorityHTML = "";
	var dueHTML = "";
	switch(priority) {
		case 1:
			priorityHTML = '<span class="badge bg-info rounded-pill v-middle">Low</span>';
			break;
		case 2:
			priorityHTML = '<span class="badge bg-warning rounded-pill v-middle">Med</span>';
			break;
		case 3:
			priorityHTML = '<span class="badge bg-danger rounded-pill v-middle">High</span>';
			break;
		default:
			break;
	}
	if (due) dueHTML = '<span class="badge bg-secondary rounded-pill v-middle">'+due+'</span> ';
	var item = '<li class="d-flex list-group-item p-3 overflow-hidden" draggable="true" id="'+idnum+'">'+
					'<button type="button" class="inln btn btn-outline-success" style="height: 50px; width:50px" onclick="deleteListItem('+idnum+');">'+
						'<svg xmlns="http://www.w3.org/2000/svg" width="25" height="34" fill="currentColor" class="bi bi-check btn-icon" viewBox="0 0 16 16">'+
							'<path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>'+
						'</svg>'+
					'</button>'+
					'<div id="todo-info-div">'+
						'<p class="inln p-2 normal-a v-middle">'+desc+'</p>'+
						dueHTML+
						priorityHTML+
					'</div>'+
				'</li>';
	var list = document.getElementById("todo-list");
	list.innerHTML += item;
}

// Deletes an existing item in the todo list
async function deleteListItem(idnum) {
	document.getElementById(''+idnum).remove();
	await deleteData(idnum);
}

// Function to run when the form for creating a new todo list item is submitted
function submitItemForm() {
	var desc = document.getElementById("inputDesc");
	var due = document.getElementById("dueDate");
	var priority = document.getElementById("selectPriority");
	var priorityv = 0; // It's easier to sort by a number
	var descInput = document.getElementById("inputDesc");
	switch(priority.value) {
		case "High":
			priorityv = 3;
			break;
		case "Medium":
			priorityv = 2;
			break;
		case "Low":
			priorityv = 1;
			break;
		default:
			priorityv = 0;
			break;
	}
	if (!descInput.checkValidity()) {
		descInput.classList.add("is-invalid");
		return;
	}
	createListItem(desc.value, due.value, priorityv, tracking_num);
	saveData(desc.value, due.value, priorityv, tracking_num);
	resort();
	$("#item-modal").modal('hide');
	tracking_num++;
	desc.value = "";
	due.value = "";
	priority.value = "None";
	descInput.classList.remove("is-invalid");
}

// Function to run when the form for creating a new todo list item is cancelled
function cancelItemForm() {
	$("#item-modal").modal('hide');
	document.getElementById("inputDesc").value = "";
	document.getElementById("dueDate").value = "";
	document.getElementById("selectPriority").value = "None";
	document.getElementById("inputDesc").classList.remove("is-invalid");
}

// Save data to the db
function saveData(text, due, priority, idnum) {
	var doc = {
		txt: text,
		due: due,
		pri: priority,
		idn: idnum
	};
	window.electronAPI.save(doc);
}

// Remove data from the db
function deleteData(idnum) {
	window.electronAPI.delete(idnum);
}

// Sorts by ID number to put in order created, to be used by customSort
async function idSort() {
	document.getElementById("todo-list").innerHTML = "";
	var data = await window.electronAPI.load();
	data.sort(function(a,b) { 
		// Compare IDs
		return a.idn - b.idn;
	});
	for (var i = 0; i < data.length; i++) {
		createListItem(data[i]["txt"], data[i]["due"], data[i]["pri"], data[i]["idn"]);
	}
}

// Sorts by priority, secondary sort by ID
async function prioritySort() {
	if (document.getElementById("todo-list").innerHTML.trim() == "") return;
	currentSort = "priority";
	dragEnabled = false;
	document.getElementById("todo-list").innerHTML = "";
	var data = await window.electronAPI.load();
	var oData = await window.electronAPI.loadOrder();
	data.sort(function(a,b) {
		var ref = oData[0]["data"];
		var a_int = parseInt(a.idn);
		var b_int = parseInt(b.idn);
		// Check if item is new
		if ((a.pri == 0 && ref.indexOf(a_int) == -1) && !(b.pri == 0 && ref.indexOf(b_int) == -1)) return 1;
		else if (!(a.pri == 0 && ref.indexOf(a_int) == -1) && (b.pri == 0 && ref.indexOf(b_int) == -1)) return -1;
		// Compare priority values
		else if (b.pri > a.pri) return 1;
		else if (b.pri < a.pri) return -1;
		else { // Secondary sort by custom order
			if (ref.indexOf(a_int) > ref.indexOf(b_int)) return 1;
			else if (ref.indexOf(a_int) < ref.indexOf(b_int)) return -1;
			else { // Tertiary sort by ID
				if (a.idn > b.idn) return 1;
				else if (a.idn < b.idn) return -1;
				else return 0;
			}
		}
	});
	for (var i = 0; i < data.length; i++) {
		createListItem(data[i]["txt"], data[i]["due"], data[i]["pri"], data[i]["idn"]);
	}
}

// Sorts by due date, secondary sort by ID
async function dateSort() {
	if (document.getElementById("todo-list").innerHTML.trim() == "") return;
	currentSort = "date";
	dragEnabled = false;
	document.getElementById("todo-list").innerHTML = "";
	var data = await window.electronAPI.load();
	var oData = await window.electronAPI.loadOrder();
	data.sort(function(a,b) { 
		var ref = oData[0]["data"];
		var a_int = parseInt(a.idn);
		var b_int = parseInt(b.idn);
		// Check if item is new
		if ((a.pri == 0 && ref.indexOf(a_int) == -1) && !(b.pri == 0 && ref.indexOf(b_int) == -1)) return 1;
		else if (!(a.pri == 0 && ref.indexOf(a_int) == -1) && (b.pri == 0 && ref.indexOf(b_int) == -1)) return -1;
		// Check if a date is missing
		else if (a.due.trim() == "" && b.due.trim() != "") return 1; 
		else if (a.due.trim() != "" && b.due.trim() == "") return -1;
		else { // Compare dates
			if (new Date(a.due) > new Date(b.due)) return 1;
			else if (new Date(a.due) < new Date(b.due)) return -1;
			else { // Secondary sort by custom order
				if (ref.indexOf(a_int) > ref.indexOf(b_int)) return 1;
				else if (ref.indexOf(a_int) < ref.indexOf(b_int)) return -1;
				else { // Tertiary sort by ID
					if (a.idn > b.idn) return 1;
					else if (a.idn < b.idn) return -1;
					else return 0;
				}
			}
		}
	});
	for (var i = 0; i < data.length; i++) {
		createListItem(data[i]["txt"], data[i]["due"], data[i]["pri"], data[i]["idn"]);
	}
}

// Function for refreshing the list according to the current sort method
function resort() {
	switch(currentSort) {
		default:
		case "custom":
			customSort();
			break;
		case "priority":
			prioritySort();
			break;
		case "date":
			dateSort();
			break;
	}
}

// Sorts by custom order, secondary sort by ID
async function customSort() {
	currentSort = "custom";
	document.getElementById("todo-list").innerHTML = "";
	var data = await window.electronAPI.load();
	var oData = await window.electronAPI.loadOrder();
	if (oData.length == 0) { // No data? Default to idSort
		console.log("No order data found, sorting by ID");
		await idSort();
		if (document.getElementById("todo-list").innerHTML.trim() == "") return;
		await saveListOrder();
		return;
	}
	data.sort(function(a,b) {
		var ref = oData[0]["data"];
		var a_int = parseInt(a.idn);
		var b_int = parseInt(b.idn);
		// Check if one value not in reference array
		if (ref.indexOf(a_int) == -1 && ref.indexOf(b_int) != -1) return 1;
		else if (ref.indexOf(a_int) != -1 && ref.indexOf(b_int) == -1) return -1;
		else { // Compare values based on position in reference array
			if (ref.indexOf(a_int) > ref.indexOf(b_int)) return 1;
			else if (ref.indexOf(a_int) < ref.indexOf(b_int)) return -1;
			else { // Secondary sort by ID
				if (a_int > b_int) return 1;
				else if (a_int < b_int) return -1;
				else return 0;
			}
		}
	});
	for (var i = 0; i < data.length; i++) {
		createListItem(data[i]["txt"], data[i]["due"], data[i]["pri"], data[i]["idn"]);
	}
	saveListOrder();
	dragEnabled = true;
}

// Saves current list order as custom order
function saveListOrder() {
	if (currentSort != "custom") return;
	var orderArr = [];
	var tList = document.getElementById('todo-list');
	var tItems = tList.querySelectorAll('li');

	for (var i = 0; i < tItems.length; i++) {
		orderArr.push(parseInt(tItems[i].id));
	}
	var doc = {
		dataCat: 'order',
		data: orderArr
	}
	window.electronAPI.saveOrder(doc);
}

// DRAGGING /////////////////////////////////////////////////////////////////////////////////////////////////

// Item starts being dragged
document.addEventListener('dragstart', function(event) {
	if (!dragEnabled) return;
    var target = getLI(event.target);
    if (target.nodeName == undefined || target.classList.contains('no-drop')) return;
    dragging = target;
    event.dataTransfer.setData('text/plain', null);
    event.dataTransfer.setDragImage(self.dragging,0,0);
});

// Item dragged over target
document.addEventListener('dragover', function(event) {
	if (!dragEnabled) return;
    event.preventDefault();
    var target = getLI(event.target);
    if (target.nodeName == undefined || target.classList.contains('no-drop')) return;
    target.style['background-color'] = (darkmode) ? '#34383B' : '#F2F2FC';
});

// Item no longer dragged over target
document.addEventListener('dragleave', function(event) {
	if (!dragEnabled) return;
    var target = getLI(event.target);
    if (target.nodeName == undefined || target.classList.contains('no-drop')) return;
    target.style['background-color'] = '';
});

// Inserts item in new location (drops on target)
document.addEventListener('drop', function(event) {
	if (!dragEnabled) return;
    event.preventDefault();
    var target = getLI(event.target);
    if (target.nodeName == undefined || target.classList.contains('no-drop')) return;
    var bounding = target.getBoundingClientRect();
    var offset = bounding.y + (bounding.height/2);
    if (event.clientY - offset > 0) {
        target.style['background-color'] = '';
        target.parentNode.insertBefore(dragging, event.target.nextSibling);
    }
    else {
        target.style['background-color'] = '';
        target.parentNode.insertBefore(dragging, event.target);
    }
    saveListOrder();
});

// Gets list item
function getLI(target) {
    while (target.nodeName.toLowerCase() != 'li' && target.nodeName.toLowerCase() != 'body') {
        target = target.parentNode;
    }
    if (target.nodeName.toLowerCase() == 'body') {
        return false;
    }
    else {
        return target;
    }
}

// Retrieves saved color mode, defaults to light
async function loadColorMode() {
	var colorMode = await window.electronAPI.loadMode();
	if (colorMode.length == 0) return "light";
	else return colorMode[0].data;
}

// SCRIPT START /////////////////////////////////////////////////////////////////////////////////////////////

// Runs when webpage loaded
window.onload = async (event) => {
	// Initial sort
	customSort();

	// Load color mode
	switch(await loadColorMode())
	{
		case "light":
			document.getElementById('page-html').dataset.bsTheme = "light";
			document.getElementById('main-navbar').classList.add('bg-light');
			break;
		case "dark":
			document.getElementById('page-html').dataset.bsTheme = "dark";
			document.getElementById('main-navbar').classList.add('bg-dark');
			document.getElementById('d-switch').checked = true;
			break;
	}

	// Update color mode
	$("#darkmode-check").change(function () {
		var mainNav = document.getElementById('main-navbar');
    	if (document.getElementById('d-switch').checked) {
    		darkmode = true;
    		document.getElementById('page-html').dataset.bsTheme = "dark";
    		mainNav.classList.add('bg-dark');
    		mainNav.classList.remove('bg-light');
    		window.electronAPI.saveMode("dark");
    	}
    	else {
    		darkmode = false;
    		document.getElementById('page-html').dataset.bsTheme = "light";
    		mainNav.classList.add('bg-light');
    		mainNav.classList.remove('bg-dark');
    		window.electronAPI.saveMode("light");
    	}
    });
}