/**
 * Logs information to standard output.
 * @class Logger
 */
var logger;

logger = (function createLogger() {
	"use strict";
	var /** Default log level */
		defaultLoglevel = 4, // verydetailed -> logs almost nothing
		/** If enabled, messages are only logged when not 'null' */
		CHECK = true,
		/** If enabled, source code information is not logged */
		hideLocation = false,
		/** Possible log levels / for public method definitions see below */
		level = ["debug", "info", "warn", "error", "verydetailed"],
		currentLevel = defaultLoglevel,
		logger = {};

	/*
	 * Returns Loglevel as String
	 * @method write
	 * @private
	 * @param {number} lvl
	 * @returns Loglevel as String
	 */
	function write(lvl) {
		if (typeof lvl === "string") {
			return lvl;
		} else {
			return level[lvl] || ("custom level " + lvl);
		}
	}

	/**
	 * Transforms parameter into valid Loglevel
	 * @method getLevel
	 * @private
	 * @param lvl Can be a String or number
	 * @returns LogLevel as a number
	 */
	function getLevel(lvl) {
		var res = defaultLoglevel,
			i,
			hit = false;
		if (typeof lvl === "string") {
			for (i = 0; i < level.length; i++) {
				if (level[i] === lvl) {
					res = i;
					i = level.length;
					hit = true;
				}
			}
			if (!hit) {
				console.log("Invalid loglevel received: " + lvl);
			}
		} else if (typeof lvl === "number") {
			res = lvl;
		}
		return res;
	}

	/*
	 * Displays Log
	 * @method display
	 * @private
	 * @param pos Log number or log object
	 */
	function display(log) {
		var tex;
	//	tex = "[" + log.lvl + " " + log.time + "] " + log.msg;
		if (hideLocation && getLevel(log.lvl) !== getLevel("verydetailed")) {
			tex = "[" + write(log.lvl) + "] " + log.msg;
		} else {
			if (getLevel(log.lvl) === getLevel("verydetailed")) {
				tex = "[" + write(log.lvl) + "] " + log.msg + "\n" + log.loc;
			} else {
				tex = "[" + write(log.lvl) + "|" + log.loc + "] " + log.msg;
			}
		}
		console.log(tex);
	}

	/**
	 * Saves Log message in memory and displays it if current Loglevel
	 * is smaller then given Loglevel.
	 * @method log
	 * @param {String} msg Logmessage
	 * @param [lvl] Loglevel
	 */
	function log(msg, lvl) {
		var logLocation;
		if (!CHECK || msg) {
			lvl = getLevel(lvl);
			if (getLevel(lvl) === getLevel("verydetailed")) {
				logLocation = getDetailedLocation(getErrorObject());
			} else {
				logLocation = getLocation(getErrorObject());
			}
			if (lvl >= currentLevel) {
				display({msg: msg, lvl: lvl, time: Date.now(), loc: logLocation});
				//logs.push({msg: msg, lvl: lvl, time: Date.now(), loc: logLocation});
				//displayLast();
			}
		}
	}

	/**
	 * Returns stack trace as location
	 * @method getDetailedLocation
	 * @private
	 */
	function getDetailedLocation(err) {
		var parts = err.stack.split("\n"),
			spliced = parts.splice(0, 4),
			msg = parts.join("\n");
		//console.log("spliced: " + JSON.stringify(spliced) + "\n" + "msg: " + msg);
		return msg;
	}
	
	/**
	 * Returns source code location.
	 * @method getLocation
	 * @private
	 * @param {Object} Error object
	 * @return {String} A String in this format: Sourcefile:linenumber
	 */
	function getLocation(err) {
		//console.log(err.stack);
		var parts = err.stack.split("\n"),
			msg = parts[4],
			res,
			groups,
			pattern = /\\([^\\]*\.js):(\d*):\d*/;
		groups = pattern.exec(msg);
		// if pattern does not match the stacktrace looks different and just uses the complete line
		if (groups) {
			res = groups[1] + ":" + groups[2];
		} else {
			res = msg;
		}
		return res;
	}

	/**
	 * Creates and returns an error object.
	 * @return Error object which is created within this function.
	 * @private
	 */
	function getErrorObject() {
		return new Error('Error for determining line number in logger');
	}

	/**
	 * Sets current Loglevel
	 * @param lvl New Loglevel
	 * @method setLoglevel
	 */
	function setLoglevel(lvl) {
		mark("Loglevel set to " + lvl);
		currentLevel = getLevel(lvl);
	}

	/*
	 * Generates a function for each loglevel
	 */
	(function generateLogFunctions() {
		level.forEach(function (val) {
			logger[val] = function (msg) {
				log(msg, val);
			};
		});
	}());

	// Documentation for loglevel-methods
	
	/**
	 * Logs with loglevel debug.
	 * @method debug
	 * @param {String} message String to log
	 */
	/**
	 * Logs with loglevel info.
	 * @method info
	 * @param {String} message String to log
	 */
	/**
	 * Logs with loglevel warn.
	 * @method warn
	 * @param {String} message String to log
	 */
	/**
	 * Logs with loglevel error.
	 * @method error
	 * @param {String} message String to log
	 */

	/**
	 * Logs with loglevel verydetailed. Messages logged with this method are
	 * always logged and use the detailed location.
	 * @method verydetailed
	 * @param {String} message String to log
	 */

	/**
	 * Inserts a marking log consisting of '-' signs to mark a position.
	 * A mark is always logged regardless of the current loglevel.
	 * @method mark
	 * @param {String} [str] Used within the marking.
	 */
	function mark(str) {
		if (str) {
			str = " " + str + " ";
		}
		console.log("----------------------------------------" + str + "----------------------------------------");
	}

	logger.mark = mark;
	logger.log = log;
	logger.setLoglevel = setLoglevel;
//	logger.getLogs = getLogs;

	return logger;
}());

if (module && module.exports) {
	module.exports = logger;
}
