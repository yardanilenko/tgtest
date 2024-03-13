module.exports = {
    apps: [
      {
        name: 'index',
        script: 'index.js',
        exec_mode: 'fork',
        interpreter: 'node',
        interpreter_args: '-r esm',
        restart_delay: 3000,
        max_restarts: 10,
      },
    ],
  };
  