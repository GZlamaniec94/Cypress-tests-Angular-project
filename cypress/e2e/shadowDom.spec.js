describe('shadow dom', () => {
  it('test shadow dom', () => {
    cy.visit('https://radogado.github.io/shadow-dom-demo/')
    cy.get('#app').shadow().find('#container')
  });
})
