/**
 * Archives.com $ AcTable Plugin
 * @version 0.6
 * @author Martin Przybyla
 */

/**
 * Main AcTable Object
 * @type {Object}
 */
var AcTable = {

	/**
	 * $ plugin name which can later be used to call the plugin
	 * Example: $("#Elem").actable();
	 * @type {String}
	 */
	name: "actable",

	// plugin version
	version: 0.6,

	/**
	 * Default plugin options
	 * @type {Object}
	 */
	options: {
		initialTableMarkup: "<table></table>",
		tableId: "",
		_tableClass: "ac-table",
		tableClasses: "",
		type: ""
	},

	/**
	 * Init constructor method
	 * @constructor
	 * @param  {Object} options Passed in options which are mixed with default options
	 * @param  {Object} elem    HTML table node
	 * @return {Object}         Return table object
	 */
	init: function(options, elem) {

		// mix in the passed-in options with the default options
		this.options = $.extend({}, this.options, options);

		// save reference to the element and the $ object
		this.elem = elem;
		this.$elem = $(elem);

		// add colgroup class if table has colgroup
		if (this.$elem.find("colgroup").length) {
			this.$elem.addClass("ac-colgroup");
		}

		// get initial table markup and add ID
		this.tableId = this.options.tableId || this.elem.id;
		this.actable = $(this.options.initialTableMarkup);
		this.actable.prop("id", this.tableId);

		// add original table classes and actable class
		if (this.options._tableClass !== "") {
			this.actable.addClass(this.options._tableClass);
		}
		this.tableClasses = this.$elem.attr("class");
		if (this.tableClasses !== "") {
			this.actable.addClass(this.tableClasses);
		}

		// count columns and add column class to table
		this.toColumns = this.getColumnCount(this.$elem);
		this.$elem.addClass("ac-cols-" + this.toColumns);

		// change table based on viewport width and options
		if (this.options.type !== "" && this.options.type === "small") {

			if (this.$elem.hasClass("ac-table-sm")) {
				return;
			}
			this.actableRows = this.toMobile();
			this.actable.append(this.actableRows);

		} else if (this.options.type !== "" && this.options.type === "large") {

			if (this.$elem.hasClass("ac-table-lg")) {
				return;
			}
			this.actableHeader = this.toFullSize(this.toColumns).header;
			this.actableRows = this.toFullSize(this.toColumns).tableContent;
			this.actable.append(this.actableHeader);
			this.actable.append(this.actableRows);

		}

		// append table rows, insert table and remove previous version
		this.$elem.before(this.actable);
		this.$elem.remove();

		// return this for chaining / prototype
		return this;
	},

	/**
	 * Converts a table from full width to mobile
	 * @return {String} HTML markup for new mobile table
	 */
	toMobile: function() {

		var counter = 0,
			_self = this,
			row,
			key,
			val,
			tableContent = $("<tbody/>"),
			$topRow = this.$elem.find("tr").eq(0),
			colClasses = [],
			currClass = "",
			currInput;

		// set up the proper class for the table
		this.actable.removeClass("ac-table-lg");
		this.actable.addClass("ac-table-sm");

		// count columns and add column class to table
		var toColumns = this.getColumnCount(this.$elem);
		this.toColumns = toColumns;
		this.actable.addClass("ac-cols-" + this.toColumns);

		this.$elem.find("col").each(function(index, value) {
			colClasses.push($(this).attr("class"));
		});

		// loop through the table markup and rewrite it
		this.$elem.find("tr").each(function(index, value) {
			$(this).find("td").each(function(index, value) {

				counter++;

				if ($topRow.find("td, th").eq(index).length) {

					if (colClasses[index]) {
						currClass = " " + colClasses[index];
					}

					if (counter % toColumns === 0) {
						row = $("<tr class=\"last-row\" />");
					} else if (counter % toColumns === 1) {
						row = $("<tr class=\"first-row\" />");
					} else {
						row = $("<tr/>");
					}

					// needs to be optimized
					var headings = $topRow.find("td, th").eq(index).contents().clone(),
						cellContent = $(this).contents();

					key = $("<td/>").addClass("ac-table-key", currClass).append(headings);
					row.append(key);

					val = $("<td/>").addClass("ac-table-val").append(cellContent);
					row.append(val);

					$(tableContent).append(row);
				}
			});
		});

		return tableContent;
	},

	/**
	 * Converts a table from mobile view to full width
	 * @return {String} HTML markup for new full width table
	 */
	toFullSize: function(columns) {

		var counter = 0,
			_self = this,
			tableContent = $("<tbody/>"),
			$topRow = this.$elem.find("tr").eq(0),
			header,
			headerRow,
			headerCell,
			row,
			cell,
			cellContents,
			body = $("<tbody/>"),
			colgroup;

		// set up the proper class for the table
		this.actable.removeClass("ac-table-sm");
		this.actable.addClass("ac-table-lg");

		// loop through and create a table with colgroups
		if (this.$elem.hasClass("ac-colgroup")) {



			// TODO: first condition needs to be rewritten


			// this.$elem.find("tr").each(function(index, value) {

/*				var currInput;

				counter++;

				if (index < columns) {
					if (counter === 1) {
						colgroup += $("<colgroup/>");
						colgroup.append("<col/>").addClass("col-" + counter);
						console.log(colgroup);
					}
				}

				if (index < columns) {
					header += "<th>" + $(value).find("th, td").eq(0).html() + "</th>";
					console.log($(value).find("th, td").eq(0).contents());
				}

				if (counter === 1) body += "<tr>";
				body += "<td>";
				currInput = $(value).find("th, td").children("input[type=checkbox]");
				currInput = _self.checkboxState(currInput);
				body += $(value).find("th, td").eq(1).html();
				body += "</td>";
				if (counter % columns === 0) body += "</tr><tr>";

			});

			if we are at the end remove the last <tr>
			body = body.slice(0, -4);

			markup += colgroup;
			markup += "<thead><tr>" + header + "</tr></thead>";
			markup += "<tbody>" + body + "</tbody>";

			loop through and create a table without colgroups*/
		} else {

			header = $("<thead/>");
			headerRow = $("<tr/>");

			this.$elem.find("tr").each(function(index, value) {

				counter++;

				if (index < columns) {
					headerCell = $("<th/>");
					$(headerCell).addClass("col-" + counter).append($(value).find("th, td").eq(0).contents().clone(true));
					$(headerRow).append(headerCell);
				}

				if (counter === 1) {
					$(header).append(headerRow);
				}

				if (counter === 1 || index % columns === 0) {
					row = $("<tr/>").addClass("row-" + counter);
				}

				cell = $("<td/>").addClass("col-" + counter);
				cellContents = $(value).find("th, td").eq(1).contents().clone(true);
				$(cell).append(cellContents);
				$(row).append(cell);

				if (counter === 1 || counter % columns === 0) {
					$(tableContent).append(row);
				}

			});
		}

		return {
			tableContent: tableContent,
			header: header
		};
	},

	/**
	 * Checks checkbox state and maintains it
	 * @param  {Object} currInput Checkbox $ object to test
	 * @return {Object} Checkbox object with proper state
	 */
	checkboxState: function($currInput) {

		if ($currInput.prop("checked")) {

			$currInput.attr("checked", true);

		} else {

			$currInput.attr("checked", false);

		}

		return $currInput;
	},

	/**
	 * Counts number of columns/rows in a table
	 * @param  {Object} table $ object representing a table
	 * @return {Number} Number of Columns
	 */
	getColumnCount: function(table) {
		var colCount = 0,
			$table = table || this.$elem;

		// if the table is in desktop view
		if ($table.hasClass("ac-table-lg")) {

			// if we have a colgroup count the number of cols
			if ($table.find("colgroup").length) {

				$table.find("col").each(function() {
					colCount++;
				});

			} else {

				// count the number of td and th elements taking into account colspan
				$table.find("tr:first").find("td, th").each(function() {
					if ($(this).attr("colspan")) {
						colCount += +$(this).attr("colspan");
					} else {
						colCount++;
					}
				});

			}

			// if the table is currently mobile
		} else if ($table.hasClass("ac-table-sm")) {

			// parse the column class that was added at init()
			var str = $table.attr("class"),
				cols = parseInt(/ac-cols-(\d+)/.exec(str)[1], 10);

			colCount = cols;

		} else {

			console.warn(AcTable.name + ": unable to count columns");

		}

		return colCount;
	}

};

////////////////////////////
// END OF COMPONENT LOGIC //
////////////////////////////

// register AcTable object as a $ plugin
$.plugin(AcTable.name, AcTable);