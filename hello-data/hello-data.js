/* eslint no-console:0 */
const WebSocket = require('ws');
const enigma = require('enigma.js');
const schema = require('enigma.js/schemas/3.2.json');
const Halyard = require('halyard.js');
const mixins = require('halyard.js/dist/halyard-enigma-mixin');

(async () => {
  try {
    console.log('Creating table data representation.');
    const halyard = new Halyard();
    const moviesPath = '/data/movies.csv';
    const moviesTable = new Halyard.Table(moviesPath, {
      name: 'Movies',
      fields: [
        { src: 'Movie', name: 'Movie' },
        { src: 'Year', name: 'Year' },
        { src: 'Adjusted Costs', name: 'Adjusted Costs' },
        { src: 'Description', name: 'Description' },
        { src: 'Image', name: 'Image' },
      ],
      delimiter: ',',
    });

    halyard.addTable(moviesTable);

    console.log('Creating and opening session using mixin.');
    const session = enigma.create({
      schema,
      mixins,
      url: 'ws://localhost:9076/app/',
      createSocket: url => new WebSocket(url),
    });
    const qix = await session.open();
    const app = await qix.createSessionAppUsingHalyard(halyard);

    console.log('Creating session object with movie titles.');
    const moviesCount = 10;
    const properties = {
      qInfo: { qType: 'hello-data' },
      qHyperCubeDef: {
        qDimensions: [{ qDef: { qFieldDefs: ['Movie'] } }],
        qInitialDataFetch: [{ qHeight: moviesCount, qWidth: 1 }],
      },
    };
    const object = await app.createSessionObject(properties);
    const layout = await object.getLayout();
    const movies = layout.qHyperCube.qDataPages[0].qMatrix;

    console.log(`Listing the ${moviesCount} first movies:`);
    movies.forEach((movie) => { console.log(movie[0].qText); });

    await session.close();
    console.log('Session closed.');
  } catch (err) {
    console.log('Woops! An error occurred.', err);
    process.exit(1);
  }
})();
