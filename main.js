var types = JSON.parse("[\"armors\",\"arrows\",\"axes\",\"books\",\"boots\",\"boxes\",\"capturetheflag\",\"cloaks\",\"clubs\",\"containers\",\"crystals\",\"documents\",\"drinks\",\"dummy_weapons\",\"flowers\",\"food\",\"helmets\",\"herbs\",\"jewellery\",\"keys\",\"legs\",\"miscs\",\"missiles\",\"money\",\"ranged\",\"relics\",\"resources\",\"rings\",\"scrolls\",\"shields\",\"special\",\"swords\",\"tokens\",\"tools\"]");
const basePageURL = "https://stendhalgame.org";

  let ce = document.createElement.bind(document);

  function cext(tag, props) {
      props = props || {};
      const e = ce (tag);
      for (var s in props){
          e[s] = props[s];
      }
      return e;
  }

  let append = function (what,where) { 
    where = where || document.body;
    where.appendChild(what);
  };

window.addEventListener("load", init);

function init(){
  let typesContainer = cext("div",{id :"container"});
  append(typesContainer);
  let selectType = ce("select");
  let dummyoption = cext("option", {
      value : -1,
      innerHTML : "--select one--",
  });
  append(dummyoption,selectType);
  for (var i = 0; i<types.length;++i){
    let option = cext("option",{
        innerHTML : types[i],
        value : types[i],
    });
    append(option,selectType);
  }
  append(selectType,typesContainer);
  selectType.autocomplete = "off";
  selectType.addEventListener("change", typeSelectChange);
  let items = cext("div",{
      id:"items",
  });
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

function parseResistances(allAttributes, attributes, item, type) {
    let resistances = item.getElementsByTagName(type);
    for (var j = 0;j<resistances.length;++j){
        let attributeName = resistances[j].attributes[0].nodeValue;
        let value = resistances[j].attributes[1].nodeValue;
        allAttributes[attributes[attributeName]] = value;
    }
    return allAttributes;
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
    for (i = 0;i<items.length;++i){
        const item = items[i];
      let itemAttributes = item.getElementsByTagName("attributes");
      if (itemAttributes.length == 1){
        itemAttributes = itemAttributes[0];
        for (let j = 0;j<itemAttributes.children.length;++j){
            attributes[itemAttributes.children[j].nodeName] = attributes[itemAttributes.children[j].nodeName] || attributeCount++;
        }
        
      }
      const fillAttributes = function (source){
          return function () {
              const elements = item.getElementsByTagName(source);
              for (j = 0;j<elements.length;++j){
                  attributes[elements[j].attributes[0].nodeValue] = attributes[elements[j].attributes[0].nodeValue] || attributeCount++;
              }
          };
      };

      fillAttributes("resistance")();
      fillAttributes("susceptibility")();

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
      td = cext("th",{
          innerHTML:i,
      });
      append(td,tr);
      td.addEventListener("click", sortBy);
    }

    for (var i = 0;i<items.length;++i){
        const item = items[i];
      let tr = ce("tr");
      let td = ce("td");
      append(td,tr);
      let type = item.getElementsByTagName("type")[0];


      const homepage = `${basePageURL}/item/${type.attributes[0].nodeValue}/${item.attributes[0].value.replace(/ /g,"_")}.html`;

      append(cext("img",{
          src : `${basePageURL}/images/item/${type.attributes[0].nodeValue}/${type.attributes[1].value.replace(/ /g,"_")}.png`,
      }),td);

      append(td,tr);
      append(cext('a', {
          href: homepage,
          target: "_blank",
          innerHTML: item.attributes[0].value,
      }),td);

      append(tr,table);
      let itemAttributes = item.getElementsByTagName("attributes");
      let allAttributes = [];
    
      if (itemAttributes.length==1){
        itemAttributes = itemAttributes[0];
        for (j = 0;j<itemAttributes.children.length;++j){
            const child = itemAttributes.children[j];
            let attributeName = child.nodeName;
            allAttributes[attributes[attributeName]] = child.attributes[0].nodeValue;
          }

      }

      allAttributes = parseResistances(allAttributes,attributes,items[i],"resistance");
      allAttributes = parseResistances(allAttributes,attributes,items[i],"susceptibility");


        for (var j=1;j<=attributeCount;++j){
            append(cext("td",{
                innerHTML: allAttributes[j] || "",
            }),tr);
        }
    }
    append(table,itemsDiv);
  } catch (ex) {
    console.log(ex);
  }
}
