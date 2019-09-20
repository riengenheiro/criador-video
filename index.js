const readline = require('readline-sync')

function start() {
	const content = {}

	content.seachTerm = askAndReturnSearchTerm()
	content.prefix = askAndReturnPrefix()

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
