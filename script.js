// Object used for building and placing box containers
var $boxContainer = $("<div id='boxContainer'></div>");

// Name of the current design
var designName = null;

// Name of the design to load from local storage
var designToLoad = null;

// RGB value for the currently selected color
var color = "rgb(200, 200, 200)";

// True while left mouse button is down after being pressed over a box
var mouseDown = false;

// Determines if brightening is enabled
var brighten = false;

// Determines if darkening is enabled
var darken = false;

// Populate and show certain design elements for a new session
function initDesignElements() {
  var $ds = $("#designSelector");
  var ls = localStorage;
  var length = ls.length;
  for (var i = 0; i < length; i++) {
    $ds.append( $("<option>" + ls.key(i) + "</option>") );
  }
  $ds.css("visibility", "visible");
  $("#loadDesignButton").prop("disabled", false);
  designToLoad = $("#designSelector").val();
}

// Assign colors to the color boxes
function initColorBoxes() {
  var $cb = $(".colorBox");
  $( $cb[0] ).css("background-color", "rgb(220, 20, 60)");
  $( $cb[1] ).css("background-color", "rgb(255, 165, 0)");
  $( $cb[2] ).css("background-color", "rgb(175, 215, 230)");
  $( $cb[3] ).css("background-color", "rgb(145, 240, 145)");
  $( $cb[4] ).css("background-color", "rgb(240, 145, 230)");
  $( $cb[5] ).css("background-color", "rgb(141, 0, 184)");
  $( $cb[6] ).css("background-color", "rgb(214, 79, 0)");
  $( $cb[7] ).css("background-color", "rgb(0, 25, 150)");
  $( $cb[8] ).css("background-color", "rgb(35, 205, 0)");
  $( $cb[9] ).css("background-color", "rgb(250, 255, 5)");
  $( $cb[10] ).css("background-color", "rgb(190, 0, 135)");
  $( $cb[11] ).css("background-color", "rgb(0, 0, 0)");
  $( $cb[12] ).css("background-color", "rgb(255, 255, 255)");
  $( $cb[13] ).css("background-color", "rgb(200, 200, 200)");
}

// Create a box column with the given number of boxes and append it
// to the box container object
function createBoxColumn(size) {
  var $boxColumns = $("<div class='boxCol'></div>");
  for (var i = 0; i < size; i++) {
    $boxColumns.append("<div class='box'></div>");
  }
  $boxContainer.append($boxColumns);
}

// Add mouse event listeners to the box container object for the boxes
function addBCEventListeners() {
  $boxContainer.on("mousedown", ".box", function(event) {
    if (event.which === 1) {
      var c = $(this).css("background-color");
      if (brighten) {
        $(this).css("background-color", brightenColor(c));
      } else if (darken) {
        $(this).css("background-color", darkenColor(c));
      } else {
        $(this).css("background-color", color);
      }
      mouseDown = true;
    }
  });
  $boxContainer.on("mouseenter", ".box", function() {
    if (mouseDown) {
      var c = $(this).css("background-color");
      if (brighten) {
        $(this).css("background-color", brightenColor(c));
      } else if (darken) {
        $(this).css("background-color", darkenColor(c));
      } else {
        $(this).css("background-color", color);
      }
    }
  });
}

// Create a box container with the given number of rows and columns
// and the given box size
function createBoxContainer(col, row, boxSize) {
  for (var i = 0; i < col; i++) {
    createBoxColumn(row);
  }
  $boxContainer.width(col * boxSize + col + 1 + "px");
  $boxContainer.height(row * boxSize + row + 1 + "px");
  $boxContainer.find(".box").css({
    width: boxSize + "px",
    height: boxSize + "px"
  });
  addBCEventListeners();
}

// Put the internal box container into the place of the current one
// then reset it for future use
function placeBoxContainer() {
  $("#boxContainer").replaceWith($boxContainer);
  $boxContainer = $("<div id='boxContainer'></div>");
}

// Save the current design to local storage
function saveDesign() {
  var design = {};
  var $boxes = $(".box");
  var colors = [];
  for (var i = 0; i < $boxes.length; i++) {
    colors.push( $($boxes[i]).css("background-color") );
  }
  design.name = designName.replace(/^\s*/, "");
  design.name = design.name.replace(/\s+/g, " ");
  design.colors = colors;
  design.boxRows = $( $(".boxCol")[0] ).children().length;
  design.boxCols = $(".boxCol").length;
  design.boxSize = $(".box").css("width");
  if ( !(designName in localStorage) ) {
    // If the design is not already in local storage update the
    // design load elements for the new design
    var $ds = $("#designSelector");
    var $newDesign = $("<option>" + designName + "</option>");
    if (localStorage.length === 0) {
      // If this is the first saved design update the design to load
      // and make visible the design selector and load button
      $ds.append($newDesign);
      designToLoad = $ds.val();
      $ds.css("visibility", "visible");
      $("#loadDesignButton").prop("disabled", false);
    } else {
      // Sort new design name into option list
      var $options = $ds.children();
      var inserted = false;
      for (var j = 0; j < $options.length; j++) {
        var name = $( $options[j] ).text();
        if (designName < name) {
          $newDesign.insertBefore($options[j]);
          inserted = true;
          break;
        }
      }
      if (!inserted) { $ds.append($newDesign); }
    }
  }
  localStorage[design.name] = JSON.stringify(design);
  $("#deleteDesignButton").prop("disabled", false);
  $("#deleteAllDesignsButton").prop("disabled", false);
}

// Load the selected design from local storage
function loadDesign() {
  if (designToLoad === null) {
    console.log("Design is not set");
  } else if (localStorage[designToLoad] === undefined) {
    console.log("Design does not exist");
  } else {
    var design = JSON.parse(localStorage[designToLoad]);
    var rows = design.boxRows;
    var cols = design.boxCols;
    var boxSize = parseInt(design.boxSize);
    var $boxes;
    createBoxContainer(cols, rows, boxSize);
    placeBoxContainer();
    $boxes = $(".box");
    for (var i = 0; i < $boxes.length; i++) {
      $( $boxes[i] ).css("background-color", design.colors[i]);
    }
    // Update design name and interface
    designName = design.name;
    $("#designName").val(designName);
    $("#saveDesignButton").prop("disabled", false);
    $("#deleteDesignButton").prop("disabled", false);
    $("#boxRowRange").val(rows);
    $("#boxRowVal").text(rows);
    $("#boxColRange").val(cols);
    $("#boxColVal").text(cols);
    $("#boxSizeRange").val(boxSize);
    $("#boxSizeVal").text(boxSize);
  }
}

// Delete the current design and update the interface accordingly
function deleteDesign() {
  localStorage.removeItem(designName);
  $("#saveDesignButton").prop("disabled", true);
  $("#designName").val("");
  $("#designSelector option").filter(function() {
    if ( $(this).val() === designName ) {
      $(this).remove();
    }
  });
  if (localStorage.length === 0) {
    $("#loadDesignButton").prop("disabled", true);
    $("#designSelector").css("visibility", "hidden");
    $("#deleteDesignButton").prop("disabled", true);
    $("#deleteAllDesignsButton").prop("disabled", true);
  } else {
    designToLoad = $("#designSelector").val();
  }
  clearBoxes();
}

// Delete all saved designs and update the interface accordingly
function deleteAllDesigns() {
  localStorage.clear();
  designName = null;
  designToLoad = null;
  $("#saveDesignButton").prop("disabled", true);
  $("#designName").val("");
  $("#loadDesignButton").prop("disabled", true);
  $("#designSelector").css("visibility", "hidden");
  $("#designSelector option").remove();
  $("#deleteAllDesignsButton").prop("disabled", true);
  $("#deleteDesignButton").prop("disabled", true);
  clearBoxes();
}

// Reset the background color of the boxes
function clearBoxes() {
  var $boxes = $(".box");
  $boxes.css("background-color", "rgb(200, 200, 200)");
}

// Convert RGB values into an array of HSL values
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  return [h, s, l];
}

// Return the given RGB string as a HSL string slightly brightened
function brightenColor(color) {
  var rgb = color.slice(4, -1).split(", ");
  var r = rgb[0], g = rgb[1], b = rgb[2];
  var hsl = rgbToHsl(r, g, b);
  var h = hsl[0], s = hsl[1];
  var l = hsl[2];
  if (l + 5 < 255) {
    l += 5;
  }
  return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

// Return the given RGB string as a HSL string slightly darkened
function darkenColor(color) {
  var rgb = color.slice(4, -1).split(", ");
  var r = rgb[0], g = rgb[1], b = rgb[2];
  var hsl = rgbToHsl(r, g, b);
  var h = hsl[0], s = hsl[1];
  var l = hsl[2];
  if (l - 5 > 0) {
    l -= 5;
  }
  return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

$(document).ready(function() {
  
  if (localStorage.length !== 0) {
    initDesignElements();
    $("#deleteAllDesignsButton").prop("disabled", false);
  }
  
  initColorBoxes();
  createBoxContainer(45, 45, 16);
  placeBoxContainer();
  
  $(document).on("mouseup", function() {
    mouseDown = false;
  });
  
  $("#boxRowRange").on("input", function() {
    $("#boxRowVal").text( $(this).val() );
  });
  
  $("#boxColRange").on("input", function() {
    $("#boxColVal").text( $(this).val() );
  });
  
  // Currently need this for IE
  $("#boxRowRange").on("change", function() {
    $("#boxRowVal").text( $(this).val() );
  });
  
  // Currently need this for IE
  $("#boxColRange").on("change", function() {
    $("#boxColVal").text( $(this).val() );
  });
  
  // Create and place a new box container with the current
  // row and column settings
  $("#createNewDesignButton").on("click", function() {
    var rows = parseInt( $("#boxRowRange").val() );
    var cols = parseInt( $("#boxColRange").val() );
    var size = parseInt( $("#boxSizeRange").val() );
    createBoxContainer(cols, rows, size);
    placeBoxContainer();
  });
  
  $("#saveDesignButton").on("click", function() {
    designName = $("#designName").val();
    saveDesign();
  });
  
  $("#designName").on("input", function() {
    if ( $(this).val() !== undefined && $(this).val() !== "" ) {
      $("#saveDesignButton").prop("disabled", false);
    } else {
      $("#saveDesignButton").prop("disabled", true);
    }
  });
  
  $("#loadDesignButton").on("click", function() {
    loadDesign();
  });
  
  $("#designSelector").on("change", function() {
    designToLoad = $("#designSelector").val();
  });
  
  $("#deleteDesignButton").on("click", function() {
    deleteDesign();
  });
  
  $("#deleteAllDesignsButton").on("click", function() {
    deleteAllDesigns();
  });
  
  $("#boxSizeRange").on("input", function() {
    $("#boxSizeVal").text( $(this).val() );
  });
  
  $("#boxSizeRange").on("change", function() {
    
    // Currently need this for IE
    $("#boxSizeVal").text( $(this).val() );
    
    var $bc = $("#boxContainer").detach();
    var $boxes = $bc.find(".box");
    var count = $bc.find(".boxCol").length;
    var size = $( $bc.find(".boxCol")[0] ).children().length;
    var boxSize = $(this).val();
    var width = boxSize * count + count + 1;
    var height = boxSize * size + size + 1;
    
    $bc.css({
      width: width + "px",
      height: height + "px"
    });
    
    $boxes.css({
      width: boxSize + "px",
      height: boxSize + "px"
    });
    
    $("#outerBoxContainer").append($bc);
    
  });
  
  $("#toggleMarginButton").on("click", function() {
    var $boxes = $(".box");
    if ($boxes.css("margin-top") === "1px") {
      $boxes.css("margin", "0px");
    } else {
      $boxes.css("margin", "1px 0px 0px 1px");
    }
  });
  
  $("#clearBoxesButton").on("click", function() {
    clearBoxes();
  });
  
  $("#brightenButton").on("click", function() {
    if (!brighten) {
      brighten = true;
      darken = false;
      $("#darkenButton").css("box-shadow", "none");
      $(this).css("box-shadow", "0px 0px 2px 2px rgb(0, 145, 255)");
    } else {
      brighten = false;
      $(this).css("box-shadow", "none");
    }
  });
  
  $("#darkenButton").on("click", function() {
    if (!darken) {
      darken = true;
      brighten = false;
      $("#brightenButton").css("box-shadow", "none");
      $(this).css("box-shadow", "0px 0px 2px 2px rgb(0, 145, 255)");
    } else {
      darken = false;
      $(this).css("box-shadow", "none");
    }
  });
  
  $(".colorBox").on("click", function() {
    color = $(this).css("background-color");
    $("#currentColor").css("background-color", color);
  });
  
});