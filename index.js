const readline = require('readline-sync')
const robots={
	text: require('./robots/text.js')
}

async function start() {
	const content = {}

	content.searchTerm = askAndReturnSearchTerm()
	content.prefix = askAndReturnPrefix()

	await robots.text(content)

	function askAndReturnSearchTerm(){
		return readline.question('Termo que sera usado na Busca do Wikipedia: ')
	}

	function askAndReturnPrefix(){
	    const prefixes = ['Qual','O que e','Quem foi','Como foi', 'Onde foi']
		const selectedPrefixIndex =  readline.keyInSelect(prefixes, 'escolha uma opcao: ')
		const selectedPrefixText = prefixes[selectedPrefixIndex]

		return selectedPrefixText
	}

	console.log(content)
}
start()
