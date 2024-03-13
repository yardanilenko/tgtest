import('./app.js') // 👈 There is import function available in CommonJS
.then(({app}) => {
 app()
})