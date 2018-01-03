(function () {


  const app = {
    locations: {},
    locationTableContainer: document.querySelector('.mdc-data-table > tbody')
  };


  // demo menu
  var menuEl = document.querySelector('#demo-menu');
  var MDCSimpleMenu = mdc.menu.MDCSimpleMenu;
  var menu = new MDCSimpleMenu(menuEl);
  var toggle = document.querySelector('.toggle');
  toggle.addEventListener('click', function () {
    menu.open = !menu.open;
  });


  // Persistent drawer
  var drawerEl = document.querySelector('.mdc-persistent-drawer');
  var MDCPersistentDrawer = mdc.drawer.MDCPersistentDrawer;
  var drawer = new MDCPersistentDrawer(drawerEl);

  document.querySelector('.menu').addEventListener('click', function (evt) {
    drawer.open = !drawer.open;
  });
  drawerEl.addEventListener('MDCPersistentDrawer:open', function () {
    console.log('Received MDCPersistentDrawer:open');
  });
  drawerEl.addEventListener('MDCPersistentDrawer:close', function () {
    console.log('Received MDCPersistentDrawer:close');
  });



  //search function
  var searchBox = document.getElementById('search-box');
  searchBox.addEventListener('keyup', function (evt) {
    evt.preventDefault();
    let input = searchBox.value;
    let filter = input.toLowerCase();
    let table = document.querySelector('.mdc-data-table');
    let tbody = document.querySelector('.mdc-data-table > tbody');
    let rows = tbody.getElementsByTagName('tr');

    for (var i = 0; i < rows.length; i++) {

      let name_column = rows[i].getElementsByTagName('td')[1];
      let locality_column = rows[i].getElementsByTagName('td')[3];
      let state_column = rows[i].getElementsByTagName('td')[4];
      console.log(state_column);
      if (name_column || state_column) {
        if ((state_column.innerHTML.toLowerCase().indexOf(filter) > -1) || (name_column.innerHTML.toLowerCase().indexOf(filter) > -1) || (locality_column.innerHTML.toLowerCase().indexOf(filter) > -1)) {
          rows[i].style.display = '';
        } else {
          rows[i].style.display = 'none';
        }
      }

    }

  });

  //sort table function
  // @param: column_number : number
  // 
  app.sortTable = function (column_number, dir) {

    let table, rows, switching, i, x, y, shouldSwitch, switchcount = 0;
    table = document.querySelector('.mdc-data-table');
    let column = table.getElementsByTagName('th')[column_number];
    switching = true;
    // set the sorting direction
    // dir = 'asc';
    /* Make a loop that will continue until no switching has been done: */
    while (switching) {
      switching = false;
      rows = table.getElementsByTagName('tr');
      /* Loop through all table rows (except the first, which contains table headers): */
      for (i = 1; i < (rows.length - 1); i++) {

        shouldSwitch = false;
        /* Get the two elements you want to compare, one from current row and one from the next: */
        x = rows[i].getElementsByTagName('td')[column_number];
        y = rows[i + 1].getElementsByTagName('td')[column_number];

        /* Check if the two rows should switch place, based on the direction, asc or desc: */
        if (dir == '0') {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;

            break;
          }
        } else if (dir == '1') {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }

      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        // Each time a switch is done, increase this count by 1: switchcount ++; 
      } else {
        /* If no switching has been done AND the direction is "asc",set the direction to "desc" and run the while loop again. */
        if (switchcount == 0 && dir == 0) {
          dir = 1;
          switching = true;
        }
      }
    }
  }

  // use the table sorting function

  let dataTableHead = document.querySelector('.mdc-data-table > thead');
  let headings = dataTableHead.getElementsByTagName('th');
  Array.prototype.forEach.call(headings, element => {
    element.addEventListener('click', function (evt) {
      evt.preventDefault();
      let el = evt.target;
      let column_number = Array.prototype.indexOf.call(headings, el);
      let sortingDirection = el.getAttribute('data-sort');
      // console.log(sortingDirection);
      if (sortingDirection == '0') {
        el.setAttribute('data-sort', '1');
        el.classList.remove('mdc-data-table__header--sorted-descending');
        el.classList.add('mdc-data-table__header--sorted-ascending');
      } else {
        el.setAttribute('data-sort', '0');
        el.classList.remove('mdc-data-table__header--sorted-ascending');
        el.classList.add('mdc-data-table__header--sorted-descending');
      }

      for (i = 0; i < headings.length; i++) {

        if (i != column_number) {
          // console.log(i);
          headings[i].classList.remove('mdc-data-table__header--sorted-ascending');
          headings[i].classList.remove('mdc-data-table__header--sorted-descending');
        }

      }

      app.sortTable(column_number, sortingDirection);


      // if(evt.target.classList.contains('mdc-data-table__header--sorted-ascending')){
      //   evt.target.classList.remove('mdc-data-table__header--sorted-ascending');
      //   evt.target.classList.add('mdc-data-table__header--sorted-descending');
      // }else{
      //   evt.target.classList.remove('mdc-data-table__header--sorted-descending');
      //   evt.target.classList.add('mdc-data-table__header--sorted-ascending');
      // };
      // sortTable(column_number);
    });
  });






  // Load JSON data to file

  app.loadJSON = function (url, callback) {
    var reqobj = new XMLHttpRequest();
    reqobj.overrideMimeType('application/JSON');
    reqobj.open('GET', url, true);
    reqobj.onreadystatechange = function () {
      if (reqobj.readyState === 4 && reqobj.status == '200') {
        callback(reqobj.responseText);
      }
    }
    reqobj.send(null);
  }



  var LOCATIONS, numberOfRecordsToShow = 5,
    pageCount;


  // function to add list grid item to dashboard
  app.addToList = function (data) {
    var locationItem = app.locations[data.code];
    if (!locationItem) {
      locationItem = app.locationTableContainer.insertRow(-1);
      locationItem.insertCell(0).innerHTML = data.code;
      locationItem.insertCell(1).innerHTML = data.name;
      let addresstextarea = document.createElement('textarea');
      addresstextarea.value = data.address;
      locationItem.insertCell(2).appendChild(addresstextarea);
      locationItem.insertCell(3).innerHTML = data.locality;
      locationItem.insertCell(4).innerHTML = data.state;
      locationItem.insertCell(5).innerHTML = data.postalcode;
      locationItem.insertCell(6).innerHTML = data.primaryphone;
      let additionalphones = document.createElement('textarea');
      additionalphones.value = data.additionalphones;
      locationItem.insertCell(7).appendChild(additionalphones);
      locationItem.insertCell(8).innerHTML = data.website;


      //grab all td elements in your table
      var tds = document.querySelectorAll(".mdc-data-table > tbody td");
      //iterate over each td
      for (var i = 0; i < tds.length; i++) {
        var text = tds[i].innerText;
        //check for your target text
        if (isNaN(text)) {
          //add your class to the element containing this text
          tds[i].classList.add("mdc-data-table__cell--non-numeric");
        }
      }

      app.locations[data.code] = locationItem;
    } else {
      console.log('already added to dashboard');
    }

  }

  app.loadJSON('locations.json', function (response) {
    // parse json data
    LOCATIONS = JSON.parse(response);
    pageCount = Math.ceil(LOCATIONS.length / numberOfRecordsToShow);
    // console.log(LOCATIONS);
    // LOCATIONS.forEach(element => {
    //   app.addToList(element);
    // });
    app.loadPage(1);
    document.querySelector('#buttonList').appendChild(app.addPageButtons(pageCount, 1));
    
    app.sortTable(1);
  });



  // function to load a page

  app.loadPage = function (pageNumber) {

    var startPoint = ((numberOfRecordsToShow * pageNumber) - numberOfRecordsToShow);

    for (i = startPoint; i < (startPoint + numberOfRecordsToShow) && i < LOCATIONS.length; i++) {
      app.addToList(LOCATIONS[i]);
    }
    document.getElementById("id"+pageNumber).classList.add('active');  
  }




  // update online and offline status 

  window.addEventListener('load', function () {

    window.addEventListener('online', app.updateOnlineStatus);
    window.addEventListener('offline', app.updateOnlineStatus);
  });


  app.updateOnlineStatus = function (event) {

    var iconHolder = document.querySelector('.indicator');
    var link = iconHolder.querySelector('a');
    link.classList.add('material-icons');
    link.classList.add('mdc-toolbar__icon');

    if (navigator.onLine) {
      // handle online status
      console.log('online');

      link.setAttribute('aria-label', 'Connected to server');
      link.setAttribute('alt', 'Connected to server');
      link.textContent = 'signal_wifi';

    } else {
      // handle offline status
      console.log('offline');

      link.setAttribute('aria-label', 'Disconnected from server');
      link.setAttribute('alt', 'Diconnected from server');
      link.textContent = 'signal_wifi_off';

    }
  }


  // create page buttons basis page count


  app.createButton = function (Value) {

    pageButton = document.createElement('input');
    pageButton.type = 'button';
    pageButton.value = Value;
    return pageButton;
  }

  app.addPageButtons = function (pageCount, currentPage) {

    var previousButtonDisable = (currentPage == 1) ? true : false;
    var nextButtonDisable = (currentPage == pageCount) ? true : false;

    var buttonList = document.createElement('div');
    previousButton = app.createButton('< prev');
    previousButton.disabled = previousButtonDisable;
    
    buttonList.appendChild(previousButton);

    for (var i = 1; i < pageCount; i++) {
      var pageButton = app.createButton(i);
      pageButton.id = "id"+i;
      // pageButton.addEventListener('click', );      
      buttonList.appendChild(pageButton);
    }

    nextButton = app.createButton('next >');
    nextButton.disabled = nextButtonDisable;
    buttonList.appendChild(nextButton);


    // document.querySelector('#buttonList').appendChild(buttonList);
    return buttonList;

  }



  // addPageButtons(5, 5);
  // serviceworker 

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.register('service-worker.js').then(function () {
  //     console.log('ServiceWorker registration successful with scope: ');
  //   }).catch(function (err) {
  //     //registration failed :(
  //     console.log('ServiceWorker registration failed: ', err);
  //   });
  // } else {
  //   console.log('No service-worker on this browser');
  // }

})();
