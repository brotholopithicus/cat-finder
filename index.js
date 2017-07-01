/*************************************************************************************
 * A Command-Line Utility To Find The Fattest Cats Available For Adoption In Your Area
 *************************************************************************************/

const fatcat = require('./fatcat');
const options = require('minimist')(process.argv.slice(2));
fatcat(options);
