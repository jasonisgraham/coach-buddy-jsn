function onBodyLoad() {
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
	var displayInfo = 'PhoneGap (version ' + device.phonegap + ')<br />'
			+ device.platform + ' ' + device.name + ' (version '
			+ device.version + ').'
	$("#appInfo").html(displayInfo);
}
