'use strict';
var
	configMap = {
		schema_map: null,
		settable_map: {
			schema_map: true
		}
	},
	clean0_regex = /^[#!]*/,
	clean1_regex = /\?[^?]*/,
	getSchemaError, getVarType, getCleanHashString,
	string2Map,
	getHashMap, getHashString, setHash,
	configModule;

getSchemaError = function(message) {
	var error = new Error();
	error.name = 'Schema Error';
	error.message = message;
	return error;
};

getVarType = function(data) {
	if (data === undefined) {
		return 'Undefined';
	}
	if (data === null) {
		return 'Null';
	}
	return {}.toString.call(data).slice(8, -1);
}

getCleanHashString = function() {
	var hash_string = location.hash;
	hash_string = hash_string
		.replace(clean0_regex, '')
		.replace(clean1_regex, '');
	return hash_string;
};

string2Map = function(arg_map) {
	var hash_string = arg_map.input_string || '',
		separate_char = arg_map.separate_char || '&',
		separate_kv_char = arg_map.separate_kv_char || '=',
		hash_array, kv_array, key, value,
		output_map = {},
		i;

	hash_array = hash_string.split(separate_char);
	for (i = 0; i < hash_array.length; i++) {
		kv_array = hash_array[i].split(separate_kv_char);
		key = kv_array[0];
		value = kv_array[1];
		if (kv_array.length === 1) {
			output_map[decodeURIComponent(key)] = true;
		} else if (kv_array.length === 2) {
			output_map[decodeURIComponent(key)] = decodeURIComponent(value);
		}
	}
	return output_map;
}

getHashMap = function() {
	var hash_string = getCleanHashString(),
		hash_map, key_array, key_name, key_value, dep_array,
		key, i, output_map = {};
	if (hash_string === '') {
		return {};
	}

	hash_map = string2Map({
		input_string: hash_string
	});

	key_array = [];
	for (key in hash_map) {
		if (hash_map.hasOwnProperty(key)) {
			key_array.push(key);
		}
	}


	for (i = 0; i < key_array.length; i++) {
		key_name = key_array[i];
		key_value = hash_map[key_name];

		if (getVarType(key_value) !== 'String' || key_name === '') {
			continue;
		}
		hash_map['_s_' + key_name] = key_value;
		dep_array = key_value.split(':');
		if (dep_array[1] && dep_array !== '') {
			hash_map[key_name] = dep_array[0];
			hash_map['_' + key_name] = string2Map({
				input_string: dep_array[1],
				separate_char: '|',
				separate_kv_char: ','
			});
		}
	}
	return hash_map;
}

getHashString = function(hash_map_in, option_map_in) {
	var hash_map = hash_map_in || {},
		option_map = option_map_in || {},
		delimit_char = option_map.delimit_char || '&',
		delimit_kv_char = option_map.delimit_kv_char || '=',
		sub_delimit_char = option_map.sub_delimit_char || ':',
		dep_delimit_char = option_map.dep_delimit_char || '|',
		dep_kv_delimit_char = option_map.dep_kv_delimit_char || ',',
		schema_map = configMap.schema_map,
		sub_schema_map,
		hash_string, hash_key, hash_value, class_name,
		sub_hash_array, sub_hash_map, sub_hash_key, dep_key, dep_value,
		output_string;

	output_string = '';
	for (hash_key in hash_map) {
		hash_string = '';
		if (!hash_key || hash_key[0] === '_') {
			continue;
		}

		if (schema_map) {
			if (!schema_map[hash_key]) {
				throw getSchemaError('Key Unautherized : ' + hash_key);
			}
		}

		hash_value = hash_map[hash_key];
		if (schema_map) {
			if (getVarType(schema_map[hash_key]) === 'Object' &&
				!schema_map[hash_key][String(hash_value)]) {
				throw getSchemaError('Value Unautherized : ' + 'Key ' + hash_key + ' can\'t assigned as ' + hash_value);
			}
		}

		class_name = getVarType(hash_value);
		if (class_name === 'Boolean') {
			hash_string += encodeURIComponent(hash_key);
		} else {
			hash_string += encodeURIComponent(hash_key) + delimit_kv_char + encodeURIComponent(hash_value);
		}

		sub_hash_key = '_' + hash_key;
		sub_hash_array = [];
		if (hash_map.hasOwnProperty(sub_hash_key)) {
			if (schema_map) {
				sub_schema_map = schema_map[sub_hash_key];
				if (!sub_schema_map) {
					throw getSchemaError('Key Unautherized : ' + sub_hash_key);
				}
			} else {
				sub_schema_map = null;
			}

			sub_hash_map = hash_map[sub_hash_key];
			for (dep_key in sub_hash_map) {
				if (!dep_key) {
					continue;
				}
				dep_value = sub_hash_map[dep_key];

				if (sub_schema_map) {
					if (getVarType(sub_schema_map[dep_key]) === 'Object' &&
						!sub_schema_map[dep_key][String(dep_value)]) {
						throw getSchemaError('Value Unautherized : ' + 'Key ' + dep_key + ' can\'t assigned as ' + dep_value);
					}
				}

				class_name = getVarType(dep_value);
				if (class_name === 'Boolean') {
					sub_hash_array.push(encodeURIComponent(dep_key));
				} else {
					sub_hash_array.push(encodeURIComponent(dep_key) + dep_kv_delimit_char + encodeURIComponent(dep_value));
				}
			}
		}
		hash_string += sub_hash_array.length ? (sub_delimit_char + sub_hash_array.join(dep_delimit_char)) : '';
		output_string += hash_string + delimit_char;
	}
	return output_string.slice(0, -1);
};

setHash = function(hash_map, option_map, replace_flag) {
	var hash_string = getHashString(hash_map, option_map),
		uri_array = document.location.href.split('#'),
		uri_string;
	uri_string = hash_string ? (uri_array[0] + '#!' + hash_string) : uri_array[0];
	if (replace_flag) {
		document.location.replace(uri_string);
	} else {
		document.location.href = (uri_string);
	}
}

configModule = function(arg_map) {
	var key;
	for (key in arg_map) {
		if (configMap.settable_map.hasOwnProperty(key)) {
			configMap[key] = arg_map[key];
		} else {
			var error = new Error();
			error.name = 'Config Error'
			error.message = key + " is not settable.";
			throw error;
		}
	}
}

module.exports = {
	configModule: configModule,
	getHashMap: getHashMap,
	getHashString: getHashString,
	setHash: setHash
}