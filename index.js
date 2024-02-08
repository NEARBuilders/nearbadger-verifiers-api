const App = require('./app');
const port = 3000;

App.listen(port, () => {
  console.log(`Started server at http://localhost:${port}/`);
});