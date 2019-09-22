const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content){
	await fetchContentFromWikipedia(content)
	sanitizeContent(content)
	breakContentIntoSentences(content)
	
	async function fetchContentFromWikipedia(content) {
		console.log('> [text-robot] Fetching content from Wikipedia')
		const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
		const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
		const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
		const wikipediaContent = wikipediaResponse.get()

		content.sourceContentOriginal = wikipediaContent.content
		console.log('> [text-robot] Fetching done!')
  }
	
	function sanitizeContent(content){
		const withoutBlankLinesAndMarkdown = removeBlanklinesAndMarkdown(content.sourceContentOriginal)
		const withoutDateInParentheses = removeDateInParentheses(withoutBlankLinesAndMarkdown)
		
		content.sourceContentSanitized = withoutDateInParentheses
		
		function removeBlanklinesAndMarkdown(text){
			const allLines = text.split('\n')
			
			const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
				if (line.trim().length === 0 || line.trim().startsWith('=')){
					return false
				}
			return true})
			
			return withoutBlankLinesAndMarkdown.join(' ')
		}
	}

	function removeDateInParentheses(text){
		return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
	}	

	function breakContentIntoSentences(content) {
		content.sentences = []

		const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
		sentences.forEach((sentence) => {
		  content.sentences.push({
			text: sentence,
			keywords: [],
			images: []
			})
		})
	}			
	
}
module.exports = robot
