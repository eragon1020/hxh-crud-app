const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // URL de tu aplicación desplegada en Vercel
    baseUrl: 'https://hxh-crud-app-git-main-bryams-projects-98dcf78a.vercel.app',
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    
    // Variables de entorno para las APIs
    env: {
      API_RELATIONAL: 'https://hxh-crud-app.onrender.com',
      API_NOSQL: 'https://hxh-nosql.onrender.com'
    },
    
    // Configuración de timeouts (importante porque Render puede ser lento)
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    
    // Configuración de video y screenshots
    video: true,
    screenshotOnRunFailure: true,
    
    // Viewport
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Retry en caso de fallo (útil con APIs lentas)
    retries: {
      runMode: 2,
      openMode: 0
    }
  },
})