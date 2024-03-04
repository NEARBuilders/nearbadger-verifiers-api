import App from './app.js';

const port = process.env.PORT || 3000;

App.listen(port, () => {
  console.log(`Started server at http://localhost:${port}/`);
});

export default App;