const readline = require('readline-sync')
const state = require('./state.js')

function robot() {
  const content = {
    maximumSentences: 7
  }

  content.searchTerm = askAndReturnSearchTerm()
  content.prefix = askAndReturnPrefix()
  state.save(content)

  function askAndReturnSearchTerm() {
    return readline.question('Termo que sera usado na Busca do Wikipedia: ')
  }

  function askAndReturnPrefix() {
    const prefixes = ['Qual','O que e','Quem foi','Como foi', 'Onde foi']
	const selectedPrefixIndex =  readline.keyInSelect(prefixes, 'escolha uma opcao: ')
    const selectedPrefixText = prefixes[selectedPrefixIndex]

    return selectedPrefixText
  }

}

module.exports = robot