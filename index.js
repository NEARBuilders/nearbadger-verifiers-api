import App from './app.js';
const port = process.env.PORT || 3000;

App.instance.listen(port, () => {
  console.log(`Started server at http://localhost:${port}/`);
});