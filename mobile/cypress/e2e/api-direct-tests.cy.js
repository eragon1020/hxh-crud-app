describe('API Tests - Direct Calls', () => {
  
  describe('PostgreSQL API Tests', () => {
    
    it('Should GET all characters from PostgreSQL', () => {
      cy.request({
        method: 'GET',
        url: 'https://hxh-crud-app.onrender.com/characters',
        timeout: 20000
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.be.an('array')
        expect(response.body.length).to.be.greaterThan(0)
        
        // Verificar estructura de personajes
        const character = response.body[0]
        expect(character).to.have.property('id')
        expect(character).to.have.property('name')
        expect(character).to.have.property('nen_type')
        expect(character).to.have.property('image_url')
      })
    })

    it('Should find specific characters in PostgreSQL (Gon, Killua, etc)', () => {
      cy.request({
        method: 'GET',
        url: 'https://hxh-crud-app.onrender.com/characters',
        timeout: 20000
      }).then((response) => {
        const names = response.body.map(c => c.name)
        
        // Verificar que al menos uno de los personajes base existe
        const expectedNames = ['Gon', 'Killua', 'Kurapika', 'Leorio']
        const hasBaseCharacter = expectedNames.some(name => 
          names.some(n => n.includes(name))
        )
        
        expect(hasBaseCharacter).to.be.true
      })
    })

    it('Should CREATE a character in PostgreSQL', () => {
      const newCharacter = {
        name: `API Test ${Date.now()}`,
        age: 20,
        height_cm: 170,
        weight_kg: 65,
        nen_type: 'Enhancer',
        origin: 'Test City',
        image_url: 'https://via.placeholder.com/300',
        notes: 'Created by Cypress API test'
      }

      cy.request({
        method: 'POST',
        url: 'https://hxh-crud-app.onrender.com/characters',
        body: newCharacter,
        timeout: 20000
      }).then((response) => {
        expect(response.status).to.eq(201)
        expect(response.body).to.have.property('id')
        expect(response.body.name).to.eq(newCharacter.name)
        expect(response.body.nen_type).to.eq(newCharacter.nen_type)
      })
    })

    it('Should GET a specific character by ID', () => {
      // Primero obtener todos los personajes
      cy.request('GET', 'https://hxh-crud-app.onrender.com/characters')
        .then((response) => {
          const firstCharacter = response.body[0]
          const characterId = firstCharacter.id
          
          // Ahora obtener ese personaje específico
          cy.request(`https://hxh-crud-app.onrender.com/characters/${characterId}`)
            .then((singleResponse) => {
              expect(singleResponse.status).to.eq(200)
              expect(singleResponse.body.id).to.eq(characterId)
              expect(singleResponse.body).to.have.property('name')
            })
        })
    })

    it('Should return 404 for non-existent character', () => {
      cy.request({
        method: 'GET',
        url: 'https://hxh-crud-app.onrender.com/characters/99999',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404)
        expect(response.body).to.have.property('error')
      })
    })
  })

  describe('MongoDB API Tests', () => {
    
    it('Should GET all characters from MongoDB', () => {
      cy.request({
        method: 'GET',
        url: 'https://hxh-nosql.onrender.com/characters',
        timeout: 20000
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.be.an('array')
        expect(response.body.length).to.be.greaterThan(0)
        
        // Verificar estructura
        const character = response.body[0]
        expect(character).to.have.property('_id')
        expect(character).to.have.property('name')
      })
    })

    it('Should find Phantom Troupe members in MongoDB', () => {
      cy.request({
        method: 'GET',
        url: 'https://hxh-nosql.onrender.com/characters',
        timeout: 20000
      }).then((response) => {
        const names = response.body.map(c => c.name)
        
        // Verificar que hay miembros de la Phantom Troupe
        const troupe = ['Hisoka', 'Chrollo', 'Illumi', 'Feitan', 'Machi']
        const hasTroupeMember = troupe.some(name => 
          names.some(n => n.includes(name))
        )
        
        expect(hasTroupeMember).to.be.true
      })
    })

    it('Should CREATE a character in MongoDB', () => {
      const newCharacter = {
        name: `Mongo API Test ${Date.now()}`,
        age: 25,
        nen_type: 'Specialist',
        image_url: 'https://via.placeholder.com/300',
        notes: 'Created by Cypress'
      }

      cy.request({
        method: 'POST',
        url: 'https://hxh-nosql.onrender.com/characters',
        body: newCharacter,
        timeout: 20000
      }).then((response) => {
        expect(response.status).to.eq(201)
        expect(response.body).to.have.property('_id')
        expect(response.body.name).to.eq(newCharacter.name)
      })
    })
  })

  describe('API Validation Tests', () => {
    
    it('Should reject creation without required fields (PostgreSQL)', () => {
      cy.request({
        method: 'POST',
        url: 'https://hxh-crud-app.onrender.com/characters',
        body: { age: 20 }, // Missing name and image_url
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.error).to.include('required')
      })
    })

    it('Should reject creation without required fields (MongoDB)', () => {
      cy.request({
        method: 'POST',
        url: 'https://hxh-nosql.onrender.com/characters',
        body: { age: 25 }, // Missing name and image_url
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.error).to.include('required')
      })
    })
  })

  describe('Swagger Documentation Tests', () => {
    
    it('Should access PostgreSQL Swagger docs', () => {
      cy.request('https://hxh-crud-app.onrender.com/api-docs/')
        .then((response) => {
          expect(response.status).to.eq(200)
        })
    })

    it('Should access MongoDB Swagger docs', () => {
      cy.request('https://hxh-nosql.onrender.com/api-docs/')
        .then((response) => {
          expect(response.status).to.eq(200)
        })
    })
  })
})