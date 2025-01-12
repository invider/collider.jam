const env = require('./env')

const ALERT_URL = 'http://ubilling.net.ua/aerialalerts/'

module.exports = {

    checkAlerts: function() {
        fetch(ALERT_URL)
            .then((response) => response.json())
            .then((body) => {
                body.regions = {}
                Object.keys(body.states).forEach(name => {
                    const searchKey = name.replace('область', '').replace('м.', '').trim().toLowerCase()
                    body.regions[searchKey] = body.states[name]
                    body.regions[searchKey].name = name
                })
                env.war = body.regions
                //console.dir(body.regions)
            })
    }

}
