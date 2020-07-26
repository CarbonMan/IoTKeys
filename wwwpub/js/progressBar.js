/**
 *  https://jqueryui.com/progressbar/#label
 */
var progressbar = $("#progressbar"),
dialog;
$(function () {
	var progressLabel = $(".progress-label"),
	dialogButtons = [{
			text: "Cancel countdown",
			click: closeDownload
		}
	];
	dialog = $("#dialog").dialog({
			autoOpen: false,
			closeOnEscape: false,
			resizable: false,
			buttons: dialogButtons,
			open: function () {
				
			},
			beforeClose: function () {
				/*
				downloadButton.button("option", {
					disabled: false,
					label: "Start Download"
				});
				*/
			}
		});
	/*
	var downloadButton = $("#downloadButton")
		.button()
		.on("click", function () {
			$(this).button("option", {
				disabled: true,
				label: "Downloading..."
			});
			dialog.dialog("open");
		});
	*/
	progressbar.progressbar({
		value: false,
		change: function () {
			progressLabel.text("Wait completed: " + progressbar.progressbar("value") + "%");
		},
		complete: function () {
			progressLabel.text("Complete!");
			/*
			dialog.dialog("option", "buttons", [{
						text: "Close",
						click: closeDownload
					}
				]);
			$(".ui-dialog button").last().trigger("focus");
			*/
		}
	});

	/*
	function progress(value, max) {
	if (value > maxValue)
	maxValue = value;
	// It is a countdown
	var p = maxValue - value;
	var val = progressbar.progressbar( "value" ) || 0;

	progressbar.progressbar( "value", val + Math.floor( Math.random() * 3 ) );

	if ( val <= 99 ) {
	progressTimer = setTimeout( progress, 50 );
	}
	}
	 */
	function closeDownload() {
		dialog
		.dialog("option", "buttons", dialogButtons)
		.dialog("close");
		progressbar.progressbar("value", false);
		progressLabel
		.text("Starting countdown...");
		downloadButton.trigger("focus");
	}
});

function updateProgress(value, maxValue) {
	// It is a countdown so invert the value & convert to a percent
	var val = ((maxValue - value) / maxValue) * 100;

	progressbar.progressbar("value", Math.round(val));

}
