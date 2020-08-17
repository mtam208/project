const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const { stringify } = require('querystring')

const filePath = './output'

const site = 'https://xe.chotot.com'
const filter = 'https://xe.chotot.com/mua-ban-oto?fbclid=IwAR18Yz8_sywuORwgHKYx6QxHEt0F91W8DcyErQLAN0LwCkcsy_uLtGdAcj8'

const getCarList = async () => {
	try {
		const { data } = await axios.get(filter);
		const $ = cheerio.load(data);
		const carList = [];

		$('div.ctAdlisting > ul > li > a').each((_idx, el) => {
            const postLink = $(el).attr('href')
            getCarDetails(postLink)
            .then(data=>{ 
                console.log(data);
                carList.push(data)
            })
            .catch(err=> { throw err })
        });
        return carList
	} catch (error) {
		throw error;
	}
};

const getCarDetails = async (postLink) => {
    try {
        fullLink = site + postLink
        let { data } = await axios.get(fullLink)
        const $ = cheerio.load(data)

        brandItem = $("*[itemprop='brand']").get(0)
        brand = $(brandItem).text().trim() 

        modelItem = $("*[itemprop='model']").get(0)
        model = $(modelItem).text().trim()

        title = brand + ' ' + model

        priceItem = $("*[itemprop='price']").get(0)
        price = parseInt($(priceItem).text().trim().split(/[ .]/).splice(0,3).join(''))
        
        productionDateItem = $("*[itemprop='productionDate']").get(0)
        productionDate = $(productionDateItem).text().trim()

        mileage = $('span').filter(function() {
            return $(this).text().trim() === 'Số Km đã đi:';
          }).next().text().trim()

        status = $('span').filter(function() {
            return $(this).text().trim() === 'Tình trạng:';
        }).next().text().trim()

        gear = $('span').filter(function() {
            return $(this).text().trim() === 'Hộp số:';
        }).next().text().trim()

        fuel = $('span').filter(function() {
            return $(this).text().trim() === 'Nhiên liệu:';
        }).next().text().trim()

        origin = $('span').filter(function() {
            return $(this).text().trim() === 'Xuất xứ:';
        }).next().text().trim()

        type = $('span').filter(function() {
            return $(this).text().trim() === 'Kiểu dáng:';
        }).next().text().trim()

        seatingCapItem = $("*[itemprop='vehicleSeatingCapacity']").get(0)
        seatingCap = $(seatingCapItem).text().trim()

        area = $('span.fz13').text().trim()

        carDetails = {
            title: title,
            price: price,
            brand: brand,
            model: model,
            productionDate: productionDate,
            mileage: mileage,
            status: status,
            gear: gear,
            fuel: fuel,
            origin: origin,
            type: type,
            seatingCap: seatingCap,
            area: area
        }
        return carDetails
    } catch (error) {
        throw error
    }
}
// getCarList().then(data=>{
//     console.log(data);
// })
getCarList()
