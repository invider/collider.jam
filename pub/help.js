
const FIELD = 'searchField'

const cache = {}

function cleanMeta() {
    const help = document.getElementById('help')

    help.innerHTML = ''
}

function printMeta(content) {
    help.innerHTML += '<p>' + content + '</p>'
}

function printResults(res) {
    res.forEach(meta => {
        printMeta(
            meta.path + '<br>'
            + meta.type + ' - ' + meta.name)
    })
}

function filter(data, string, tags) {
    console.log('filtering: ' + string)
    const res = []

    function subfilter(meta) {
        if (!meta) return
        if (meta.type === 'function') {
            if (meta.name
                    && meta.name.toLowerCase().includes(string)) {
                res.push(meta)
            }
        } else if (meta.dir) {
            Object.values(meta.dir).forEach(submeta => {
                subfilter(submeta)
            })
        }
    }
    subfilter(data)

    return res
}

function search(data, string) {
    cleanMeta()

    const res = filter(data, string.trim().toLowerCase())

    printResults(res)
}

function update(data) {
    cache.data = data
    search(data, '')
}

function loadMeta() {

    fetch('help/data').then(res => {
        if (res.status !== 200) return
        return res.json()
    }).then(json => {
        if (json) {
            update(json)
        } else {
            // notify missing data
            //
        }
    })
}

function setup() {
    const field = document.getElementById(FIELD)
    field.onkeyup = function() {
        search(cache.data, field.value)
    }

    loadMeta()
}

window.onload = setup
window.onkeydown = function(e) {
    if (e.repeat) return

    if (e.code === 'Escape' || e.code === 'Backspace') {
        const field = document.getElementById(FIELD)
        field.focus()
    }
}
