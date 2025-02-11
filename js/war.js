const env = require('./env')

const ALERT_URL = 'http://ubilling.net.ua/aerialalerts/'

const aliases = {
    "київ":              "Kyiv",
    "вінницька":         "Vinnytsia Region",
    "волинська":         "Volyn Region",
    "дніпропетровська":  "Dnipropetrovsk Region",
    "донецька":          "Donetsk Region",
    "житомирська":       "Zhytomyr Region",
    "закарпатська":      "Zakarpattia Region",
    "запорізька":        "Zaporizhzhia Region",
    "івано-франківська": "Ivano-Frankivsk Region",
    "київська":          "Kyiv Region",
    "кіровоградська":    "Kirovohrad Region",
    "луганська":         "Luhansk Region",
    "львівська":         "Lviv Region",
    "миколаївська":      "Mykolaiv Region",
    "одеська":           "Odesa Region",
    "полтавська":        "Poltava Region",
    "рівненська":        "Rivne Region",
    "сумська":           "Sumy Region",
    "тернопільська":     "Ternopil Region",
    "харківська":        "Kharkiv Region",
    "херсонська":        "Kherson Region",
    "хмельницька":       "Khmelnytskyi Region",
    "черкаська":         "Cherkasy Region",
    "чернівецька":       "Chernivtsi Region",
    "чернігівська":      "Chernihiv Region",
}


module.exports = {

    checkAlerts: function() {
        fetch(ALERT_URL)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    return response.text().then(text => {
                        throw new Error(`Error #${response.status}:\n ${text}`)
                    })
                }
            })
            .then((body) => {
                body.regions = {}
                Object.keys(body.states).forEach(name => {
                    const searchKey = name.replace('область', '').replace('м.', '').trim().toLowerCase()
                    body.regions[searchKey] = body.states[name]
                    body.regions[searchKey].name = name
                    body.regions[searchKey].alias = aliases[searchKey]
                })
                env.war = body.regions
            })
            .catch(
                error => `Failed to check air raid alerts! ${error}`
            )
    }

}
