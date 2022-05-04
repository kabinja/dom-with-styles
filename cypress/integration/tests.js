// test suite name
describe('Tutorialspoint Test', function () {
    // Test case
    it('Scenario 1', function () {
        // test step for URL launching
        cy.visit("./cypress/fixtures/test1.html");
    });
});