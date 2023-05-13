module.exports = {
  ...require('./typedoc.base'),
  plugin: ['typedoc-plugin-markdown'],
  hideInPageTOC: false,
  indexPageTitle: 'Overview',
  indentifiersAsCodeBlocks: true,
  propertiesFormat: 'table',
  enumMembersFormat: 'table',
  typeDeclarationFormat: 'table',
  readme: 'none',
  outputFileStrategy: 'modules',
};