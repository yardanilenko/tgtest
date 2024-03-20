// module.exports = {
//   apps: [
//     {
//       name: 'index',
//       script: 'index.cjs',
//       exec_mode: 'fork',
//       interpreter: 'node',
//       interpreter_args: '-r esm',
//       restart_delay: 3000,
//       max_restarts: 10,
//     },
//   ],
// };
const os = require('os');
module.exports = {
    apps: [{
        port        : 3000,
        name        : "any",
        script      : "./index.cjs", // 👈 CommonJS
        watch       : true,           
        instances   : os.cpus().length,
        exec_mode   : 'fork',         
        env: {
            NODE_ENV: "production",
        }
    }]
}