const axios = require('axios');
const cheerio = require('cheerio');

const getPostTitles = async () => {
	try {
		const { data } = await axios.get(
			'https://www.yellowpages.vnn.vn/cls/268180/may-dong-phuc.html'
		);
		const $ = cheerio.load(data);
		const postTitles = [];

		$('div > h2.company_name > a').each((_idx, el) => {
			const postTitle = $(el).text()
			postTitles.push(postTitle)
		});

		return postTitles;
	} catch (error) {
		throw error;
	}
};

getPostTitles()
.then((postTitles) => console.log(postTitles));