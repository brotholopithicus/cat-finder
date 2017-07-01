const chalk = require('chalk');
const axios = require('axios');
const { JSDOM } = require('jsdom');

function FatCat(options) {
  clearTerminal();
  process.stdout.write('Fetching Feline Facts From: North East Animal Shelter...\n\n');
  axios.get('https://www.northeastanimalshelter.org/adopt-a-pet/cats/available-cats/')
    .then(res => parseResponse(res.data))
    .then(cats => {
      process.stdout.write(`Fetched ${cats.length} Felines\n\n`);
      if (options.fattest) {
        process.stdout.write(`The Fattest\n`);
        return filterByFattest(cats);
      } else if (options.leanest) {
        process.stdout.write(`The Leanest\n`);
        return filterByLeanest(cats);
      } else if (options.range) {
        if (options.range === 'fat') {
          process.stdout.write(`The Top ${options.limit} Fattest\n`);
          return getFatRange(cats, options.limit);
        } else if (options.range === 'lean') {
          process.stdout.write(`The Top ${options.limit} Leanest\n`);
          return getLeanRange(cats, options.limit);
        } else {
          throw new TypeError('Unknown Range Identified');
        }
      } else {
        return filterByFattest(cats);
      }
    })
    .then(res => res.forEach(cat => prettyPrint(cat)))
    .catch(err => console.log(err));

  function prettyPrint(obj) {
    for (let key in obj) {
      obj[key] = `${chalk.bold.green((key.charAt(0).toUpperCase() + key.slice(1) + ':').padEnd(8))} ${obj[key]}`;
    }
    obj['newline'] = '\n';
    return Object.values(obj).forEach(attr => console.log(attr));
  }

  function sortByFattest(cats) {
    return cats.sort((prev, curr) => parseInt(curr.weight) - parseInt(prev.weight));
  }

  function sortByLeanest(cats) {
    return cats.sort((prev, curr) => parseInt(prev.weight) - parseInt(curr.weight));
  }

  function getLeanRange(cats, limit = 3) {
    return sortByLeanest(cats).slice(0, limit);
  }

  function getFatRange(cats, limit = 3) {
    return sortByFattest(cats).slice(0, limit);
  }

  function filterByLeanest(cats) {
    return [cats.reduce((prev, curr) => (parseInt(prev.weight) < parseInt(curr.weight) ? prev : curr))];
  }

  function filterByFattest(cats) {
    return [cats.reduce((prev, curr) => (parseInt(prev.weight) > parseInt(curr.weight)) ? prev : curr)];
  }

  function parseResponse(html) {
    const { document } = (new JSDOM(html)).window;
    return new Promise((resolve, reject) => resolve(Array.prototype.map.call(document.querySelectorAll('.thumbnails > .span4'), span => parseElementForCatData(span))));
  }

  function parseElementForCatData(element) {
    return Object.assign({},
      ...element.textContent.replace(/\s+(?!\w)/g, '')
      .split(/\s(?=\w+\:)/)
      .map(item => {
        let split = item.toString().trim().split(/\:./);
        return split.length > 1 ? {
          [split[0].toLowerCase()]: split[1]
        } : { name: split[0] };
      }), {});
  }

  function clearTerminal() {
    process.stdout.write('\033c');
  }
}

module.exports = FatCat;
