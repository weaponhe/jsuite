module.exports = {
	format: function(date, fmt) {
		var o = {
			"M+": date.getMonth() + 1,
			"d+": date.getDate(),
			"H+": date.getHours(),
			"m+": date.getMinutes(),
			"s+": date.getSeconds(),
			"q+": Math.floor((date.getMonth() + 3) / 3),
			"S": date.getMilliseconds()
		};
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o) {
			if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
		return fmt;
	},
	daysElapsed: function(date) {
		var millis = Date.now() - date,
			days = millis / (1000 * 60 * 60 * 24);
		return Math.floor(days);
	},
	getDaysInMonth: function(date) {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	}
}