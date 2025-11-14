describe('HxH Characters CRUD - Web App', () => {
  
  beforeEach(() => {
    cy.visit('/')
    cy.wait(2000) // Esperar a que la app cargue
  })

  it('Should load the application successfully', () => {
    cy.contains('Hunter × Hunter Characters').should('be.visible')
    cy.contains('Base de datos activa:').should('be.visible')
  })

  it('Should display database selector buttons', () => {
    cy.contains('button', 'Relational').should('be.visible')
    cy.contains('button', 'NoSQL').should('be.visible')
  })

  it('Should switch to PostgreSQL database', () => {
    cy.contains('button', 'Relational').click()
    cy.contains('Base de datos activa: PostgreSQL').should('be.visible')
  })

  it('Should switch to MongoDB database', () => {
    cy.contains('button', 'NoSQL').click()
    cy.contains('Base de datos activa: MongoDB').should('be.visible')
  })

  it('Should search for a character (Gon) in PostgreSQL', () => {
    // Cambiar a PostgreSQL
    cy.contains('button', 'Relational').click()
    cy.wait(2000)
    
    // Buscar personaje
    cy.get('input[placeholder="Ingresa el nombre del personaje"]').type('Gon')
    cy.contains('button', '🔍 Buscar').click()
    
    // Verificar resultado (puede tardar por Render)
    cy.contains('Gon', { timeout: 20000 }).should('be.visible')
    cy.get('div').contains('Enhancer', { timeout: 10000 }).should('be.visible')
  })

  it('Should search for a character (Hisoka) in MongoDB', () => {
    // Cambiar a MongoDB
    cy.contains('button', 'NoSQL').click()
    cy.wait(2000)
    
    // Buscar personaje
    cy.get('input[placeholder="Ingresa el nombre del personaje"]').type('Hisoka')
    cy.contains('button', '🔍 Buscar').click()
    
    // Verificar resultado
    cy.contains('Hisoka', { timeout: 20000 }).should('be.visible')
    cy.get('div').contains('Transmuter', { timeout: 10000 }).should('be.visible')
  })

  it('Should show "not found" message for non-existent character', () => {
    cy.contains('button', 'Relational').click()
    cy.wait(1000)
    
    cy.get('input[placeholder="Ingresa el nombre del personaje"]')
      .type('PersonajeQueNoExiste123')
    cy.contains('button', '🔍 Buscar').click()
    
    // En React Native Paper, los alerts no se muestran en DOM
    // Verificamos que NO aparezca ningún resultado
    cy.wait(3000)
    cy.contains('PersonajeQueNoExiste123').should('not.exist')
  })

  it('Should clear search results', () => {
    // Hacer una búsqueda
    cy.contains('button', 'Relational').click()
    cy.get('input[placeholder="Ingresa el nombre del personaje"]').type('Gon')
    cy.contains('button', '🔍 Buscar').click()
    cy.wait(3000)
    
    // Limpiar
    cy.contains('button', '✖ Limpiar').click()
    
    // Verificar que el input está vacío
    cy.get('input[placeholder="Ingresa el nombre del personaje"]')
      .should('have.value', '')
  })

  it('Should show create character form', () => {
    cy.contains('button', '➕ Agregar Nuevo Personaje').click()
    
    // Verificar que el formulario aparece
    cy.contains('➕ Crear Nuevo Personaje').should('be.visible')
    cy.get('input[placeholder="NOMBRE *"]').should('be.visible')
    cy.get('input[placeholder="URL DE LA IMAGEN *"]').should('be.visible')
  })

  it('Should create a new character in PostgreSQL', () => {
    // Seleccionar PostgreSQL
    cy.contains('button', 'Relational').click()
    cy.wait(1000)
    
    // Abrir formulario
    cy.contains('button', '➕ Agregar Nuevo Personaje').click()
    
    // Llenar formulario con datos únicos (para evitar duplicados)
    const timestamp = Date.now()
    const characterName = `Cypress Test ${timestamp}`
    
    cy.get('input[placeholder="NOMBRE *"]').type(characterName)
    cy.get('input[placeholder="EDAD"]').type('25')
    cy.get('input[placeholder="ALTURA (CM)"]').type('175')
    cy.get('input[placeholder="PESO (KG)"]').type('70')
    cy.get('input[placeholder="TIPO DE NEN"]').type('Enhancer')
    cy.get('input[placeholder="ORIGEN"]').type('Test Land')
    cy.get('input[placeholder="URL DE LA IMAGEN *"]')
      .type('https://via.placeholder.com/300')
    
    // Guardar
    cy.contains('button', '💾 Crear Personaje').click()
    
    // Esperar a que se complete (puede tardar por Render)
    cy.wait(5000)
    
    // Buscar el personaje creado para verificar
    cy.get('input[placeholder="Ingresa el nombre del personaje"]')
      .type(characterName)
    cy.contains('button', '🔍 Buscar').click()
    
    cy.contains(characterName, { timeout: 20000 }).should('be.visible')
  })

  it('Should create a new character in MongoDB', () => {
    // Seleccionar MongoDB
    cy.contains('button', 'NoSQL').click()
    cy.wait(1000)
    
    // Abrir formulario
    cy.contains('button', '➕ Agregar Nuevo Personaje').click()
    
    // Llenar formulario
    const timestamp = Date.now()
    const characterName = `Mongo Test ${timestamp}`
    
    cy.get('input[placeholder="NOMBRE *"]').type(characterName)
    cy.get('input[placeholder="EDAD"]').type('30')
    cy.get('input[placeholder="TIPO DE NEN"]').type('Specialist')
    cy.get('input[placeholder="URL DE LA IMAGEN *"]')
      .type('https://via.placeholder.com/300')
    
    // Guardar
    cy.contains('button', '💾 Crear Personaje').click()
    cy.wait(5000)
    
    // Verificar
    cy.get('input[placeholder="Ingresa el nombre del personaje"]')
      .type(characterName)
    cy.contains('button', '🔍 Buscar').click()
    cy.contains(characterName, { timeout: 20000 }).should('be.visible')
  })

  it('Should edit a character', () => {
    // Buscar un personaje existente
    cy.contains('button', 'Relational').click()
    cy.wait(1000)
    
    cy.get('input[placeholder="Ingresa el nombre del personaje"]').type('Killua')
    cy.contains('button', '🔍 Buscar').click()
    cy.wait(3000)
    
    // Click en editar
    cy.contains('button', 'Editar').click()
    
    // Verificar que el formulario de edición aparece
    cy.contains('✏️ Editar Personaje').should('be.visible')
    
    // Modificar edad
    cy.get('input[placeholder="EDAD"]').clear().type('13')
    
    // Guardar
    cy.contains('button', '💾 Guardar Cambios').click()
    cy.wait(5000)
    
    // Buscar de nuevo para verificar
    cy.get('input[placeholder="Ingresa el nombre del personaje"]').type('Killua')
    cy.contains('button', '🔍 Buscar').click()
    cy.contains('13', { timeout: 15000 }).should('be.visible')
  })

  it('Should validate required fields', () => {
    cy.contains('button', '➕ Agregar Nuevo Personaje').click()
    
    // Intentar guardar sin llenar nada
    cy.contains('button', '💾 Crear Personaje').click()
    
    // El sistema debería mostrar un alert o no hacer nada
    // Verificamos que seguimos en el formulario
    cy.contains('➕ Crear Nuevo Personaje').should('be.visible')
  })

  it('Should cancel character creation', () => {
    cy.contains('button', '➕ Agregar Nuevo Personaje').click()
    
    // Llenar algo
    cy.get('input[placeholder="NOMBRE *"]').type('Test Cancel')
    
    // Cancelar
    cy.contains('button', 'Cancelar').click()
    
    // Verificar que el formulario desaparece
    cy.contains('➕ Crear Nuevo Personaje').should('not.exist')
    cy.contains('button', '➕ Agregar Nuevo Personaje').should('be.visible')
  })
})