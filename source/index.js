import { createServer } from 'node:http';

const server = createServer((req, res) => {

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  
  const responseData = {
      time: Date.now(),
      msg: 'timing'
  }
  
  const jsonContent = JSON.stringify(responseData)
  
  res.end(jsonContent);
});

server.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}/`);
});

