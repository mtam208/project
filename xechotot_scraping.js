const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

const site = 'https://xe.chotot.com'
const filter = 'https://xe.chotot.com/mua-ban-oto?fbclid=IwAR18Yz8_sywuORwgHKYx6QxHEt0F91W8DcyErQLAN0LwCkcsy_uLtGdAcj8'


const getCarList = async () => {
	try {
        const carList = []
        for (let page=1; page <= 10; page++){
            const { data } = await axios.get(`${filter}&page${page}`);
            const $ = cheerio.load(data);
            let list = $('div.ctAdlisting > ul > li > a')
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

const getCarDetails = async (postLink) => {
    try {
        fullLink = site + postLink
        let { data } = await axios.get(fullLink)
        const $ = cheerio.load(data)

        brandItem = $("*[itemprop='brand']").get(0)
        brand = $(brandItem).text().trim() 

        modelItem = $("*[itemprop='model']").get(0)
        model = $(modelItem).text().trim()

        name = brand + ' ' + model

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
            name: name,
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

getCarList()
.then(data => { 
    fileName = path.join(__dirname, './output/xechotot_scraping')
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


