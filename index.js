const App = require('./app');
const port = process.env.PORT || 3000;

App.listen(port, () => {
  console.log(`Started server at http://localhost:${port}/`);
});

module.exports = App;
