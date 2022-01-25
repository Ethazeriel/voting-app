const year = /^\d{0,2}$/;
const species = /^[A-Za-z]{0,4}$/;
const float = /^(\d*\.{0,1}\d*)$/;
const concentration = /(?:(\w+)\*(\d*\.{0,1}\d+))/;
const int = /^\d*$/;
const alphanum = /([\w :;?&.-])*/;

exports.year = year;
exports.species = species;
exports.float = float;
exports.concentration = concentration;
exports.int = int;
exports.alphanum = alphanum;