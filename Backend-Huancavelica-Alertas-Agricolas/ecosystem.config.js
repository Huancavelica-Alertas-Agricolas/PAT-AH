module.exports = {
  apps: [
    {
      name: 'rest-service',
      cwd: 'services/rest-service',
      script: 'npm',
      args: 'start',
      env: { PORT: 3001 }
    },
    {
      name: 'ai-service',
      cwd: 'services/ai-service',
      script: 'npm',
      args: 'start',
      env: { PORT: 3003 }
    },
    {
      name: 'auth-service',
      cwd: 'microservicios/user-service',
      script: 'npm',
      args: 'start',
      env: { PORT: 3004 }
    },
    {
      name: 'users-service',
      cwd: 'microservicios/user-service',
      script: 'npm',
      args: 'start',
      env: { PORT: 3006 }
    },
    {
      name: 'weather-service',
      cwd: 'microservicios/weather-service',
      script: 'npm',
      args: 'start',
      env: { PORT: 3008 }
    },
    {
      name: 'alert-service',
      cwd: 'microservicios/alert-service',
      script: 'npm',
      args: 'start',
      env: { PORT: 3005 }
    }
  ]
};
