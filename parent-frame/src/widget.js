import * as zoid from "zoid/dist/zoid.frameworks";

let MyWidget = zoid.create({
    tag: 'my-widget',
    url: 'http://localhost:5051/index.html',
    dimensions: {
        width: "500px",
        height: "800px",
      }
})

console.log('yo! have loaded widget from parent: ')
console.log(MyWidget)

export default MyWidget