describe('snapshots', () => {
  it('test Percy', () => {
    cy.visit('/')
    cy.get('.sidebar').then( sideBar => {
      cy.wait(1000)
      cy.percySnapshot('tagList')
    })
  });
})
