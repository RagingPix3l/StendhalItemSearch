var types = JSON.parse("[\"armors\",\"arrows\",\"axes\",\"books\",\"boots\",\"boxes\",\"capturetheflag\",\"cloaks\",\"clubs\",\"containers\",\"crystals\",\"documents\",\"drinks\",\"dummy_weapons\",\"flowers\",\"food\",\"helmets\",\"herbs\",\"jewellery\",\"keys\",\"legs\",\"miscs\",\"missiles\",\"money\",\"ranged\",\"relics\",\"resources\",\"rings\",\"scrolls\",\"shields\",\"special\",\"swords\",\"tokens\",\"tools\"]");


  let ce = document.createElement.bind(document);
  let append = function (what,where) { 
    where = where || document.body;
    where.appendChild(what);
  };

window.addEventListener("load", init);

function init(){
  let typesContainer = ce("div");
  typesContainer.id ="container";
  append(typesContainer);
  let selectType = ce("select");
  let dummyoption = ce("option");
  dummyoption.value = -1;
  dummyoption.innerHTML = ("--select one--");
  append(dummyoption,selectType);
  for (var i = 0; i<types.length;++i){
    let option = ce("option");
    option.innerHTML = option.value = types[i];
    append(option,selectType);
  }
  append(selectType,typesContainer);
  selectType.autocomplete = "off";
  selectType.addEventListener("change", typeSelectChange);
  let items = ce("div");
  items.id = "items";
  append(items,typesContainer);
}

var oldSortColumn = -1;
var sortOrder = "asc";
let sortColumnIndex = 0;

function sortBy(e) {
    let target = e.target;
    let tr = target.parentNode;
    for (var i = 0,n = tr.childNodes.length;i<n;++i){
        if (tr.childNodes[i] == target){
          sortColumnIndex = i;
          break;
        }
    }

    let table = document.getElementsByTagName("table")[0];
    let rows = table.getElementsByTagName("tr");

    rows = Array.prototype.slice.call(rows,1);
    for (var i = 0;i<rows.length;++i){
        table.removeChild(rows[i]);
    }

    if (oldSortColumn == sortColumnIndex) {
        if (sortOrder == "asc") {
            sortOrder = "desc";
        }else{
            sortOrder = "asc";
        }
    }else {
      sortOrder = "asc";
    }

    var comparator = function (a,b) {
        a = a.getElementsByTagName("td")[sortColumnIndex].innerText;
        b = b.getElementsByTagName("td")[sortColumnIndex].innerText;
        let ia = parseFloat(a);
        let ib = parseFloat(b);
        let r = 0;
        if (!isNaN(ia)){
            if (!isNaN(ib)){
                r = ia - ib;
            }else{
                ib = 0;
                r = ia - ib;
            }
        }else {
            if (!isNaN(ib)){
                ia = 0;
                r = ia - ib;
            }else{
                r = (""+a).localeCompare(""+b);
            }
        }
        if (sortOrder != "asc") {
            r = -1 * r;
        }
        return r;
    }

    Array.prototype.sort.call(rows, comparator);
    for (var i = 0;i<rows.length;++i){
        table.appendChild(rows[i]);
    }
    oldSortColumn = sortColumnIndex;
}

async function typeSelectChange(e) {
  if (e.target.value == -1){
    return;
  }
  try {
  //let myRequest = "xml.php?file=" + e.target.value;
    let myRequest = "data/conf/items/" + e.target.value + ".xml";
    const response = await fetch(myRequest);
    const xml = await response.text();
    const parser = new DOMParser();
    const xmlDoc  = parser.parseFromString(xml,'text/xml');
    let itemsDiv = document.getElementById("items");
    itemsDiv.innerHTML = "";
    let attributes = {};
    let attributeCount = 1;
    let items = xmlDoc.getElementsByTagName("item");
    for (var i = 0;i<items.length;++i){
      let itemAttributes = items[i].getElementsByTagName("attributes");
      if (itemAttributes.length == 1){
        itemAttributes = itemAttributes[0];
        for (let j = 0;j<itemAttributes.children.length;++j){
            attributes[itemAttributes.children[j].nodeName] = attributes[itemAttributes.children[j].nodeName] || attributeCount++;
        }
        
      }
      let resistances = items[i].getElementsByTagName("resistance");
      for (var j = 0;j<resistances.length;++j){
          attributes[resistances[j].attributes[0].nodeValue] = attributes[resistances[j].attributes[0].nodeValue] || attributeCount++;
      }

      let elementalResistances = items[i].getElementsByTagName("susceptibility");
        for (var j = 0;j<elementalResistances.length;++j){
            attributes[elementalResistances[j].attributes[0].nodeValue] = attributes[elementalResistances[j].attributes[0].nodeValue] || attributeCount++;
        }

    }

    let table = ce("table");
    let thead = ce("thead");
    let tr = ce("tr");
    let td = ce("th");

    append(thead,table);
    append(tr,thead);
    append(td,tr);
    td.innerHTML = "name";

    td.addEventListener("click", sortBy);
    for (var i in attributes){
      td = ce("th");
      append(td,tr);
      td.innerHTML = i;
      td.addEventListener("click", sortBy);
    }

    for (var i = 0;i<items.length;++i){
      let tr = ce("tr");
      let td = ce("td");
      append(td,tr);
      let img = ce("img");
      let type = items[i].getElementsByTagName("type")[0];
      img.src ="https://stendhalgame.org/images/item/" + type.attributes[0].nodeValue  + "/" + type.attributes[1].value.replace(/ /g,"_") + ".png";
      const homepage = "https://stendhalgame.org/item/" + type.attributes[0].nodeValue + "/" + items[i].attributes[0].value.replace(/ /g,"_") + ".html";
      append(img,td);
      append(td,tr);
      td.innerHTML += "<a href=\"" + homepage + "\" target='_blank'>" + items[i].attributes[0].value + "</a>";
      append(tr,table);
      let itemAttributes = items[i].getElementsByTagName("attributes");
      let allAttributes = [];
    
      if (itemAttributes.length==1){
        itemAttributes = itemAttributes[0];
        for (var j = 0;j<itemAttributes.children.length;++j){
          let attributeName = itemAttributes.children[j].nodeName;
          allAttributes[attributes[attributeName]] = itemAttributes.children[j].attributes[0].nodeValue;
          }

      }
      let resistances = items[i].getElementsByTagName("resistance");
      for (var j = 0;j<resistances.length;++j){
          let attributeName = resistances[j].attributes[0].nodeValue;
          let value = resistances[j].attributes[1].nodeValue;
          allAttributes[attributes[attributeName]] = value;
      }

        let elementalResistances = items[i].getElementsByTagName("susceptibility");
        for (var j = 0;j<elementalResistances.length;++j){
            let attributeName = elementalResistances[j].attributes[0].nodeValue;
            let value = elementalResistances[j].attributes[1].nodeValue;
            allAttributes[attributes[attributeName]] = value;
        }

        for (var j=1;j<=attributeCount;++j){
            td = ce("td");
            td.innerHTML = allAttributes[j] || "";
            append(td,tr);
        }
    }
    append(table,itemsDiv);
  } catch (ex) {
    console.log(ex);
  }
}
