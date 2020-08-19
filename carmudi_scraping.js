const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const { version } = require('os')

const site = 'https://carmudi.vn'
const filter = 'https://www.carmudi.vn/mua-ban-o-to/'


const getCarList = async () => {
	try {
        const carList = []
        for (let page=1; page <= 5; page++){
            const { data } = await axios.get(`${filter}index${page}.html`);
            const $ = cheerio.load(data);
            let list = $('a.title')
            for (let i=0; i< list.length; i++){
                const item = list.get(i)
                const postLink = $(item).attr('href')
                const carDetails = await getCarDetails(postLink)
                carList.push(carDetails)
            }
        }
        return carList 
    }  
    catch (error) { throw error; }
};


const getCarDetails = async (fullLink) => {
    try {
        let { data } = await axios.get(fullLink)
        const $ = cheerio.load(data)

        let carDetails = {}

        const priceItem = $("*[data-price]").data('price')
        carDetails['price'] = parseInt(priceItem.split('.').join(''));

        const carItems = ['brand', 'model', 'carVersion', 'productionDate', 'status', 'gear', 'area', 'type', 'fuel', 'seatingCap', 'color', 'origin']

        for (let i=0; i<carItems.length; i++){
            if (i<2) {
                carDetails[carItems[i]]  = (id => {
                    let selector = $('div.feature-item > span').get(id)
                    return $(selector).text().trim()
                })(i)
            } else {
                carDetails[carItems[i]] = (id => {
                    let selector = $('div.feature-item').get(id)
                    return item = $(selector).contents().filter(function() {
                        return this.nodeType === 3;
                    }).text().split(':')[1].trim()
                })(i)
            }
        }
        let nameValue = carDetails['brand'] + ' ' + carDetails['model']
        carDetails = Object.assign({name : nameValue}, carDetails)

        return carDetails
    } catch (error) {
        throw error
    }
}

getCarList()
.then(data => { 
    fileName = path.join(__dirname, './output/carmudi_scraping')
    try {
        if (fs.existsSync(fileName)) { 
            fs.unlinkSync(fileName)
            console.log('Deleted old file'); }
        fs.writeFileSync(fileName, JSON.stringify(data, null,' '))
        console.log('Sucessfully export car list');
    } 
    catch (err) { throw err}
})
.catch(err => { throw err })


