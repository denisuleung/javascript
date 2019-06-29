/*********
INITIALIZE
**********/
function init(){

};

init();

/***************
AUTO GENERATE NO
***************/
function generateNo(){
  /* auto generate number after add row or delete row */
  var rowCount = document.getElementById('timeRecordTable').getElementsByTagName('tr');
  for (var i = 1; i < rowCount.length; i++) {
    var genNoDOM = document.getElementById('timeRecordTable').getElementsByTagName('tr')[i].getElementsByTagName('td')[0];
    genNoDOM.innerHTML = i;
  }
}

/*************
INPUT HANDLING
**************/
function addRow(r){
  var recordTable = document.getElementById('timeRecordTable');
  var newRowHTML = recordTable.getElementsByTagName('tr')[1].innerHTML;
  recordTable.insertRow(-1).innerHTML = newRowHTML
  generateNo();
}

function deleteRow(r) {
  var rowCount = r.parentNode.parentNode.parentNode.children.length;
  if (rowCount > 2){
    var i = r.parentNode.parentNode.rowIndex;
    document.getElementById("timeRecordTable").deleteRow(i);
  }
  generateNo();
}

/**************
RESULT HANDLING
***************/
function checkConfilct(arr, day, period){
  for (j = 0; j < arr.length; j++) {
    if (arr[j][0] === day && arr[j][1] === period){
      return true;
    }
  }
  return false;
}

function findNextTimeslot(day, period){
  var dayList = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var periodList = ['Midnight','AM','PM','Night'];
  if (periodList.indexOf(period) + 1 >= periodList.length){
    if (dayList.indexOf(day) + 1 >= dayList.length){
      return [dayList[0], periodList[0]];
    } else {
      return [dayList[dayList.indexOf(day) + 1], periodList[0]];
    }
  } else {
    return[dayList[dayList.indexOf(day)], periodList[periodList.indexOf(period) + 1]];
  }
}

/* set as global for export usage */
var recordArr = []

function getInput(){
  /* get DOM */
  var tasks = document.querySelectorAll(".task");
  var periods = document.querySelectorAll(".period");
  var days = document.querySelectorAll(".day");
  var funcs = document.querySelectorAll(".func");
  var timetable = document.querySelector(".timetable");

  /* PUSH FIRST RECORD */
  recordArr.push([days[0].value, periods[0].value, funcs[0].value, tasks[0].value]); /* add first row */

  /* HANDLE CONFLICT */
  for (i = 1; i < tasks.length; i++){

    /* check there is conflict with recordArr */
    var conflict = checkConfilct(recordArr, days[i].value, periods[i].value);
    if(conflict){
      alert("The record ( " + days[i].value + " , " + periods[i].value + " , " +
        tasks[i].value + " ) need to be delayed")
    }

    /* push Record to near timeslot until the timeslot is available */
    while (conflict) {
      var timeslotArr = findNextTimeslot(days[i].value, periods[i].value);
      var conflict = checkConfilct(recordArr, timeslotArr[0], timeslotArr[1]);
      days[i].value = timeslotArr[0];
      periods[i].value = timeslotArr[1];
      tasks[i].value =
        (tasks[i].value.includes(" (Delayed)")) ? tasks[i].value : tasks[i].value + " (Delayed)";
    }
    recordArr.push([days[i].value, periods[i].value, funcs[i].value, tasks[i].value]);
  }

  /* CLEAR CACHE */
  /* clear cache for each day */
  var periodList = periods[0].innerText.split(/[\s,]+/);
  periodList.forEach(function(e){
    var datacell = timetable.rows.namedItem(e).cells;
    for (var i = 1; i <= 7; i++) {
      datacell[i].innerHTML = '';
    }
  })

  /* clear cache for all cells color-class attribute */
  for (var i = 1; i <= 7; i++) {
    timetable.rows.namedItem("Midnight").cells[i].removeAttribute("class");
    timetable.rows.namedItem("AM").cells[i].removeAttribute("class");
    timetable.rows.namedItem("PM").cells[i].removeAttribute("class");
    timetable.rows.namedItem("Night").cells[i].removeAttribute("class");
  }

  /* VALUE ADDED */
  /* put on value in timetable by forEach,
    notice that get from record array is not best approach */
  recordArr.forEach(function(record){
    var datacell;
    var dayNum;
    var color;
    switch(record[0]){
      case "Sun": dayNum = 1; break;
      case "Mon": dayNum = 2; break;
      case "Tue": dayNum = 3; break;
      case "Wed": dayNum = 4; break;
      case "Thu": dayNum = 5; break;
      case "Fri": dayNum = 6; break;
      case "Sat": dayNum = 7; break;
      default:
    }
    switch(record[1]) {
      case "Midnight": datacell = timetable.rows.namedItem("Midnight").cells; break;
      case "AM": datacell = timetable.rows.namedItem("AM").cells; break;
      case "PM": datacell = timetable.rows.namedItem("PM").cells; break;
      case "Night": datacell = timetable.rows.namedItem("Night").cells; break;
      default:
    }
    switch(record[2]){
      case "Work": color = "bg-warning"; break;
      case "Entertainment": color = "bg-success";break;
      case "Necessity": color = "bg-info"; break;
      case "Sleep": color = "bg-primary"; break;
      case "NA": color = "bg-light"; break;
      default:
    }

    // add class with color
    datacell[dayNum].classList.toggle(color);
    datacell[dayNum].innerHTML = record[3];
  })
}

// MUST USE addEventListener
document.querySelector(".submit").addEventListener("click", function(){
  getInput();
});

/***********
EXPORT RESULT
************/
function exportOutput(){
  let csvContent = "data:text/csv;charset=utf-8,";

  recordArr.forEach(function(rowArray){
    let row = rowArray.join('\t\t\t');
    csvContent += row + "\r\n";
  })

  var encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}

document.querySelector(".export").addEventListener("click", function(){
  exportOutput();
});

/***********
CLEAR RESULT
************/
function clearInput(){
  /* clear till to only 1 row */
  var row = document.getElementById('timeRecordTable').getElementsByTagName('tr');
  for (var i = row.length - 1; i > 1; i--) {
    document.getElementById("timeRecordTable").deleteRow(i);
  }

  /* clear first row data by add new and delete old row */
  addRow(1);
  document.getElementById("timeRecordTable").deleteRow(1);

  /* generate no */
  generateNo();
}

document.querySelector(".clear").addEventListener("click", function(){
  clearInput();
});
