import App from './app.js';
import { ethers } from 'ethers';

const port = process.env.PORT || 3000;

App.listen(port, () => {
  console.log(`Started server at http://localhost:${port}/`);
});

export default App;