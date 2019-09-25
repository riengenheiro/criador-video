const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apikey
const sentenceBoundaryDetection = require('sbd')

const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const watsonApiUrl = require('../credentials/watson-nlu.json').url
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');
const nLu = new NaturalLanguageUnderstandingV1({
  version: '2019-07-12',
  iam_apikey: watsonApiKey,
  url: watsonApiUrl
});

const state = require('./state.js')


async function robot(){
	const content = state.load()
	
	await fetchContentFromWikipedia(content)
	sanitizeContent(content)
	breakContentIntoSentences(content)
	limitMaximumSentences(content)
	await fetchKeywordsAllSentences(content)
	
	state.save(content)
	
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
	
	function limitMaximumSentences(content){
		content.sentences = content.sentences.slice(0, content.maximumSentences)		
	}
	
	async function fetchKeywordsAllSentences(content){
			for (const sentence of content.sentences){
				sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
			}
	}
	
	async function fetchWatsonAndReturnKeywords(sentence){
		return new Promise((resolve, reject) => {
			nLu.analyze({
				'text': sentence,
				'features': {
				'keywords': {}
				}		
			}, (error, response) => {
			if (error){
				throw error
			}			
			const keywords = response.keywords.map((keyword) => {return keyword.text})			
			resolve(keywords)
			})
		})
	}
	
	
}
module.exports = robot
