
describe('Test', () => {
  beforeEach('open application', () =>{
    cy.intercept({ method: 'Get', path: 'tags' }, { fixture: 'tags.json' }).as('getTags')
    cy.loginToApp()
  })

  it('verify correct request and response', () => {
    cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles')

    cy.contains('New Article').click()
    cy.get('[ng-reflect-name="title"]').type('Title12345')
    cy.get('[ng-reflect-name="description"]').type('This is description')
    cy.get('[ng-reflect-name="body"]').type('This is a body of the article')
    cy.contains('Publish Article').click()

    cy.wait('@postArticles').then( xhr =>{
      console.log(xhr)
      expect(xhr.response.statusCode).to.equal(200)
      expect(xhr.request.body.article.body).to.equal('This is a body of the article')
      expect(xhr.response.body.article.description).to.equal('This is description')
    })
  });

  it('verify popular tags are displayed', () => {
    cy.get('.tag-list').should('contain', 'tag1').and('contain', 'tag2').and('contain', 'tag3')
  });

  it('verify global feed likes count', () => {
    cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', {"articles":[],"articlesCount":0})
    cy.intercept('GET', 'https://api.realworld.io/api/articles*', { fixture: 'articles.json'})

    cy.contains('Global Feed').click()
    cy.get('app-article-list button').then( heartList =>{
      expect(heartList[0]).to.contain(1)
      expect(heartList[1]).to.contain(5)
    })

    cy.fixture('articles').then( file => {
      const articleSlug =  file.articles[1].slug
      file.articles[1].favoritesCount = 6
      cy.intercept('POST', 'https://api.realworld.io/api/articles/'+articleSlug+'/favorite', file)
    })

    cy.get('app-article-list button').eq(1).click().should('contain', '6')
  });

  it('intercepting and modifying the request and response', () => {

    // cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req)=>{
    //   req.body.article.description = 'This is description 2'
    // }).as('postArticles')

    cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req)=>{
      req.reply( res => {
        expect(res.body.article.description).to.equal('This is description')
        res.body.article.description = 'This is description 2'
      })
    }).as('postArticles')

    cy.contains('New Article').click()
    cy.get('[ng-reflect-name="title"]').type( `Article title ${Cypress._.random(0, 1e6)}`)
    cy.get('[ng-reflect-name="description"]').type('This is description')
    cy.get('[ng-reflect-name="body"]').type('This is a body of the article')
    cy.contains('Publish Article').click()

    cy.wait('@postArticles').then( xhr =>{
      console.log(xhr)
      expect(xhr.response.statusCode).to.equal(200)
      expect(xhr.request.body.article.body).to.equal('This is a body of the article')
      expect(xhr.response.body.article.description).to.equal('This is description 2')
    })
  });

  it.only('delete new article in global feed', () => {

    const bodyRequest = {
      "article": {
          "tagList": [], 
          "title": "Request from Api", 
          "description": "Api testing in easy", 
          "body": "Angular is cool"
      }
  }

    cy.get('@token').then( token =>{

      cy.request({
        url: 'https://api.realworld.io/api/articles/',
        headers: {'Authorization': 'Token '+token},
        method: 'POST',
        body: bodyRequest
      }).then( response => {
        expect(response.status).to.equal(200)
      })

      cy.contains('Global Feed').click()
      cy.get('.article-preview').first().click()
      cy.get('.article-actions').contains('Delete Article').click()
      cy.wait(1000)
      cy.request({
        url: 'https://api.realworld.io/api/articles?limit=10&offset=0',
        headers: {'Authorization': 'Token '+token},
        method: 'GET'
      }).its('body').then( body =>{
        expect(body.articles[0].title).not.to.equal("Request from Api")
      })
    })
  });
})
